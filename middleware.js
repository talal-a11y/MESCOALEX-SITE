// Passcode gate. Runs on Vercel's edge before any page or asset is served, so nothing of the site reaches a browser without the code.
export const config = { matcher: '/((?!_vercel).*)' };
const CODE = 'Pharos-1960';
const TOKEN = 'k7f3c9a51e2b84d06aa';
const page = (bad) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>MESCO — private preview</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.5 system-ui,sans-serif;background:linear-gradient(140deg,#16224A,#2E3F75 60%,#1F6FB8);color:#1B2540;padding:20px;box-sizing:border-box}form{background:#fff;border-radius:18px;padding:36px;width:min(400px,100%);box-sizing:border-box;box-shadow:0 30px 60px -20px rgba(0,0,0,.4)}h1{font-size:1.4rem;margin:0 0 .3em;color:#16224A}p{margin:0 0 1.2em;color:#55627F}input,button{font:inherit;width:100%;box-sizing:border-box;padding:.8em 1em;border-radius:10px}input{border:1.5px solid #D5E0EE;margin-bottom:12px}button{border:0;background:#2E3F75;color:#fff;font-weight:600;cursor:pointer}.e{color:#C4421C;font-weight:600}small{display:block;margin-top:16px;color:#8693AD}</style></head>
<body><form method="post"><h1>MESCO website — private preview</h1><p>Enter the access code you were given to view the draft.</p>${bad ? '<p class="e">That code is not correct.</p>' : ''}<input name="code" type="password" placeholder="Access code" autofocus required><button>View the draft</button><small>Prepared by Bidaya. Confidential draft, not for distribution.</small></form></body></html>`;
const deny = (bad) => new Response(page(bad), { status: 401, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });

export default async function middleware(request) {
  if ((request.headers.get('cookie') || '').includes('mesco_gate=' + TOKEN)) return;
  if (request.method !== 'POST') return deny(false);
  const form = await request.formData().catch(() => null);
  if (!form || String(form.get('code') || '').trim() !== CODE) return deny(true);
  return new Response(null, { status: 303, headers: { Location: new URL(request.url).pathname, 'Set-Cookie': `mesco_gate=${TOKEN}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax` } });
}
