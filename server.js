// Zero-dependency static file server for the lelabo-rebuild visual rebuild.
// Serves the repo root. Netlify Functions (/api/*) are NOT ported here —
// they return 501 so the Bespoke wizard / Square checkout fail loudly
// rather than serving a confusing HTML 404.
import { createServer } from "node:http";
import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { join, normalize, extname, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname);
const PORT = Number(process.env.PORT) || 8080;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = decodeURIComponent(url.pathname);

    if (pathname === "/healthz") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      return res.end("ok");
    }

    // Netlify Functions are not ported into this static deploy.
    if (pathname.startsWith("/api/")) {
      res.writeHead(501, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error: "Not available",
          detail:
            "This is the lelabo-rebuild static visual deploy. Serverless endpoints (Bespoke wizard, Square checkout) are not hosted here.",
        })
      );
    }

    if (pathname === "/" || pathname.endsWith("/")) {
      pathname += "index.html";
    }

    // Resolve safely inside ROOT (block path traversal).
    const filePath = normalize(join(ROOT, pathname));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      return res.end("Forbidden");
    }

    let info;
    try {
      info = await stat(filePath);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }

    const finalPath = info.isDirectory()
      ? join(filePath, "index.html")
      : filePath;
    const size = info.isDirectory() ? (await stat(finalPath)).size : info.size;
    const type = MIME[extname(finalPath).toLowerCase()] || "application/octet-stream";

    // Byte-range support. Safari will not play a <video> at all unless the
    // server answers its probe request with a 206 — without this the hero
    // video silently never starts.
    const range = req.headers.range;
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (m) {
        let start = m[1] === "" ? null : Number(m[1]);
        let end = m[2] === "" ? null : Number(m[2]);

        if (start === null) {
          // Suffix form: "bytes=-500" means the last 500 bytes.
          const len = end ?? 0;
          start = Math.max(0, size - len);
          end = size - 1;
        } else if (end === null || end >= size) {
          end = size - 1;
        }

        if (start > end || start >= size) {
          res.writeHead(416, {
            "Content-Range": `bytes */${size}`,
            "Accept-Ranges": "bytes",
          });
          return res.end();
        }

        res.writeHead(206, {
          "Content-Type": type,
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Content-Length": end - start + 1,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=3600",
        });
        return createReadStream(finalPath, { start, end }).pipe(res);
      }
    }

    res.writeHead(200, {
      "Content-Type": type,
      "Content-Length": size,
      "Accept-Ranges": "bytes",
    });
    createReadStream(finalPath).pipe(res);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal error");
    console.error(err);
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`zella-blends-lelabo static server on http://0.0.0.0:${PORT}`);
});
