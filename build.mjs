import fs from 'node:fs';
import path from 'node:path';
import { minify as minJS } from 'terser';
import { minify as minCSS } from 'csso';
import { minify as minHTML } from 'html-minifier-terser';
import { NAV, SERVICES as S0, HOME, PAGES, ABOUT, TEAM } from './content.mjs';
import { seoPages } from './seo.mjs';

const OUT = 'public';
const STAMP = 'Draft 7.2 · ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const r1 = n => +n.toFixed(1);

/* Services: Claims and Legal run as one page until the client confirms otherwise (one combined document received). */
const SERVICES = S0.map(s => ({ ...s, fixed: false })); // five services, in the order of the client's homepage document
PAGES['claims-legal'] = { kicker: 'Services', title: 'Claims & Legal Services', tagline: PAGES.claims.tagline, blocks: [...PAGES.claims.blocks.slice(0, 2), ...PAGES.legal.blocks] };
const CATS = ['Circular', 'Loss prevention', 'Suez Canal', 'P&I report', 'News'];

const ICONS = {
  anchor: '<circle cx="12" cy="5" r="2"/><path d="M12 7v14M5 13a7 7 0 0 0 14 0M8 11h8"/>',
  medical: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
  scales: '<path d="M12 3v18M7 21h10M4 7h16M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z"/>',
  clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  pin: '<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
};
const icon = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
/* Logo mark: a ship's bow seen head-on, shaped as a shield (protection and indemnity), with survey draft marks above the waterline. */
const MARK = (light) => { const a = light ? '#fff' : '#2E3F75', b = light ? '#9CC4EC' : '#1F6FB8', c = light ? '#16224A' : '#fff';
  return `<svg class="mark" viewBox="0 0 48 48" aria-hidden="true"><path d="M18 10V4h12v6z" fill="${a}"/><path d="M4 11h20v35C12 40 4 29 4 11z" fill="${a}"/><path d="M44 11H24v35c12-6 20-17 20-35z" fill="${b}"/><path d="M29 17h9M29 22h7.500M29 27h6" stroke="${c}" stroke-width="2" stroke-linecap="round"/><path d="M9 33q3.750-3 7.500 0t7.500 0 7.500 0 7.500 0" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`; };
const LOGO = (light) => `<a class="logo${light ? ' logo-light' : ''}" href="/" aria-label="MESCO home"><img src="/assets/logo-${light ? 'white' : 'navy'}.png" alt="MESCO — Middle East Survey &amp; Control Office" width="1400" height="395"></a>`;

