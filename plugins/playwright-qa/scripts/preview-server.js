#!/usr/bin/env node

const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(process.cwd(), "docs");
const port = Number(process.env.QA_PREVIEW_PORT || 4173);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");

  let filePath = path.join(root, safePath);

  if (urlPath === "/" || urlPath === "") {
    const files = fs.existsSync(root)
      ? fs
          .readdirSync(root)
          .filter((f) => f.endsWith(".html"))
          .sort()
          .reverse()
      : [];

    const links = files
      .map((file) => `<li><a href="/${file}">${file}</a></li>`)
      .join("");

    return send(
      res,
      200,
      `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>QA Preview Reports</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; background: #0f172a; color: #e5e7eb; }
    a { color: #93c5fd; }
    .card { max-width: 900px; margin: auto; background: #111827; border: 1px solid #334155; border-radius: 18px; padding: 28px; }
  </style>
</head>
<body>
  <main class="card">
    <h1>QA Preview Reports</h1>
    <p>Latest generated investigation reports.</p>
    <ul>${links || "<li>No report found.</li>"}</ul>
  </main>
</body>
</html>`,
      "text/html; charset=utf-8",
    );
  }

  if (!filePath.startsWith(root)) {
    return send(res, 403, "Forbidden");
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return send(res, 404, "Not found");
  }

  const ext = path.extname(filePath);
  const type = mime[ext] || "application/octet-stream";
  fs.createReadStream(filePath).pipe(res);
  res.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": "no-store",
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`QA preview server running at http://127.0.0.1:${port}`);
  console.log(`Serving: ${root}`);
});
