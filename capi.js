// Vercel Serverless Function — Meta Conversions API (CAPI) proxy
// File path in your Vercel project: /api/capi.js
//
// Set these environment variables in Vercel → Settings → Environment Variables:
//   META_PIXEL_ID         → 1349103609274064
//   META_CAPI_TOKEN       → (your CAPI access token — keep secret, never in client code)
//   META_TEST_EVENT_CODE  → (optional, only while debugging in Events Manager)
//
// The browser pixel handles PageView/ViewContent automatically.
// This endpoint is for high-value events (Lead, InitiateCheckout, Purchase) where
// you want server-side delivery in addition to the pixel for better attribution.

export default async function handler(req, res) {
  // CORS — adjust origin to your domain in production
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const PIXEL_ID = process.env.META_PIXEL_ID;
  const TOKEN = process.env.META_CAPI_TOKEN;
  const TEST_CODE = process.env.META_TEST_EVENT_CODE;

  if (!PIXEL_ID || !TOKEN) {
    return res.status(500).json({ error: "Missing META_PIXEL_ID or META_CAPI_TOKEN env vars" });
  }

  try {
    const body = req.body && typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
    const eventName = body.event_name || "Lead";

    // Hash helper (SHA-256, lowercase, trimmed) — required by Meta for PII
    const crypto = await import("node:crypto");
    const hash = (v) =>
      v ? crypto.createHash("sha256").update(String(v).trim().toLowerCase()).digest("hex") : undefined;

    // IP + UA for better matching
    const ip =
      (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "";
    const ua = req.headers["user-agent"] || "";

    // Cookies set by the browser pixel — pass these through for de-dup with client events
    const cookies = Object.fromEntries(
      (req.headers.cookie || "").split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, v.join("=")];
      })
    );

    const event = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: body.event_id || crypto.randomUUID(), // dedupe with pixel-side event
      event_source_url: body.event_source_url || req.headers.referer || "",
      action_source: "website",
      user_data: {
        em: hash(body.email),
        ph: hash(body.phone),
        fn: hash(body.first_name),
        ln: hash(body.last_name),
        client_ip_address: ip,
        client_user_agent: ua,
        fbp: cookies._fbp,
        fbc: cookies._fbc,
      },
      custom_data: body.custom_data || {},
    };

    // Strip undefined keys
    Object.keys(event.user_data).forEach((k) => event.user_data[k] === undefined && delete event.user_data[k]);

    const payload = { data: [event] };
    if (TEST_CODE) payload.test_event_code = TEST_CODE;

    const url = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(TOKEN)}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: "Meta API error", detail: json });
    return res.status(200).json({ ok: true, meta: json });
  } catch (err) {
    return res.status(500).json({ error: "Server error", detail: String(err) });
  }
}