/* ---------- Hero: bird's-eye view of a convoy transiting the Suez Canal ---------- */
const SEG = [[[420, 900], [760, 720], [890, 610], [1010, 470]], [[1010, 470], [1130, 330], [1200, 200], [1500, 90]]];
const LANE = 'M420 900C760 720 890 610 1010 470C1130 330 1200 200 1500 90';
const bez = (p, t) => { const u = 1 - t; return [0, 1].map(k => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]); };
const lane = t => { const s = t < .5 ? 0 : 1, tt = t < .5 ? t * 2 : (t - .5) * 2, a = bez(SEG[s], tt), b = bez(SEG[s], Math.min(1, tt + .01)), c = bez(SEG[s], Math.max(0, tt - .01)), dx = b[0] - c[0], dy = b[1] - c[1], l = Math.hypot(dx, dy); return { x: a[0], y: a[1], nx: -dy / l, ny: dx / l, ang: Math.atan2(dy, dx) * 180 / Math.PI }; };
const at = (t, d) => { const p = lane(t); return [r1(p.x + p.nx * d), r1(p.y + p.ny * d), r1(p.ang)]; };
const off = (d, a = 0, b = 1, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const [x, y] = at(a + (b - a) * i / n, d); return `${i ? 'L' : 'M'}${x} ${y}`; }).join('');
const rnd = (i) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };
function vessel(len, beam, hull, kind, seed) {
  const b = beam / 2, h = len / 2, pal = ['#2E3F75', '#1F6FB8', '#9CC4EC', '#F4F7FB', '#E4572E', '#16224A', '#C9D8EC', '#B7482A'];
  let deck = '';
  if (kind === 'box') { for (let x = -h + 34, i = 0; x < h - len * .2; x += 12.5, i++) for (let r = 0; r < 5; r++) deck += `<rect x="${r1(x)}" y="${r1(-b + 3 + r * (beam - 6) / 5)}" width="11" height="${r1((beam - 6) / 5 - .8)}" fill="${pal[Math.floor(rnd(i * 7 + r * 3 + seed) * pal.length)]}"/>`; }
  else { for (let x = -h + 36, i = 0; x < h - len * .22; x += 30, i++) deck += `<rect x="${x}" y="${-b + 5}" width="25" height="${beam - 10}" rx="2" fill="#B7482A"/><path d="M${x + 12.5} ${-b + 5}v${beam - 10}" stroke="#16224A" stroke-opacity=".35"/>`; }
  const hullD = `M${-h} ${-b}H${h - len * .2}Q${h - len * .05} ${-b} ${h} 0Q${h - len * .05} ${b} ${h - len * .2} ${b}H${-h}Q${-h - 6} 0 ${-h} ${-b}Z`;
  return `<path d="M${-h + 4} 0L${-h - len * .9} ${-b * 1.5}Q${-h - len * .6} 0 ${-h - len * .9} ${b * 1.5}Z" fill="url(#wk)"/><path d="M${h - 8} ${-b * .7}L${-h - len * .5} ${-b - 26}M${h - 8} ${b * .7}L${-h - len * .5} ${b + 26}" stroke="#fff" stroke-opacity=".28" stroke-width="1.500" fill="none"/>
<path d="${hullD}" transform="translate(5 7)" fill="#0B1533" opacity=".22"/><path d="${hullD}" fill="${hull}"/><path d="M${-h + 3} ${-b + 2}H${h - len * .21}Q${h - len * .08} ${-b + 2} ${h - 5} 0Q${h - len * .08} ${b - 2} ${h - len * .21} ${b - 2}H${-h + 3}Z" fill="#DCE7F5" opacity=".9"/>${deck}
<rect x="${-h + 8}" y="${-b - 2}" width="18" height="${beam + 4}" rx="1.500" fill="#fff"/><rect x="${-h + 13}" y="-4" width="8" height="8" rx="1" fill="#E4572E"/>`;
}
const convoy = (dur, begin, inner) => `<g><animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite" rotate="auto"><mpath href="#lane"/></animateMotion>${inner}</g>`;
function heroArt() {
  let palms = '', fields = '', dunes = '', km = '', grid = '', town = '';
  for (let i = 0; i < 46; i++) { const [x, y] = at(.04 + rnd(i) * .92, 128 + rnd(i + 50) * 46); palms += `<circle cx="${x}" cy="${y}" r="${r1(3 + rnd(i + 9) * 3)}"/>`; }
  for (let i = 0; i < 9; i++) { const t = .08 + i * .1, [x, y, a] = at(t, 215 + (i % 3) * 34); fields += `<rect x="${x - 34}" y="${y - 15}" width="${60 + (i % 2) * 22}" height="27" rx="3" transform="rotate(${a} ${x} ${y})" fill="${i % 2 ? '#1D2E61' : '#22366E'}"/>`; }
  for (let i = 0; i < 7; i++) { const [x, y, a] = at(.1 + i * .13, -210 - rnd(i + 3) * 190), w = 90 + rnd(i) * 120; dunes += `<path d="M${x - w} ${y}q${w * .5} ${-26 - rnd(i + 1) * 20} ${w} 0t${w} 0" transform="rotate(${a - 8} ${x} ${y})"/><path d="M${x - w * .7} ${y + 22}q${w * .4} -18 ${w * .8} 0t${w * .7} 0" transform="rotate(${a - 8} ${x} ${y})" opacity=".6"/>`; }
  [[.2, 'KM 80'], [.44, 'KM 78'], [.7, 'KM 76']].forEach(([t, l]) => { const [x, y, a] = at(t, -118); km += `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0v12" stroke="#9CC4EC" stroke-width="2"/><text y="-6" text-anchor="middle">${l}</text></g>`; });
  for (let x = 180; x < 1440; x += 240) grid += `<path d="M${x} 0V820"/>`;
  for (let y = 140; y < 820; y += 240) grid += `<path d="M0 ${y}H1440"/>`;
  for (let i = 0; i < 14; i++) { const [x, y, a] = at(.52 + rnd(i + 20) * .2, 290 + rnd(i + 30) * 110); town += `<rect x="${x}" y="${y}" width="${r1(14 + rnd(i) * 16)}" height="${r1(10 + rnd(i + 2) * 10)}" transform="rotate(${a} ${x} ${y})"/>`; }
  return `<svg class="hero-art" viewBox="0 0 1440 820" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration: bird's-eye view of a convoy of vessels transiting the Suez Canal">
<defs><path id="lane" d="${LANE}"/><linearGradient id="wk" x1="1" x2="0"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="sun" cx=".2" cy=".1" r="1"><stop offset="0" stop-color="#1B2B5E"/><stop offset="1" stop-color="#0E1836"/></radialGradient><filter id="soft"><feGaussianBlur stdDeviation="26"/></filter></defs>
<rect width="1440" height="820" fill="url(#sun)"/>
<g stroke="#9CC4EC" stroke-opacity=".08" fill="none">${grid}</g>
<g fill="none" stroke="#2E4483" stroke-width="2" stroke-linecap="round">${dunes}</g>
${fields}<g fill="#35529A">${palms}</g><g fill="#2A4180" stroke="#3B5799">${town}</g>
<path d="${off(190)}" fill="none" stroke="#9CC4EC" stroke-width="5" opacity=".18"/><path d="${off(190)}" fill="none" stroke="#9CC4EC" stroke-opacity=".45" stroke-width="1.500" stroke-dasharray="10 12"/>
<path d="${LANE}" fill="none" stroke="#2E4483" stroke-width="224"/><path d="${LANE}" fill="none" stroke="#C9D8EC" stroke-width="210" opacity=".9"/>
<path d="${LANE}" fill="none" stroke="#8FC0EA" stroke-width="198"/><path d="${LANE}" fill="none" stroke="#3F8AD0" stroke-width="166"/><path d="${LANE}" fill="none" stroke="#1F6FB8" stroke-width="128"/><path d="${LANE}" fill="none" stroke="#1B62A6" stroke-width="70" opacity=".55"/>
<g fill="none" stroke="#fff" stroke-linecap="round" class="flow"><path d="${off(-52)}" stroke-opacity=".22" stroke-width="2"/><path d="${off(48)}" stroke-opacity=".18" stroke-width="2"/><path d="${off(-12)}" stroke-opacity=".12" stroke-width="1.500"/></g>
<text class="chart-name" dy="-78"><textPath href="#lane" startOffset="60%">SUEZ CANAL</textPath></text>
<g class="km">${km}</g>
${convoy(95, -18, vessel(250, 38, '#0E1836', 'box', 3))}
${convoy(95, -58, vessel(210, 34, '#2E3F75', 'bulk', 5))}
${convoy(95, -88, vessel(230, 36, '#7A2E1C', 'box', 11))}
${convoy(52, -9, `<g transform="translate(0 62)">${vessel(46, 13, '#fff', 'pilot', 1).replace(/<rect x="-15"[^>]*>/, '')}</g>`)}
<g fill="#9CC4EC" opacity=".08" filter="url(#soft)"><ellipse class="cloud" cx="300" cy="640" rx="260" ry="90"/><ellipse class="cloud c2" cx="900" cy="150" rx="320" ry="110"/></g>
<g class="rose" transform="translate(1330 706)"><circle r="54" fill="none" stroke="#9CC4EC" stroke-opacity=".5"/><circle r="40" fill="none" stroke="#9CC4EC" stroke-opacity=".3" stroke-dasharray="2 5"/><path d="M0 -62L9 0 0 62-9 0z" fill="#DCE9F7" opacity=".85"/><path d="M-62 0L0 -9 62 0 0 9z" fill="#9CC4EC" opacity=".4"/><text y="-70" text-anchor="middle">N</text></g>
<g class="coord"><text x="16" y="134">30°35′N</text><text x="16" y="374">30°20′N</text><text x="186" y="808">32°16′E</text><text x="426" y="808">32°20′E</text></g>
</svg>`;
}

