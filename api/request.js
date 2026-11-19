// POST /api/request — Request Assistance form. Saves the request, emails the 24/7 team and sends the sender a confirmation.
import { rpc, mail, layout, esc, isEmail, site, send, wrap, ALERT } from './_lib.js';

export default wrap(async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  const b = req.body || {};
  if (b.website) return send(res, 200, { ref: 'MES-0000' }); // honeypot: bots fill the hidden field
  const f = k => String(b[k] || '').trim().slice(0, k === 'description' ? 5000 : 200);
  const d = { name: f('name'), company: f('company'), email: f('email'), phone: f('phone'), vessel: f('vessel'), port: f('port'), type: f('type'), description: f('description'), callback: f('callback') };
  if (!d.name || !isEmail(d.email) || !d.description) return send(res, 400, { error: 'Please add your name, a valid email and a description.' });

  const ref = await rpc('submit_request', Object.fromEntries(Object.entries(d).map(([k, v]) => ['p_' + k, v])));
  const base = site(req), row = (k, v) => v ? `<tr><td style="padding:6px 12px 6px 0;color:#5B6B82;font-size:14px;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0;font-size:14px">${esc(v)}</td></tr>` : '';
  const table = `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 12px">${row('Reference', ref)}${row('Name', d.name)}${row('Company', d.company)}${row('Email', d.email)}${row('Phone', d.phone)}${row('Vessel', d.vessel)}${row('Port', d.port)}${row('Incident', d.type)}${row('Callback by', d.callback)}</table><p style="margin:0 0 6px;color:#5B6B82;font-size:13px">Description</p><p style="margin:0 0 12px;font-size:15px;line-height:1.6;white-space:pre-wrap">${esc(d.description)}</p>`;

  const results = await Promise.allSettled([
    mail({ to: ALERT, reply_to: d.email, subject: `New assistance request ${ref} · ${d.type || 'General'}${d.port ? ' · ' + d.port : ''}`, html: layout({ base, kicker: 'New request · ' + esc(ref), title: esc(d.type || 'Assistance request') + (d.vessel ? ' · ' + esc(d.vessel) : ''), body: table, cta: { href: base + '/admin/', label: 'Open in admin' }, foot: 'Reply to this email to answer ' + esc(d.name) + ' directly.' }) }),
    mail({ to: d.email, subject: `We have your request · ${ref}`, html: layout({ base, kicker: 'Reference ' + esc(ref), title: 'We have received your request', body: `<p style="margin:0 0 14px;font-size:15px;line-height:1.6">Dear ${esc(d.name)},</p><p style="margin:0 0 14px;font-size:15px;line-height:1.6">Thank you for contacting MESCO. Your request has been passed to our 24/7 team, who will contact you${d.callback ? ' by ' + esc(d.callback.toLowerCase()) : ''} as soon as possible. Please quote <b>${esc(ref)}</b> in any follow-up.</p>${table}`, foot: 'You receive this email because this address was entered on the MESCO Request Assistance form.' }) }),
  ]);
  results.forEach(r => r.status === 'rejected' && console.error(r.reason));
  send(res, 200, { ref, emailed: results[1].status === 'fulfilled' });
});
