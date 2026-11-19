// Shared helpers for the MESCO serverless functions (Vercel). Keys come from Vercel environment variables.
export const SB = process.env.SUPABASE_URL || 'https://vxyfumdmikkuzarbetga.supabase.co';
export const ANON = process.env.SUPABASE_ANON_KEY || 'sb_publishable_ITsZKnMs60YcT7H-G8OMbg_1TSgggn6';
export const FROM = process.env.MAIL_FROM || 'MESCO <mesco@bidaya.consulting>';
export const ALERT = (process.env.ALERT_TO || 'talal@bidaya.consulting').split(',').map(s => s.trim()).filter(Boolean);

export const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const site = req => 'https://' + (req.headers['x-forwarded-host'] || req.headers.host);
export const isEmail = s => typeof s === 'string' && s.length < 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export async function sb(path, { method = 'GET', body, token, headers = {} } = {}) {
  const r = await fetch(SB + path, { method, headers: { apikey: ANON, Authorization: 'Bearer ' + (token || ANON), 'Content-Type': 'application/json', ...headers }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); let j; try { j = t ? JSON.parse(t) : null; } catch { j = t; }
  if (!r.ok) throw Object.assign(new Error((j && (j.message || j.msg || j.error_description)) || 'Database error'), { status: r.status });
  return j;
}
export const rpc = (fn, args, token) => sb('/rest/v1/rpc/' + fn, { method: 'POST', body: args, token });

export async function mail(msgs) {
  const list = Array.isArray(msgs) ? msgs : [msgs], out = [];
  for (let i = 0; i < list.length; i += 100) {
    const chunk = list.slice(i, i + 100).map(m => ({ from: FROM, ...m }));
    const r = await fetch(chunk.length === 1 ? 'https://api.resend.com/emails' : 'https://api.resend.com/emails/batch', { method: 'POST', headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(chunk.length === 1 ? chunk[0] : chunk) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error('Email failed: ' + (j.message || r.status)), { status: 502 });
    out.push(j);
  }
  return out;
}

// Branded email wrapper (table layout so it renders in Outlook and Gmail).
export function layout({ kicker = '', title, body, cta, foot = '', base }) {
  return `<!doctype html><html><body style="margin:0;background:#EEF2F7;font-family:Arial,Helvetica,sans-serif;color:#0B1F3A">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF2F7;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:6px;overflow:hidden">
<tr><td style="background:#0B2A55;padding:22px 28px"><img src="${base}/assets/logo-white.png" alt="MESCO" height="40" style="display:block;height:40px;border:0"></td></tr>
<tr><td style="height:4px;background:#F2B33D;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:30px 28px 8px">${kicker ? `<p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#5B6B82">${kicker}</p>` : ''}<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#0B1F3A">${title}</h1>${body}</td></tr>
${cta ? `<tr><td style="padding:12px 28px 30px"><a href="${cta.href}" style="display:inline-block;background:#0B2A55;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:4px;font-weight:bold;font-size:15px">${cta.label}</a></td></tr>` : '<tr><td style="height:20px"></td></tr>'}
<tr><td style="padding:18px 28px;background:#F6F8FB;font-size:12px;line-height:1.6;color:#5B6B82">Middle East Survey &amp; Control Office (MESCO) · Alexandria, Egypt · Since 1960${foot ? '<br>' + foot : ''}</td></tr>
</table></td></tr></table></body></html>`;
}

export function send(res, code, obj) { res.status(code).setHeader('Cache-Control', 'no-store'); return res.json(obj); }
export function wrap(fn) {
  return async (req, res) => { try { await fn(req, res); } catch (e) { console.error(e); send(res, e.status && e.status < 500 ? e.status : 500, { error: e.message || 'Something went wrong' }); } };
}
