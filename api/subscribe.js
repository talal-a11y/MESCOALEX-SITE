// POST /api/subscribe — adds an email to the circulars list and sends a welcome email with an unsubscribe link.
import { rpc, mail, layout, isEmail, site, send, wrap } from './_lib.js';

export default wrap(async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  const email = String((req.body || {}).email || '').trim().toLowerCase();
  if ((req.body || {}).website) return send(res, 200, { ok: true });
  if (!isEmail(email)) return send(res, 400, { error: 'Please enter a valid email address.' });
  const token = await rpc('subscribe', { p_email: email });
  const base = site(req);
  try {
    await mail({ to: email, subject: 'You are subscribed to MESCO circulars', headers: { 'List-Unsubscribe': `<${base}/api/unsubscribe?t=${token}>` }, html: layout({ base, kicker: 'Subscription confirmed', title: 'You will receive our circulars by email', body: '<p style="margin:0 0 14px;font-size:15px;line-height:1.6">Thank you for subscribing. New circulars, loss prevention guidelines and news from MESCO will be sent to this address when they are published.</p>', cta: { href: base + '/news/', label: 'See the latest' }, foot: `Not you? <a href="${base}/api/unsubscribe?t=${token}" style="color:#5B6B82">Unsubscribe</a>` }) });
  } catch (e) { console.error(e); }
  send(res, 200, { ok: true });
});
