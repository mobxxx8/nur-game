// Live counters for the NUR site (a Vercel serverless function).
//   GET  /api/stats                 -> { enabled, visits, downloads, installs }
//   POST /api/stats?event=visit     -> counts one visit (the page sends it once a day per browser)
//   POST /api/stats?event=download  -> counts one tap on "Get it on Google Play"
// Storage: Upstash Redis over its REST API (add the free "Upstash for Redis"
// integration in Vercel; it sets KV_REST_API_URL / KV_REST_API_TOKEN or the
// UPSTASH_REDIS_REST_* pair). Without storage the counters stay hidden.
// NUR_PLAY_INSTALLS (optional) is the owner's own install figure from Play
// Console, e.g. "1,000+"; Google does not publish installs to websites.

const KEYS = { visit: "nur:visits", download: "nur:downloads" };

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  const installs = (process.env.NUR_PLAY_INSTALLS || "").trim();
  if (!url || !token) {
    res.status(200).json({ enabled: false, installs });
    return;
  }
  const redis = async (commands) => {
    const r = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
    });
    if (!r.ok) throw new Error(`redis ${r.status}`);
    return r.json();
  };
  try {
    const event = String((req.query && req.query.event) || "");
    const commands = [];
    if (req.method === "POST" && KEYS[event]) commands.push(["INCR", KEYS[event]]);
    commands.push(["GET", KEYS.visit], ["GET", KEYS.download]);
    const out = await redis(commands);
    const n = out.length;
    res.status(200).json({
      enabled: true,
      visits: Number(out[n - 2].result || 0),
      downloads: Number(out[n - 1].result || 0),
      installs,
    });
  } catch (err) {
    res.status(200).json({ enabled: false, installs });
  }
};