/* ---------- Radar: three services sweep round, Marine Consultancy holds the centre ---------- */
const fixedSvc = SERVICES.find(s => s.fixed), rot = SERVICES.filter(s => !s.fixed), BEAR = [35, 155, 275];
function radar() {
  let ticks = '';
  for (let a = 0; a < 360; a += 10) ticks += `<path d="M200 ${a % 30 ? 22 : 16}V28" transform="rotate(${a} 200 200)"/>`;
  const blips = rot.map((s, i) => { const a = BEAR[i] * Math.PI / 180, x = r1(200 + Math.sin(a) * 118), y = r1(200 - Math.cos(a) * 118); return `<g class="blip" data-i="${i}" data-b="${BEAR[i]}" transform="translate(${x} ${y})" role="button" tabindex="0" aria-label="${esc(s.name)}"><circle r="26" class="halo"/><circle r="7"/><circle r="15" class="ring"/></g>`; }).join('');
  return `<svg class="radar" viewBox="0 0 400 400" aria-hidden="false"><defs><linearGradient id="sw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9CC4EC" stop-opacity="0"/><stop offset="1" stop-color="#9CC4EC" stop-opacity=".5"/></linearGradient></defs>
<circle cx="200" cy="200" r="188" class="scope"/><g class="rings"><circle cx="200" cy="200" r="174"/><circle cx="200" cy="200" r="118"/><circle cx="200" cy="200" r="60"/><path d="M200 26V374M26 200H374"/></g><g class="ticks">${ticks}</g>
<g class="sweep"><path d="M200 200L200 26A174 174 0 0 0 87 68z" fill="url(#sw)"/><path d="M200 200V26" stroke="#DCE9F7" stroke-width="2"/></g>${blips}
<g class="own"><circle cx="200" cy="200" r="34"/><path d="M200 180l9 20-9 20-9-20z"/></g></svg>${rot.map((s, i) => { const a = BEAR[i] * Math.PI / 180, x = 200 + Math.sin(a) * 118, y = 200 - Math.cos(a) * 118; return `<button class="blab ${x > 200 ? 'r' : 'l'}" data-i="${i}" style="left:${r1(x / 4)}%;top:${r1(y / 4)}%">${esc(s.name)}</button>`; }).join('')}`;
}

