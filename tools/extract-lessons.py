# Extracts GetCourse verstka knowledge from saved lesson HTML pages.
# For each lesson: pulls code snippets (<pre>/<textarea>/<code>) and readable
# lesson text (techniques/explanations), writes a clean .md to _extracted/.
# Usage: python tools/extract-lessons.py
import re, html, os, glob

SRC = os.path.join(os.path.dirname(__file__), '..', 'brief', 'course-verstka')
OUT = os.path.join(SRC, '_extracted')
os.makedirs(OUT, exist_ok=True)
FENCE = chr(96) * 3  # ``` without putting backticks in shell

def unesc(s):
    return html.unescape(s).replace('\xa0', ' ')

def strip_tags(s):
    return re.sub(r'(?is)<[^>]+>', '', s)

def lesson_text(t):
    # remove platform scripts/styles, keep visible content, collapse to lines
    t = re.sub(r'(?is)<script.*?</script>', ' ', t)
    t = re.sub(r'(?is)<style.*?</style>', ' ', t)
    t = re.sub(r'(?is)<(br|/p|/div|/h[1-6]|/li|/td)>', '\n', t)
    t = unesc(strip_tags(t))
    seen, out = set(), []
    for ln in t.splitlines():
        ln = ' '.join(ln.split())
        if len(ln) >= 4 and ln not in seen:
            seen.add(ln); out.append(ln)
    return out

index = []
for f in sorted(glob.glob(os.path.join(SRC, '*.html'))):
    name = os.path.splitext(os.path.basename(f))[0]
    raw = open(f, encoding='utf-8', errors='ignore').read()

    snips = []
    for tag in ('pre', 'textarea', 'code'):
        for m in re.findall(r'(?is)<' + tag + r'[^>]*>(.*?)</' + tag + r'>', raw):
            x = unesc(strip_tags(m)).strip()
            if len(x) >= 12 and x not in snips:
                snips.append(x)

    text = lesson_text(raw)

    md = ['# ' + name, '', '## Код-сниппеты (' + str(len(snips)) + ')', '']
    for i, s in enumerate(snips, 1):
        md += ['### snippet ' + str(i), FENCE, s[:6000], FENCE, '']
    md += ['', '## Текст урока (приёмы)', '']
    md += text
    open(os.path.join(OUT, name + '.md'), 'w', encoding='utf-8').write('\n'.join(md))
    index.append((name, len(snips), sum(len(s) for s in snips), len(text)))

print('snip  codeChars  textLines  lesson')
for n, c, ch, tl in index:
    print(f'{c:>3}  {ch:>8}  {tl:>6}   {n}')
print('files:', len(index))
