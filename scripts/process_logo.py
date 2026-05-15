"""Detach the Zella ZB logo from its mauve background and emit recolored,
transparent PNGs. The mark is flat cream on flat mauve, so we derive a
smooth alpha by projecting each pixel onto the bg->cream colour line.
This keeps antialiased edges crisp and lets us recolour with no fringe."""

import numpy as np
from PIL import Image

SRC = "images/logo-source.png"

INK = (33, 26, 19)        # site --ink   (header, light paper)
CREAM = (247, 241, 232)   # site --paper (footer, dark surfaces)

im = Image.open(SRC).convert("RGB")
arr = np.asarray(im).astype(np.float32)
H, W, _ = arr.shape

# Background = median of a border frame.
frame = np.concatenate([
    arr[:8, :, :].reshape(-1, 3), arr[-8:, :, :].reshape(-1, 3),
    arr[:, :8, :].reshape(-1, 3), arr[:, -8:, :].reshape(-1, 3),
])
bg = np.median(frame, axis=0)

# Cream = mean of the brightest 0.5% of pixels.
lum = arr @ np.array([0.299, 0.587, 0.114], np.float32)
thresh = np.percentile(lum, 99.5)
cream = arr[lum >= thresh].mean(axis=0)

print("bg   ", bg.round(1).tolist())
print("cream", cream.round(1).tolist())

# alpha = clamp( (p-bg)·(cream-bg) / |cream-bg|^2 , 0, 1)
d = cream - bg
denom = float(d @ d)
alpha = ((arr - bg) @ d) / denom
alpha = np.clip(alpha, 0.0, 1.0)

# Mild contrast on alpha so faint mauve haze goes fully transparent
# while the mark stays solid (smoothstep-ish).
alpha = np.clip((alpha - 0.06) / (0.94 - 0.06), 0.0, 1.0)
alpha = alpha * alpha * (3 - 2 * alpha)
a8 = (alpha * 255).astype(np.uint8)

ys, xs = np.where(a8 > 10)
print("full bbox", xs.min(), ys.min(), xs.max(), ys.max())

# Segment vertical content bands (gaps = rows that are all transparent).
row_has = (a8 > 16).any(axis=1)
bands, run = [], None
for y, on in enumerate(row_has):
    if on and run is None:
        run = y
    elif not on and run is not None:
        bands.append((run, y - 1)); run = None
if run is not None:
    bands.append((run, H - 1))
bands = [b for b in bands if b[1] - b[0] > 12]
print("bands", bands)
mono_top, mono_bot = bands[0]  # ZB monogram is the top cluster


def emit(name, rgb, y0, y1, pad_frac=0.06):
    sub = a8[y0:y1 + 1]
    xs_ = np.where((sub > 16).any(axis=0))[0]
    x0, x1 = int(xs_.min()), int(xs_.max())
    band = a8[y0:y1 + 1, x0:x1 + 1]
    bh, bw = band.shape
    pad = int(round(max(bh, bw) * pad_frac))
    out = np.zeros((bh + 2 * pad, bw + 2 * pad, 4), np.uint8)
    out[pad:pad + bh, pad:pad + bw, 0] = rgb[0]
    out[pad:pad + bh, pad:pad + bw, 1] = rgb[1]
    out[pad:pad + bh, pad:pad + bw, 2] = rgb[2]
    out[pad:pad + bh, pad:pad + bw, 3] = band
    Image.fromarray(out, "RGBA").save("images/" + name)
    print(f"  {name:24s} {out.shape[1]}x{out.shape[0]}")


# Header: ZB monogram only, recoloured to ink (sits on cream paper)
emit("logo-mono-ink.png", INK, mono_top, mono_bot)
emit("logo-mono-cream.png", CREAM, mono_top, mono_bot)
# Footer: full lockup, cream (sits on dark ink surface)
emit("logo-lockup-cream.png", CREAM, bands[0][0], bands[-1][1])
emit("logo-lockup-ink.png", INK, bands[0][0], bands[-1][1])

# Favicon: monogram, ink, square, 64px
fav = Image.open("images/logo-mono-ink.png")
s = max(fav.size)
sq = Image.new("RGBA", (s, s), (0, 0, 0, 0))
sq.paste(fav, ((s - fav.size[0]) // 2, (s - fav.size[1]) // 2), fav)
sq.resize((64, 64), Image.LANCZOS).save("images/favicon.png")
print("  favicon.png              64x64")

# QA composites: mark on paper and on ink, to check for any fringe.
for bgc, tag in [((247, 241, 232), "paper"), ((33, 26, 19), "ink")]:
    canvas = Image.new("RGBA", (520, 360), bgc + (255,))
    for fn, pos in [("logo-mono-ink.png", (40, 60)),
                    ("logo-lockup-cream.png", (250, 40))]:
        l = Image.open("images/" + fn)
        l.thumbnail((230, 280))
        canvas.alpha_composite(l, pos)
    canvas.convert("RGB").save(f"scripts/_qa_{tag}.png")
print("QA written")
