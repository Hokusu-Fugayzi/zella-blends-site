// Static file server for the site, plus the /api/* endpoints (Square
// checkout + catalog, the Create wizard, Square webhooks).
import { createServer } from "node:http";
import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { join, normalize, extname, resolve } from "node:path";

import catalogHandler from "./netlify/functions/catalog.js";
import checkoutHandler from "./netlify/functions/checkout.js";
import recommendHandler from "./netlify/functions/recommend.js";
import webhookHandler from "./netlify/functions/webhooks-square.js";

const ROOT = resolve(import.meta.dirname);

const API = {
  "/api/catalog": catalogHandler,
  "/api/checkout": checkoutHandler,
  "/api/recommend": recommendHandler,
  "/api/webhooks/square": webhookHandler,
};

// Paths under ROOT that are never served as static files.
const PRIVATE = [
  "/lib", "/netlify", "/scripts", "/node_modules", "/server.js",
  "/package.json", "/package-lock.json", "/Dockerfile", "/fly.toml",
  "/netlify.toml",
];

const MAX_BODY = 64 * 1024;

// Adapts a Node request to the Web Request/Response handlers in
// netlify/functions, so the same handlers run here unchanged.
async function handleApi(req, res, url, pathname) {
  const handler = API[pathname.replace(/\/$/, "")];
  if (!handler) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Not found" }));
  }

  let body;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_BODY) {
        res.writeHead(413, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Request too large" }));
      }
      chunks.push(chunk);
    }
    body = Buffer.concat(chunks);
  }

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }

  const response = await handler(
    new Request(url, { method: req.method, headers, body }),
    {}
  );
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
}
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

    if (pathname.startsWith("/api/")) {
      return await handleApi(req, res, url, pathname);
    }

    // Never serve server-side source, config or dotfiles.
    if (
      pathname.split("/").some((part) => part.startsWith(".")) ||
      PRIVATE.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"))
    ) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
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
  console.log(`zella-blends listening on http://0.0.0.0:${PORT}`);
});