/* ---------- Shared layout ---------- */
const header = `<header class="hd"><div class="wrap hd-in">${LOGO(true)}
<nav class="nav" id="nav" aria-label="Main">${NAV.map(([t, h]) => h === '/services/'
  ? `<div class="dd"><a href="${h}">${esc(t)}</a><div class="dd-menu">${SERVICES.map(s => `<a href="/services/${s.slug}/">${esc(s.name)}</a>`).join('')}</div></div>`
  : `<a href="${h}">${esc(t)}</a>`).join('')}</nav>
<a class="sos" href="/request-assistance/"><span class="beacon"></span><span>24/7 Emergency Assistance</span></a><button class="burger" aria-label="Menu" aria-controls="nav" aria-expanded="false"><span></span><span></span><span></span></button></div></header>`;
const wave = c => `<svg class="swell ${c}" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true"><path class="w1" d="M-240 30q60-22 120 0t120 0 120 0 120 0 120 0 120 0 120 0 120 0 120 0 120 0 120 0 120 0 120 0 120 0 120 0 120 0V60H-240z"/><path class="w2" d="M-240 38q60-16 120 0t120 0 120 0 120 0 120 0 120 0 120 0 120 0 120 0 120 0 120 0 120 0 120 0 120 0 120 0 120 0V60H-240z"/></svg>`;
const footer = `<footer class="ft">${wave('ft-swell')}<div class="wrap ft-grid"><div>${LOGO(true)}<p>Alexandria, Egypt. Since 1960.</p></div>
<div><h3>About</h3><a href="/about/">About MESCO</a><a href="/team/">Our Team</a></div>
<div><h3>Services</h3>${SERVICES.map(s => `<a href="/services/${s.slug}/">${esc(s.name)}</a>`).join('')}</div>
<div><h3>Resources</h3><a href="/news/?c=Loss prevention">Loss Prevention</a><a href="/news/">News &amp; Circulars</a></div>
<div><h3>Contact</h3><a href="/contact/">Contact Us</a><a href="/contact/#offices">Office Locations</a><a href="/request-assistance/">Request Assistance</a><a href="/request-assistance/">Emergency Response</a></div>
</div><div class="wrap ft-base"><span>© 2026 Middle East Survey &amp; Control Office</span><span><a href="/privacy/">Privacy Policy</a> · <a href="/terms/">Terms &amp; Conditions</a> · <a href="/admin/">Staff login</a></span><span class="stamp">${STAMP}</span></div></footer>
<a class="sos-bar" href="/request-assistance/"><span class="beacon"></span>24/7 Emergency Assistance</a>`;

const block = ([t, v]) => ({
  p: () => `<p>${esc(v)}</p>`, h2: () => `<h2>${esc(v)}</h2>`, note: () => '',
  ul: () => `<ul class="plain">${v.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`,
  ticks: () => `<ul class="ticks">${v.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`,
  dl: () => `<div class="defs">${v.map((i, k) => { const [a, ...b] = i.split(' – '); return `<div class="rv"><span class="num">${String(k + 1).padStart(2, '0')}</span><div><h3>${esc(a)}</h3><p>${esc(b.join(' – '))}</p></div></div>`; }).join('')}</div>`,
  cta: () => `<a class="btn btn-sos" href="/request-assistance/">${esc(v)} ${icon('arrow')}</a>`,
}[t]());
const soundings = () => { let s = ''; for (let i = 0; i < 16; i++) s += `<text x="${r1(560 + rnd(i + 70) * 860)}" y="${r1(30 + rnd(i + 90) * 250)}">${Math.floor(8 + rnd(i + 40) * 30)}</text>`; return s; };
const VIDS = { home: 'Port of Alexandria', about: 'Port of Alexandria', trust: 'Suez Canal', expertise: 'Vessels and tankers', team: 'LNG tanker, aerial', lng: 'LNG tanker, aerial', help: 'Ship under way, drone view', surveys: 'Aerial view over a ship\'s bow', claims: 'Vessel assisted by a tug' };
const vid = (name, cls = '') => `<video class="${cls}" data-v="${name}" autoplay muted loop playsinline preload="metadata" poster="/assets/v/${name}.jpg" aria-label="${VIDS[name]}"><source src="/assets/v/${name}.mp4" type="video/mp4"></video>`;
const pageHead = (kicker, title, tagline, v = 'about') => `<section class="ph ph-v">${vid(v, 'ph-video')}<div class="ph-veil"></div>
<div class="wrap"><p class="kicker">${esc(kicker)}</p><h1 class="split">${esc(title)}</h1>${tagline ? `<p class="tagline">${esc(tagline)}</p>` : ''}</div>${wave('ph-swell')}</section>`;

