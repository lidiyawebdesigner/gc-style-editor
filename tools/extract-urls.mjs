// Достаёт реальные Tilda-CDN URL картинок с живой страницы (по data-original/src/srcset/bg).
// Запуск: node tools/extract-urls.mjs <url>
import { chromium } from 'playwright';

const url = process.argv[2];
if (!url) { console.error('usage: node extract-urls.mjs <url>'); process.exit(1); }

let browser;
try { browser = await chromium.launch({ channel: 'chrome' }); }
catch { browser = await chromium.launch(); }
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(()=>{});
await page.waitForTimeout(800);

const urls = await page.evaluate(() => {
  const out = new Set();
  const push = (u) => { if (u && /tildacdn\.com/.test(u)) out.add(u.split(' ')[0]); };
  for (const el of document.querySelectorAll('*')) {
    push(el.getAttribute && el.getAttribute('src'));
    push(el.getAttribute && el.getAttribute('data-original'));
    const ss = el.getAttribute && el.getAttribute('srcset');
    if (ss) ss.split(',').forEach(s => push(s.trim()));
    const bg = getComputedStyle(el).backgroundImage;
    if (bg && bg !== 'none') { const m = bg.match(/url\(["']?(.*?)["']?\)/); if (m) push(m[1]); }
  }
  return [...out];
});
await browser.close();

// группируем по tild-хешу, чтобы легко матчить с локальными именами
const byHash = {};
for (const u of urls) {
  const m = u.match(/tild[0-9a-f-]{20,}/);
  const h = m ? m[0] : '_';
  (byHash[h] ||= []).push(u);
}
console.log(JSON.stringify(byHash, null, 2));
console.log('\nВсего уникальных:', urls.length);
