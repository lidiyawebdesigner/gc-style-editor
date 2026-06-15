// gc-tester render harness — реальный headless Chrome через Playwright.
// Рендерит HTML на 4 брейкпоинтах, ловит горизонтальный overflow + элементы,
// вылезающие за вьюпорт, проверяет статусы сетевых запросов (битые картинки/CDN),
// сохраняет полноразмерные скриншоты. Вывод — report.json + PNG в outdir.
//
// Запуск:  node tools/render-test.mjs <путь-к-.html> [outdir]
// По умолчанию outdir = <папка файла>/_test-<имя>

import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

const fileArg = process.argv[2];
if (!fileArg) {
  console.error('usage: node render-test.mjs <html-file> [outdir]');
  process.exit(1);
}
const absFile = path.resolve(fileArg);
const outDir = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.join(path.dirname(absFile), '_test-' + path.basename(absFile).replace(/\.html?$/i, ''));
mkdirSync(outDir, { recursive: true });

// 4 брейкпоинта Лиды
const VIEWPORTS = [
  { name: 'desktop',  width: 1440, height: 900 },
  { name: 'h-tablet', width: 1024, height: 768 },
  { name: 'v-tablet', width: 768,  height: 1024 },
  { name: 'mobile',   width: 375,  height: 812 },
];

const url = pathToFileURL(absFile).href;

let browser;
try {
  // системный Chrome — без скачивания браузеров Playwright, максимально близко к проду
  browser = await chromium.launch({ channel: 'chrome' });
} catch {
  // фолбэк на бандл-chromium, если системный Chrome не нашёлся
  browser = await chromium.launch();
}

const ctx = await browser.newContext({ deviceScaleFactor: 1 });
const failedRequests = [];
ctx.on('response', (r) => {
  const s = r.status();
  if (s >= 400) failedRequests.push({ url: r.url(), status: s });
});
ctx.on('requestfailed', (r) => {
  failedRequests.push({ url: r.url(), status: 'failed', error: r.failure()?.errorText || '' });
});

const report = { file: absFile, url, outDir, viewports: [], failedRequests: [] };

for (const vp of VIEWPORTS) {
  const page = await ctx.newPage();
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(500); // дать дорисоваться шрифтам/lazyload

  const metrics = await page.evaluate((vw) => {
    const de = document.documentElement;
    const docW = Math.max(de.scrollWidth, document.body ? document.body.scrollWidth : 0);
    const overflowPx = Math.max(0, docW - vw);
    const offenders = [];
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      // элемент вылезает за правый край вьюпорта или уходит левее нуля
      if (r.right > vw + 2 || r.left < -2) {
        let sel = el.tagName.toLowerCase();
        if (el.id) sel += '#' + el.id;
        else if (typeof el.className === 'string' && el.className.trim())
          sel += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
        offenders.push({ sel, left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) });
      }
    }
    return {
      docWidth: docW,
      horizontalOverflowPx: overflowPx,
      hasHorizontalOverflow: overflowPx > 1,
      offendersTotal: offenders.length,
      offenders: offenders.slice(0, 15),
    };
  }, vp.width);

  const shot = path.join(outDir, vp.name + '.png');
  await page.screenshot({ path: shot, fullPage: true });
  report.viewports.push({ ...vp, ...metrics, screenshot: shot });
  await page.close();
}

report.failedRequests = failedRequests;
await browser.close();

writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));

// краткая сводка в stdout
for (const v of report.viewports) {
  console.log(
    `${v.name.padEnd(9)} ${v.width}px  overflow=${v.hasHorizontalOverflow ? '❌ ' + v.horizontalOverflowPx + 'px' : '✅'}  offenders=${v.offendersTotal}  shot=${path.basename(v.screenshot)}`
  );
}
if (report.failedRequests.length) {
  console.log('\nБитые запросы (' + report.failedRequests.length + '):');
  for (const f of report.failedRequests.slice(0, 20)) console.log('  ' + f.status + '  ' + f.url);
} else {
  console.log('\nБитых запросов нет (все картинки/ресурсы загрузились).');
}
console.log('\nreport.json + скриншоты: ' + outDir);