const FORM = `<form class="form" id="req" novalidate><label class="hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><div class="f2"><label>Name<input name="name" required autocomplete="name"></label><label>Company<input name="company" autocomplete="organization"></label></div>
<div class="f2"><label>Email<input name="email" type="email" required autocomplete="email"></label><label>Phone<input name="phone" type="tel" autocomplete="tel"></label></div>
<div class="f2"><label>Vessel name<input name="vessel"></label><label>Port<input name="port"></label></div>
<label>Type of incident<select name="type"><option>Casualty</option><option>Cargo</option><option>Crew / medical</option><option>Pollution</option><option>Legal</option><option>Other</option></select></label>
<label>Description<textarea name="desc" rows="5" required></textarea></label>
<fieldset><legend>Preferred callback</legend><label class="rd"><input type="radio" name="cb" value="Phone" checked> Phone</label><label class="rd"><input type="radio" name="cb" value="Email"> Email</label><label class="rd"><input type="radio" name="cb" value="WhatsApp"> WhatsApp</label></fieldset>
<button class="btn btn-sos" type="submit">Request Assistance ${icon('arrow')}</button><p class="form-ok" role="status" hidden></p></form>`;
const contactCards = `<div class="cc"><div class="card card-sos"><span class="morse" aria-hidden="true"><i></i><i></i><i></i><b></b><b></b><b></b><i></i><i></i><i></i></span><h3>${icon('phone')} Emergency Telephone</h3><p class="pending">To be confirmed</p></div>
<div class="card"><h3>${icon('phone')} Phone</h3><p class="pending">To be confirmed</p></div><div class="card"><h3>${icon('mail')} Email</h3><p class="pending">To be confirmed</p></div></div>`;
const lighthouse = `<svg class="pharos" viewBox="0 0 520 420" aria-hidden="true"><defs><linearGradient id="bm" x1="0" x2="1"><stop offset="0" stop-color="#DCE9F7" stop-opacity=".55"/><stop offset="1" stop-color="#DCE9F7" stop-opacity="0"/></linearGradient></defs>
<g class="beam"><path d="M260 96L560 20V172z" fill="url(#bm)"/></g>
<g fill="#2E3F75"><path d="M236 420l10-250h28l10 250z"/><path d="M228 170h64v-14h-64z"/><path d="M242 156h36v-34h-36z" fill="#9CC4EC"/><path d="M236 122h48l-24-30z"/><path d="M150 420h220v-16H150z"/></g><circle cx="260" cy="139" r="9" fill="#fff"/><g stroke="#16224A" stroke-width="3" opacity=".5"><path d="M240 230h40M238 290h44M235 350h50"/></g></svg>`;

const pages = {};
const P = (route, title, body, cls = '') => { pages[route] = { title, body, cls }; };
const svcCard = (s, extra = '') => `<a class="svc ${extra}" href="/services/${s.slug}/">${icon(s.icon, 'svc-ic')}<h3>${esc(s.name)}</h3><p>${esc(s.overview)}</p><span class="more">View service ${icon('arrow')}</span></a>`;
const names = a => a.map(([n]) => `<span class="club">${esc(n)}</span><span class="sep" aria-hidden="true">${MARK(true)}</span>`).join('');
const row = a => `<div class="mq"><div class="mq-in">${names(a)}${names(a)}</div></div>`;

