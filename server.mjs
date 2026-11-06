// Local server: serves index.html and the /api/proxy endpoint (same code as the Netlify Function).
// Usage:  node server.mjs        (then open http://localhost:8080)
// No npm install needed — requires Node 18+.

import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import proxy from "./netlify/functions/proxy.mjs";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT) || 8080;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    try {
      if (url.pathname === "/api/proxy") {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const r = await proxy(
          new Request(url, { method: req.method, headers: { "content-type": "application/json" }, body: ["POST"].includes(req.method) ? Buffer.concat(chunks) : undefined })
        );
        res.writeHead(r.status, Object.fromEntries(r.headers));
        res.end(Buffer.from(await r.arrayBuffer()));
        return;
      }
      let p = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
      if (!p || p.endsWith("/") || p.endsWith("\\")) p += "index.html";
      if (p.startsWith("..") || /(^|[/\\])(netlify|node_modules|\.)/.test(p)) throw Object.assign(new Error("forbidden"), { code: "ENOENT" });
      const data = await readFile(join(ROOT, p));
      res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" });
      res.end(data);
    } catch (e) {
      res.writeHead(e.code === "ENOENT" ? 404 : 500, { "content-type": "text/plain" });
      res.end(e.code === "ENOENT" ? "Not found" : String(e));
    }
  })
  .listen(PORT, () => console.log(`Internship finder running at http://localhost:${PORT}  (Ctrl+C to stop)`));
