// CORS proxy for job-board APIs that don't allow browser requests (Workday, AMD, Adzuna).
// Same file runs as a Netlify Function (v2) and is reused by server.mjs for localhost.
// Only allow-listed hosts are forwarded, so this can't be abused as an open proxy.

const ALLOWED_HOSTS = [
  /\.myworkdayjobs\.com$/i,
  /^careers\.amd\.com$/i,
  /^api\.adzuna\.com$/i,
  /^boards-api\.greenhouse\.io$/i,
  /^api\.lever\.co$/i,
  /^api\.ashbyhq\.com$/i,
];

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json", ...CORS } });

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  const u = new URL(req.url);
  if (u.searchParams.has("ping")) return json({ ok: true, proxy: "internship-finder" });

  let target;
  try {
    target = new URL(u.searchParams.get("url") || "");
  } catch {
    return json({ error: "missing or invalid ?url=" }, 400);
  }
  if (target.protocol !== "https:" || !ALLOWED_HOSTS.some((re) => re.test(target.hostname))) {
    return json({ error: `host not allowed: ${target.hostname}` }, 403);
  }

  const init = {
    method: req.method === "POST" ? "POST" : "GET",
    headers: {
      accept: "application/json",
      "accept-language": "en-US",
      "user-agent": "Mozilla/5.0 (internship-finder personal job search)",
    },
    signal: AbortSignal.timeout(20000),
  };
  if (init.method === "POST") {
    init.body = await req.text();
    init.headers["content-type"] = "application/json";
  }

  try {
    const r = await fetch(target, init);
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: {
        "content-type": r.headers.get("content-type") || "application/json",
        "cache-control": "public, max-age=300",
        ...CORS,
      },
    });
  } catch (e) {
    return json({ error: `upstream fetch failed: ${e.message}` }, 502);
  }
};

export const config = { path: "/api/proxy" };