const NUMS = [["<em class=\"cnt\" data-count=\"65\">65</em>+ Years", "Of maritime excellence"], ["24/7", "Emergency response, 365 days a year"], ["Nationwide Coverage", "Across all Egyptian ports"], ["One Trusted Partner", "Surveys, claims, legal, consultancy and crew support under one roof"]];
const teamPanels = TEAM.map(([n, r], i) => `<div class="tp${i === 0 ? ' open' : ''}" tabindex="0"><span class="tp-av"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="24" r="12"/><path d="M8 64c2-16 12-24 24-24s22 8 24 24z"/></svg></span><span class="tp-n"><b>${esc(n)}</b><i>${esc(r)}</i></span><span class="tp-x"><b>${esc(n)}</b><i>${esc(r)}</i><span class="pending">Biography to follow.</span><span class="tp-c"><a class="btn btn-light" href="#">${icon('mail')} Email</a><button class="btn btn-ghost-l reveal">${icon('phone')} Show phone number</button></span></span></div>`).join('');
const track = (cat, not) => `<div class="tk-wrap"><div class="tk" ${cat ? `data-cat="${cat}"` : `data-not="${not}"`} data-posts="8"></div></div>`;
const arrows = `<span class="tk-nav"><button class="tk-b" data-d="-1" aria-label="Previous">←</button><button class="tk-b" data-d="1" aria-label="Next">→</button></span>`;
P('/', HOME.seoTitle, `
<section class="hero">${vid('home', 'hero-art')}<div class="hero-veil"></div>
<div class="wrap hero-txt"><span class="hero-logo-slot"><img class="hero-logo" src="/assets/logo-white.png" alt="" width="1400" height="395"></span><h1 class="type" aria-label="Over 65 years of expertise on the ground, on board, and at sea.">Over 65 years of expertise<br>on the ground, on board,<br>and at sea.</h1><p class="lead rv">${esc(HOME.intro)}</p>
<div class="btns rv"><a class="btn btn-sos" href="/request-assistance/"><span class="beacon"></span>24/7 Emergency Response</a><a class="btn btn-ghost-l" href="/services/">Our Expertise ${icon('arrow')}</a></div></div></section>
<section class="nums"><div class="nums-in">${NUMS.map(([a, b], i) => `<div class="rv fx-l" style="--d:${i * .14}s"><b class="num">${a}</b><span>${esc(b)}</span></div>`).join('')}</div></section>
<section class="exp-sec"><span class="rule rv"></span><div class="wrap"><h2 class="st split">Our Expertise</h2><div class="cards5">${SERVICES.map((s, i) => `<a class="c5 rv fx-flip" style="--d:${i * .11}s" href="/services/${s.slug}/"><span class="c5-glow"></span>${icon(s.icon, 'svc-ic')}<h3>${esc(s.name)}</h3><p>${esc(s.overview)}</p><span class="more">View service ${icon('arrow')}</span></a>`).join('')}</div></div></section>
<section class="trust"><span class="rule rv"></span><div class="wrap trust-head"><h2 class="st split">${esc(HOME.trustedTitle)}</h2><p class="rv fx-r">${esc(HOME.trusted)}</p></div><p class="wrap sub-l rv"><span>Our Principal Appointments</span></p>
${row(HOME.appointments.slice(0, 10))}${row(HOME.appointments.slice(10))}</section>
<section class="team-sec"><span class="rule rv"></span><div class="wrap team-grid"><div class="team-copy"><p class="kicker rv fx-l">Meet Our Team</p><h2 class="st split">${esc(HOME.teamTitle)}</h2><div class="rv">${HOME.team.map(p => `<p>${esc(p)}</p>`).join('')}<a class="btn btn-light" href="/team/">Meet Our Team ${icon('arrow')}</a></div></div><div class="team-v rv fx-r">${vid('team', 'portrait-v')}</div></div></section>`, 'home');

P('/services/', 'Services | MESCO', pageHead('MESCO', 'Services', 'Surveys • Claims • Legal • Consultancy • Crew Support', 'expertise') +
  `<section class="sec"><div class="wrap svc-list">${SERVICES.map((s, i) => `<a class="svc-row rv" href="/services/${s.slug}/"><span class="num">${String(i + 1).padStart(2, '0')}</span>${icon(s.icon, 'svc-ic')}<div><h2>${esc(s.name)}</h2><p>${esc(s.overview)}</p></div>${icon('arrow', 'go')}</a>`).join('')}</div></section>`);

for (const s of SERVICES) {
  const p = PAGES[s.slug];
  P(`/services/${s.slug}/`, `${p.title} | MESCO`, pageHead(p.kicker, p.title, p.tagline, { claims: 'claims', legal: 'claims', surveys: 'surveys', 'crew-medical-repatriation': 'help', 'marine-consultancy': 'trust' }[s.slug]) +
    `<section class="sec"><div class="wrap two"><article class="prose">${p.blocks.map(block).join('')}</article>
<aside class="side"><h3>Services</h3>${SERVICES.map(o => `<a href="/services/${o.slug}/"${o === s ? ' class="cur"' : ''}>${icon(o.icon)}${esc(o.name)}</a>`).join('')}<div class="side-sos"><b>24/7 Emergency Assistance</b><a class="btn btn-sos" href="/request-assistance/">Request Assistance</a></div></aside></div></section>`);
}

P('/about/', 'About MESCO', pageHead('Since 1960', ABOUT.title, ABOUT.tagline) +
  `<section class="sec"><div class="wrap two"><article class="prose">${ABOUT.paras.map(p => `<p>${esc(p)}</p>`).join('')}
<div class="mv"><div class="rv"><h2>Our Mission</h2><p>${esc(ABOUT.mission)}</p></div><div class="rv"><h2>Our Vision</h2><p>${esc(ABOUT.vision)}</p></div></div>
<h2>Why Choose MESCO</h2><ul class="ticks">${ABOUT.why.map(i => `<li>${esc(i)}</li>`).join('')}</ul></article>
<aside class="side side-quote"><div class="yr"><b class="num">1960</b><span>Established by Mr. Hamdy El Sabbagh</span></div><p class="big">${esc(ABOUT.closing[0])}</p><p>${esc(ABOUT.closing[1])}</p></aside></div></section>`);

