// GET /api/unsubscribe?t=TOKEN — one-click unsubscribe from the link in every email.
import { rpc, esc, site, wrap } from './_lib.js';

export default wrap(async (req, res) => {
  const t = String(req.query.t || '');
  let ok = false;
  if (/^[0-9a-f-]{36}$/i.test(t)) ok = await rpc('unsubscribe', { p_token: t });
  const base = site(req);
  res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Unsubscribe | MESCO</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0B2A55;font-family:Arial,Helvetica,sans-serif;color:#fff;padding:24px">
<div style="max-width:440px;text-align:center"><img src="${esc(base)}/assets/logo-white.png" alt="MESCO" style="height:56px;margin-bottom:28px"><div style="width:44px;height:3px;background:#F2B33D;margin:0 auto 22px"></div>
<h1 style="font-size:26px;margin:0 0 12px">${ok ? 'You are unsubscribed' : 'This link has expired'}</h1>
<p style="opacity:.8;line-height:1.6;margin:0 0 26px">${ok ? 'You will no longer receive MESCO circulars by email. You can subscribe again at any time on the website.' : 'This unsubscribe link is not valid any more. If you still receive emails, reply to one and we will remove you.'}</p>
<a href="${esc(base)}/" style="color:#F2B33D">Back to mescoalex.com</a></div></body></html>`);

});
