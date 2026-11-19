// POST /api/send-circular — staff only. Emails a published post to every active subscriber (or a test to the signed-in staff member).
import { sb, mail, layout, esc, site, send, wrap } from './_lib.js';

export default wrap(async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  const token = String(req.headers.authorization || '').replace(/^Bearer /, '');
  if (!token) return send(res, 401, { error: 'Sign in again.' });
  const user = await sb('/auth/v1/user', { token }).catch(() => null);
  if (!user || !user.email) return send(res, 401, { error: 'Your session expired. Sign in again.' });
  const staff = await sb('/rest/v1/staff?select=user_id&user_id=eq.' + user.id, { token });
  if (!staff.length) return send(res, 403, { error: 'This account is not on the staff list.' });

  const { post_id, test } = req.body || {};
  const [p] = await sb('/rest/v1/posts?select=*&id=eq.' + encodeURIComponent(post_id), { token });
  if (!p) return send(res, 404, { error: 'Post not found.' });
  if (p.status !== 'published' && !test) return send(res, 400, { error: 'Publish the post before emailing it.' });

  const base = site(req), url = `${base}/news/post/?id=${p.id}`;
  const date = new Date(p.date + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const html = unsub => layout({ base, kicker: esc(p.cat) + ' · ' + date, title: esc(p.title),
    body: (p.cover_url ? `<img src="${esc(p.cover_url)}" alt="" width="544" style="display:block;width:100%;max-width:544px;height:auto;border-radius:4px;margin:0 0 18px">` : '') + `<p style="margin:0 0 14px;font-size:16px;line-height:1.6">${esc(p.summary)}</p>` + (p.pdf_url ? `<p style="margin:0 0 6px;font-size:14px"><a href="${esc(p.pdf_url)}" style="color:#0B2A55">Download the PDF · ${esc(p.pdf_name || 'document.pdf')}</a></p>` : ''),
    cta: { href: url, label: 'Read the full ' + esc(String(p.cat).toLowerCase()) },
    foot: unsub ? `You receive this because you subscribed on the MESCO website. <a href="${unsub}" style="color:#5B6B82">Unsubscribe</a>` : 'Test send · only you received this.' });
  const subject = (p.cat === 'News' ? '' : p.cat + ': ') + p.title;

  if (test) { await mail({ to: user.email, subject: '[Test] ' + subject, html: html('') }); return send(res, 200, { sent: 1, test: true, to: user.email }); }

  const subs = await sb('/rest/v1/subscribers?select=email,token&status=eq.active', { token });
  if (!subs.length) return send(res, 400, { error: 'There are no active subscribers yet.' });
  await mail(subs.map(s => { const u = `${base}/api/unsubscribe?t=${s.token}`; return { to: s.email, subject, html: html(u), headers: { 'List-Unsubscribe': `<${u}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } }; }));
  await sb('/rest/v1/sends', { method: 'POST', token, body: { post_id: p.id, recipients: subs.length, sent_by: user.email }, headers: { Prefer: 'return=minimal' } }).catch(e => console.error(e));
  send(res, 200, { sent: subs.length });
});