P('/team/', 'Our Team | MESCO', pageHead('Meet Our Team', HOME.teamTitle, '', 'lng') +
  `<section class="sec"><div class="wrap"><p class="lead narrow">${esc(HOME.team[0])}</p><div class="team">${TEAM.map(([n, r], i) => `<button class="tm rv" data-n="${esc(n)}" data-r="${esc(r)}"><span class="av av${i % 3}"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="24" r="12"/><path d="M8 64c2-16 12-24 24-24s22 8 24 24z"/></svg></span><b>${esc(n)}</b><i>${esc(r)}</i><span class="more">View profile ${icon('arrow')}</span></button>`).join('')}</div></div></section>
<dialog class="dlg" id="tmd"><button class="x" aria-label="Close">×</button><h2></h2><p class="role"></p><p class="pending">Biography to follow.</p><p><a class="btn btn-ghost" href="#">${icon('mail')} Email</a> <button class="btn btn-ghost reveal">${icon('phone')} Show phone number</button></p></dialog>`);

P('/news/', 'Guidelines & News | MESCO', pageHead('Resources', 'Guidelines & News', '', 'trust') +
  `<section class="sec"><div class="wrap two"><div><div class="filters" id="filters"><button class="on" data-c="">All</button>${CATS.map(c => `<button data-c="${esc(c)}">${esc(c === 'Circular' ? 'Circulars' : c === 'P&I report' ? 'P&I reports' : c)}</button>`).join('')}</div><div class="log" data-posts="all"></div></div>
<aside class="side"><h3>Receive our circulars by email</h3><form class="form sub-form" id="sub"><label class="hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><label>Email<input type="email" required placeholder="name@company.com"></label><button class="btn btn-primary">Subscribe</button><p class="form-ok" role="status" hidden></p></form></aside></div></section>`);
P('/news/post/', 'News | MESCO', `<div id="post"></div>`);

const contactBody = (withOffices) => `<section class="sec"><div class="wrap two"><div><h2 class="st">Request Assistance</h2>${FORM}</div>
<aside>${contactCards}${withOffices ? `<div class="card" id="offices"><h3>${icon('pin')} Office Locations</h3><p><b>Alexandria</b></p><p class="pending">Addresses to be confirmed</p><div class="map">${icon('pin')}<span>Interactive Map</span></div></div>` : ''}</aside></div></section>`;
P('/contact/', 'Contact Us | MESCO', pageHead('Contact Us', HOME.helpTitle, HOME.helpSub, 'help') + contactBody(true));
P('/request-assistance/', 'Request Assistance | MESCO', pageHead('24/7 Emergency Assistance', 'Request Assistance', HOME.helpSub, 'help') + contactBody(false));
for (const [u, t] of [['/privacy/', 'Privacy Policy'], ['/terms/', 'Terms & Conditions']]) P(u, `${t} | MESCO`, pageHead('Legal', t, '') + `<section class="sec"><div class="wrap prose"><p class="pending">Text to follow.</p></div></section>`);
P('/admin/', 'MESCO admin', `<div id="app" data-mark='${MARK(true)}' data-markd='${MARK()}'></div>`, 'adm');

