"""Build the one-line logo strip for the portfolio site (run from the site folder)."""
import os
import re
import urllib.request

L = "assets/logos"
# keep only the wordmarks we use, with clean names
keep = {"svgl-claude.svg": "claude.svg", "logos-openai.svg": "openai.svg", "svgl-gemini.svg": "gemini.svg",
        "svgl-grok.svg": "grok.svg", "svgl-perplexity.svg": "perplexity.svg", "svgl-deepseek.svg": "deepseek.svg",
        "logos-pytorch.svg": "pytorch.svg", "logos-ffmpeg.svg": "ffmpeg.svg", "logos-zapier.svg": "zapier.svg",
        "svgl-n8n.svg": "n8n.svg", "svgl-github.svg": "github.svg", "svgl-nvidia.svg": "nvidia.svg"}
if any(f in keep for f in os.listdir(L)):
    for f in os.listdir(L):
        if f in keep:
            os.replace(os.path.join(L, f), os.path.join(L, "_" + keep[f]))
        else:
            os.remove(os.path.join(L, f))
    for f in os.listdir(L):
        os.replace(os.path.join(L, f), os.path.join(L, f[1:]))

PATH_RE = re.compile(r'<path d="([^"]+)"')


def si(slug):
    """Simple Icons symbol (CC0 data) as an inline SVG."""
    url = f"https://cdn.jsdelivr.net/npm/simple-icons@16.33.0/icons/{slug}.svg"
    d = PATH_RE.search(urllib.request.urlopen(url, timeout=30).read().decode()).group(1)
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'


H = {"claude": 26, "openai": 26, "gemini": 26, "grok": 28, "perplexity": 28, "deepseek": 24, "pytorch": 24,
     "ffmpeg": 24, "zapier": 24, "n8n": 22, "github": 20, "nvidia": 20}


VB_RE = re.compile(r'viewBox="[\d.\-]+[ ,]+[\d.\-]+[ ,]+([\d.]+)[ ,]+([\d.]+)"')


def wm(slug, name):
    """Real wordmark image, its width fixed up front so the strip never jumps while logos load."""
    svg = open(os.path.join(L, slug + ".svg"), encoding="utf-8").read()
    vw, vh = map(float, VB_RE.search(svg).groups())
    h = H[slug]
    w = round(h * vw / vh)
    return (f'<span class="tool"><img src="assets/logos/{slug}.svg" alt="{name}" '
            f'width="{w}" height="{h}" style="width:{w}px;height:{h}px"></span>')


def sym(slug, name):
    """Official symbol plus the name."""
    return f'<span class="tool">{si(slug)}<b>{name}</b></span>'


def tile(letters, name):
    """Letter tile for brands without a public logo file."""
    return f'<span class="tool"><i class="tile" aria-hidden="true">{letters}</i><b>{name}</b></span>'


items = [wm("claude", "Claude"), wm("openai", "OpenAI"), wm("gemini", "Gemini"), wm("grok", "Grok"),
         wm("perplexity", "Perplexity"), wm("deepseek", "DeepSeek"), sym("notebooklm", "NotebookLM"),
         sym("modelcontextprotocol", "MCP"), sym("huggingface", "Hugging Face"), sym("python", "Python"),
         wm("pytorch", "PyTorch"), sym("opencv", "OpenCV"), wm("ffmpeg", "FFmpeg"), tile("HF", "HyperFrames"),
         tile("Pr", "Premiere Pro"), tile("Ae", "After Effects"), tile("Ps", "Photoshop"), tile("Ai", "Illustrator"),
         sym("davinciresolve", "DaVinci Resolve"), tile("Cc", "CapCut"), tile("Ca", "Canva"), wm("zapier", "Zapier"),
         sym("make", "Make"), wm("n8n", "n8n"), sym("notion", "Notion"), wm("github", "GitHub"), wm("nvidia", "NVIDIA")]
# Two identical halves written straight into the HTML (the loop slides exactly one half);
# the second half is hidden from screen readers.
copies = [i.replace('<span class="tool">', '<span class="tool" aria-hidden="true">', 1) for i in items]
block = ('<div class="marquee" aria-label="Tools I use">\n  <div class="track logos">\n    '
         + "\n    ".join(items + copies) + "\n  </div>\n</div>")
p = "index.html"
s = open(p, encoding="utf-8").read()
s, n = re.subn(r'<div class="marquee".*?\n</div>\n', lambda m: block + "\n", s, count=1, flags=re.S)
assert n == 1
open(p, "w", encoding="utf-8").write(s)
print("items:", len(items), "| logo files:", sorted(os.listdir(L)))