/* ---------- Assets ---------- */
const read = f => fs.readFileSync(f, 'utf8');
const css = minCSS(read('src/styles.css') + read('src/admin.css')).css;
const js = async s => (await minJS(s, { compress: true, mangle: true })).code;
const CFG = { url: process.env.SUPABASE_URL || 'https://vxyfumdmikkuzarbetga.supabase.co', key: process.env.SUPABASE_ANON_KEY || 'sb_publishable_ITsZKnMs60YcT7H-G8OMbg_1TSgggn6' };
const postsJs = await js('window.MESCO_CFG=' + JSON.stringify(CFG) + ';' + read('src/posts.js'));
const appJs = await js(read('src/app.js'));
const adminJs = await js('window.MESCO_ADMIN=function(){' + read('src/admin.js').replace("['Circular', 'Loss prevention', 'News']", JSON.stringify(CATS)) + '};');
const FONTS = { disp: '@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2', sans: '@fontsource-variable/dm-sans/files/dm-sans-latin-opsz-normal.woff2', serif: '@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2', serifi: '@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-italic.woff2', num: '@fontsource-variable/big-shoulders-display/files/big-shoulders-display-latin-wght-normal.woff2' };
const favicon = MARK().replace('<svg class="mark"', '<svg xmlns="http://www.w3.org/2000/svg"');
const doc = ({ title, body, cls }, head, tail) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(title)}</title><meta name="description" content="${esc(HOME.seoDesc)}">${head}<script>document.documentElement.className='js'</script></head>
<body class="${cls}">${header}<main id="main">${body}</main>${footer}${tail}</body></html>`;
const mini = h => minHTML(h, { collapseWhitespace: true, removeComments: true });

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(`${OUT}/assets`, { recursive: true });
for (const [u, pg] of Object.entries(pages)) {
  fs.mkdirSync(path.join(OUT, u), { recursive: true });
  fs.writeFileSync(path.join(OUT, u, 'index.html'), await mini(doc(pg, '<link rel="stylesheet" href="/assets/styles.css"><link rel="icon" href="/assets/favicon.svg">', '<script src="/assets/posts.js"></script><script src="/assets/admin.js"></script><script src="/assets/app.js"></script>')));
}
fs.writeFileSync(`${OUT}/assets/styles.css`, css);
fs.writeFileSync(`${OUT}/assets/posts.js`, postsJs); fs.writeFileSync(`${OUT}/assets/app.js`, appJs); fs.writeFileSync(`${OUT}/assets/admin.js`, adminJs);
for (const [k, f] of Object.entries(FONTS)) fs.copyFileSync('node_modules/' + f, `${OUT}/assets/${k}.woff2`);
for (const f of ['logo-navy.png', 'logo-white.png']) fs.copyFileSync('media/' + f, `${OUT}/assets/${f}`);
fs.mkdirSync(`${OUT}/assets/v`, { recursive: true }); for (const f of fs.readdirSync('media/v')) fs.copyFileSync('media/v/' + f, `${OUT}/assets/v/${f}`);
fs.writeFileSync(`${OUT}/assets/favicon.svg`, favicon);
fs.writeFileSync(`${OUT}/robots.txt`, 'User-agent: *\nDisallow: /\n');

/* Single self-contained file for offline review: every page, font and script inside one HTML. Not deployed. */
if (process.env.VERCEL !== '1') {
  let c1 = css; for (const [k, f] of Object.entries(FONTS)) c1 = c1.replace(`/assets/${k}.woff2`, 'data:font/woff2;base64,' + fs.readFileSync('node_modules/' + f).toString('base64'));
  const map = {}; for (const [u, pg] of Object.entries(pages)) map[u] = { t: pg.title, c: pg.cls, h: await mini(pg.body) };
  const safe = s => s.replace(/<\/script/gi, '<\\/script');
  const MEDIA = { 'logo-navy.png': 'image/png', 'logo-white.png': 'image/png' }; for (const f of fs.readdirSync('media/v')) if (f.endsWith('.jpg')) MEDIA['v/' + f] = 'image/jpeg';
  const VIDEO = `<script>window.MESCO_VIDEOS=${JSON.stringify(Object.fromEntries(fs.readdirSync('media/v').filter(f => f.endsWith('.mp4')).map(f => [f.slice(0, -4), 'data:video/mp4;base64,' + fs.readFileSync('media/v/' + f).toString('base64')])))}</script>`;
  const inlineMedia = h => { h = h.replace(/<source[^>]*\/assets\/v\/[^>]*>/g, ''); for (const [f, t] of Object.entries(MEDIA)) h = h.split('/assets/' + f).join('data:' + t + ';base64,' + fs.readFileSync('media/' + f).toString('base64')); return h; };
  fs.mkdirSync('dist', { recursive: true });
  fs.writeFileSync('dist/MESCO-site-draft.html', inlineMedia(doc(pages['/'], `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(favicon)}"><style>${c1}</style>`, VIDEO + `<script>window.MESCO_PAGES=${safe(JSON.stringify(map))}</script><script>${safe(postsJs)}</script><script>${safe(adminJs)}</script><script>${safe(appJs)}</script>`)));

  const SP = seoPages({ esc, icon, pageHead, HOME, PAGES, ABOUT });
  const ribbon = `<header class="hd"><div class="wrap hd-in">${LOGO(true)}<span class="seo-tag">Search &amp; AI visibility pages · not in the main menu</span><a class="btn btn-ghost-l" href="/">All pages</a></div></header>`;
  fs.writeFileSync('dist/MESCO-search-pages.html', inlineMedia(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>MESCO search pages</title><link rel="icon" href="data:image/svg+xml,${encodeURIComponent(favicon)}"><style>${c1}</style><script>document.documentElement.className='js'</script></head><body class="seo">${ribbon}<main id="main"></main><footer class="ft">${wave('ft-swell')}<div class="wrap ft-base"><span>© 2026 Middle East Survey &amp; Control Office</span><span class="stamp">${STAMP}</span></div></footer><script>window.MESCO_PAGES=${safe(JSON.stringify(SP))}</script><script>${safe(postsJs)}</script><script>${safe(appJs)}</script></body></html>`));}
console.log('Built', Object.keys(pages).length, 'pages ·', STAMP);
