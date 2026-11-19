// MESCO admin — live. Sign-in, posts, files and subscribers are stored in the MESCO database (Supabase). Emails are sent through /api/send-circular.
(function () {
  var M = window.MESCO, C = M.cfg, app = document.getElementById('app'), MARK = app.dataset.mark, MARKD = app.dataset.markd, e = M.esc;
  var CATS = ['Circular', 'Loss prevention', 'News'];
  var TEAM = [['Seif El Din El Sabbagh', 'General Manager'], ['Team member', 'Maritime lawyer'], ['Team member', 'Marine surveyor'], ['Team member', 'Claims handler'], ['Team member', 'Crew & medical assistance']];
  var S = { view: 'login', post: null, modal: null, posts: [], subs: [], reqs: [], busy: false };
  var sess = (function () { try { return JSON.parse(localStorage.getItem('mesco_sess') || 'null'); } catch (x) { return null; } })();
  function keep(s) { sess = s; try { s ? localStorage.setItem('mesco_sess', JSON.stringify(s)) : localStorage.removeItem('mesco_sess'); } catch (x) {} }

  /* ---------- API ---------- */
  function auth(path, body) {
    return fetch(C.url + '/auth/v1/' + path, { method: 'POST', headers: { apikey: C.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error_description || j.msg || j.message || 'Sign-in failed'); return j; }); });
  }
  function refresh() { return auth('token?grant_type=refresh_token', { refresh_token: sess.refresh_token }).then(function (j) { keep({ access_token: j.access_token, refresh_token: j.refresh_token, email: j.user.email }); }); }
  function api(path, opt, retried) {
    opt = opt || {};
    var h = { apikey: C.key, Authorization: 'Bearer ' + (sess && sess.access_token) };
    if (opt.json !== undefined) { h['Content-Type'] = 'application/json'; opt.body = JSON.stringify(opt.json); }
    for (var k in (opt.headers || {})) h[k] = opt.headers[k];
    return fetch(path.charAt(0) === '/' && path.indexOf('/api/') !== 0 ? C.url + path : path, { method: opt.method || 'GET', headers: h, body: opt.body })
      .then(function (r) {
        if (r.status === 401 && !retried && sess && sess.refresh_token) return refresh().then(function () { return api(path, opt, true); }, function () { signout('Your session expired. Sign in again.'); throw new Error('Session expired'); });
        return r.text().then(function (t) { var j; try { j = t ? JSON.parse(t) : null; } catch (x) { j = t; } if (!r.ok) throw new Error((j && (j.error || j.message || j.msg)) || 'Request failed (' + r.status + ')'); return j; });
      });
  }
  function upload(file, name) {
    var p = 'uploads/' + Date.now() + '-' + name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
    return api('/storage/v1/object/media/' + p, { method: 'POST', body: file, headers: { 'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'true' } })
      .then(function () { return C.url + '/storage/v1/object/public/media/' + p; });
  }
  function loadAll() {
    return Promise.all([
      api('/rest/v1/posts?select=*&order=date.desc,created_at.desc'),
      api('/rest/v1/subscribers?select=*&order=created_at.desc'),
      api('/rest/v1/requests?select=*&order=created_at.desc'),
    ]).then(function (r) { S.posts = r[0].map(M.map); S.subs = r[1]; S.reqs = r[2]; });
  }
  var active = function () { return S.subs.filter(function (s) { return s.status === 'active'; }); };

  function toast(t, bad) { var d = document.createElement('div'); d.className = 'toast' + (bad ? ' bad' : ''); d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 4200); }
  function fail(x) { S.busy = false; toast(x.message || 'Something went wrong', true); render(); }
  function blank() { return { id: null, cat: 'Circular', date: new Date().toISOString().slice(0, 10), status: 'draft', title: '', summary: '', body: '', cover: '', pdfUrl: '', pdf: '', notify: true }; }

  /* ---------- Views ---------- */
  function login() {
    return '<div class="lg"><form class="lg-card form" data-form="login"><div class="lg-logo">' + MARKD + '<div><b>MESCO</b><span>Site admin</span></div></div><h1>Sign in</h1><p>Publish news, circulars and guidelines, and email them to subscribers.</p>' +
      '<label>Email<input type="email" name="email" autocomplete="username" required></label><label>Password<input type="password" name="pw" autocomplete="current-password" required></label>' +
      '<button class="btn btn-primary">' + (S.busy ? 'Signing in…' : 'Sign in') + '</button><a href="#" data-act="forgot">Forgot password?</a></form></div>';
  }
  function shell(inner) {
    var item = function (v, label, n) { return '<button data-go="' + v + '"' + (S.view === v || (v === 'posts' && S.view === 'edit') ? ' class="on"' : '') + '>' + label + (n != null ? '<i>' + n + '</i>' : '') + '</button>'; };
    var fresh = S.reqs.filter(function (r) { return r.status === 'New'; }).length;
    return '<div class="ad"><aside class="ad-side"><div class="ad-logo">' + MARK + '<div><b>MESCO</b><span>Site admin</span></div></div>' +
      '<nav class="ad-nav">' + item('posts', 'News &amp; circulars', S.posts.length) + item('subs', 'Subscribers', active().length) + item('team', 'Team') + item('reqs', 'Requests', fresh || S.reqs.length) + '</nav>' +
      '<div class="ad-foot"><small class="ad-who">' + e(sess && sess.email) + '</small><a href="/" target="_blank">View site <span aria-hidden="true">↗</span></a><button data-act="logout">Sign out</button></div></aside><main class="ad-main">' + inner + '</main></div>' + (S.modal ? S.modal() : '');
  }
  function posts() {
    return '<div class="ad-h"><div><h1>News &amp; circulars</h1><p>Everything published here appears on the Guidelines &amp; News page straight away.</p></div><button class="btn btn-primary" data-act="new">+ New post</button></div>' +
      '<div class="tbl"><div class="tr th"><span>Title</span><span>Category</span><span>Date</span><span>Status</span><span></span></div>' + (S.posts.length ? S.posts.map(function (p) {
        return '<div class="tr"><span><b>' + e(p.title || 'Untitled') + '</b></span><span>' + e(p.cat) + '</span><span>' + M.fmt(p.date) + '</span><span><em class="st ' + p.status + '">' + (p.status === 'published' ? 'Published' : 'Draft') + '</em></span><span class="acts"><button data-act="edit" data-id="' + p.id + '">Edit</button>' + (p.status === 'published' ? '<button data-act="send" data-id="' + p.id + '">Email</button>' : '') + '<button data-act="del" data-id="' + p.id + '">Delete</button></span></div>';
      }).join('') : '<div class="tr"><span>No posts yet. Press “New post”.</span></div>') + '</div>';
  }
  function editor() {
    var p = S.post;
    return '<div class="ad-h"><div><button class="back" data-go="posts">← All posts</button><h1>' + (p.id ? 'Edit post' : 'New post') + '</h1></div><div class="acts"><button class="btn btn-ghost" data-act="save"' + (S.busy ? ' disabled' : '') + '>Save draft</button><button class="btn btn-primary" data-act="publish"' + (S.busy ? ' disabled' : '') + '>' + (S.busy ? 'Saving…' : 'Publish') + '</button></div></div>' +
      '<div class="ed"><div class="ed-form form">' +
      '<div class="step"><b>1</b> Details</div><label>Title<input id="f-title" value="' + e(p.title) + '" placeholder="e.g. Circular 12/2026: Port update"></label>' +
      '<div class="f2"><label>Category<select id="f-cat">' + CATS.map(function (c) { return '<option' + (c === p.cat ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></label><label>Date<input id="f-date" type="date" value="' + p.date + '"></label></div>' +
      '<label>Summary <small>shown in the list and the email — max 200 characters (<span id="cnt">' + p.summary.length + '</span>/200)</small><textarea id="f-sum" rows="2" maxlength="200">' + e(p.summary) + '</textarea></label>' +
      '<div class="step"><b>2</b> Cover image</div><label class="drop" id="drop">' + (p.cover ? '<img src="' + e(p.cover) + '" alt="">' : '<span>Click to choose an image<small>JPG or PNG. Resized automatically.</small></span>') + '<input type="file" id="f-cover" accept="image/*" hidden></label>' + (p.cover ? '<button class="back" data-act="nocover">Remove cover image</button>' : '') +
      '<div class="step"><b>3</b> Text</div><div class="rte"><div class="tb"><button data-cmd="bold"><b>B</b></button><button data-cmd="italic"><i>I</i></button><button data-cmd="formatBlock" data-val="h2">Heading</button><button data-cmd="formatBlock" data-val="p">Text</button><button data-cmd="insertUnorderedList">• List</button><button data-cmd="createLink">Link</button><button data-act="img">+ Image</button><input type="file" id="f-img" accept="image/*" hidden></div><div class="rte-body" id="f-body" contenteditable="true" data-ph="Write or paste the full text here…">' + p.body + '</div></div>' +
      '<div class="step"><b>4</b> PDF and email</div><label class="pdf"><span>' + (p.pdf ? '📎 ' + e(p.pdf) : 'Attach the PDF version (optional)') + '</span><input type="file" id="f-pdf" accept="application/pdf" hidden><em>Choose file</em></label>' +
      '<label class="ck"><input type="checkbox" id="f-notify"' + (p.notify !== false ? ' checked' : '') + '> After publishing, open the email step (' + active().length + ' subscribers)</label>' +
      '</div><div class="ed-prev"><p class="pv-l">Live preview — list card</p><div id="pv-card"></div><p class="pv-l">Live preview — page</p><div class="pv-page" id="pv-page"></div></div></div>';
  }
  function preview() {
    var p = S.post, c = document.getElementById('pv-card'); if (!c) return;
    c.innerHTML = '<div class="post"><div class="cover"' + (p.cover ? ' style="background-image:url(' + e(p.cover) + ')"' : '') + '></div><div class="post-b"><div class="meta"><span class="chip">' + e(p.cat) + '</span>' + M.fmt(p.date) + '</div><h3>' + e(p.title || 'Post title') + '</h3><p>' + e(p.summary || 'The summary appears here.') + '</p></div></div>';
    document.getElementById('pv-page').innerHTML = '<h2>' + e(p.title || 'Post title') + '</h2>' + (p.body || '<p class="pending">The full text appears here.</p>');
  }
  function subsView() {
    var l = S.subs;
    return '<div class="ad-h"><div><h1>Subscribers</h1><p>Collected from the subscribe box on the site. Every email carries a one-click unsubscribe link.</p></div><div class="acts"><button class="btn btn-ghost" data-act="csv">Export CSV</button></div></div>' +
      '<form class="add form" data-form="addsub"><input type="email" placeholder="Add an email address" required><button class="btn btn-primary">Add</button></form>' +
      '<div class="tbl"><div class="tr th t2"><span>Email</span><span></span></div>' + (l.length ? l.map(function (s) { return '<div class="tr t2"><span>' + e(s.email) + (s.status !== 'active' ? ' <em class="st draft">Unsubscribed</em>' : '') + ' <small style="opacity:.6">' + new Date(s.created_at).toLocaleDateString('en-GB') + '</small></span><span class="acts"><button data-act="rmsub" data-id="' + s.id + '">Remove</button></span></div>'; }).join('') : '<div class="tr t2"><span>No subscribers yet.</span></div>') + '</div>';
  }
  function teamView() {
    return '<div class="ad-h"><div><h1>Team</h1><p>The Our Team page.</p></div></div><div class="tbl"><div class="tr th t3"><span>Name</span><span>Position</span><span></span></div>' +
      TEAM.map(function (t) { return '<div class="tr t3"><span><b>' + e(t[0]) + '</b></span><span>' + e(t[1]) + '</span><span></span></div>'; }).join('') + '</div><p class="hint">Team editing is switched on once MESCO sends the final names, photos and positions.</p>';
  }
  function reqsView() {
    return '<div class="ad-h"><div><h1>Requests</h1><p>Every Request Assistance submission from the site. The 24/7 team is emailed as each one arrives.</p></div><button class="btn btn-ghost" data-act="reload">Refresh</button></div>' +
      (S.reqs.length ? S.reqs.map(function (r) {
        return '<details class="card" style="margin-bottom:10px;padding:14px 18px"><summary style="cursor:pointer;display:flex;gap:16px;flex-wrap:wrap;align-items:center"><b>' + e(r.ref) + '</b><span>' + e(r.name) + (r.company ? ' · ' + e(r.company) : '') + '</span><span>' + e(r.type) + '</span><span>' + e(r.port) + '</span><small style="opacity:.6">' + new Date(r.created_at).toLocaleString('en-GB') + '</small><select data-req="' + r.id + '" style="margin-left:auto">' + ['New', 'In hand', 'Closed'].map(function (s) { return '<option' + (r.status === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></summary>' +
          '<p style="margin:12px 0 4px"><a href="mailto:' + e(r.email) + '">' + e(r.email) + '</a>' + (r.phone ? ' · <a href="tel:' + e(r.phone) + '">' + e(r.phone) + '</a>' : '') + (r.vessel ? ' · Vessel: ' + e(r.vessel) : '') + (r.callback ? ' · Callback: ' + e(r.callback) : '') + '</p><p style="white-space:pre-wrap;margin:0">' + e(r.description) + '</p></details>';
      }).join('') : '<p class="hint">No requests yet.</p>');
  }
  function sendModal() {
    var p = S.post, n = active().length;
    return '<div class="ov"><div class="md"><button class="x" data-act="close">×</button><h2>Email to subscribers</h2><p>Preview of the email your ' + n + ' subscriber' + (n === 1 ? '' : 's') + ' receive.</p>' +
      '<div class="em"><div class="em-h">' + MARK + '<b>MESCO</b><span>' + e(p.cat) + '</span></div>' + (p.cover ? '<img src="' + e(p.cover) + '" alt="">' : '') + '<div class="em-b"><small>' + M.fmt(p.date) + '</small><h3>' + e(p.title || 'Untitled') + '</h3><p>' + e(p.summary) + '</p><span class="btn btn-primary">Read the full ' + e(p.cat.toLowerCase()) + '</span>' + (p.pdf ? '<span class="em-pdf">📎 ' + e(p.pdf) + '</span>' : '') + '</div><div class="em-f">Middle East Survey &amp; Control Office · Alexandria, Egypt<br>You receive this because you subscribed on the MESCO website · <u>Unsubscribe</u></div></div>' +
      '<div class="acts"><button class="btn btn-ghost" data-act="test"' + (S.busy ? ' disabled' : '') + '>Send test to ' + e(sess.email) + '</button><button class="btn btn-primary" data-act="sendall"' + (S.busy || !n ? ' disabled' : '') + '>' + (S.busy ? 'Sending…' : n ? 'Send to ' + n + ' subscriber' + (n === 1 ? '' : 's') : 'No subscribers yet') + '</button></div></div></div>';
  }
  function render() {
    var v = { login: login, posts: posts, edit: editor, subs: subsView, team: teamView, reqs: reqsView }[S.view]();
    app.innerHTML = S.view === 'login' ? v : shell(v);
    if (S.view === 'edit') preview();
    var on = app.querySelector('.ad-nav .on'); if (on && on.scrollIntoView && innerWidth <= 900) on.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }

  /* ---------- Helpers ---------- */
  function pull() { var p = S.post, g = function (i) { return document.getElementById(i); }; if (!g('f-title')) return; p.title = g('f-title').value; p.cat = g('f-cat').value; p.date = g('f-date').value || p.date; p.summary = g('f-sum').value; p.body = g('f-body').innerHTML; p.notify = g('f-notify').checked; }
  function shrink(file, max, cb) { var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, max / im.width), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); c.toBlob(cb, 'image/jpeg', .82); }; im.src = r.result; }; r.readAsDataURL(file); }
  function store(status) {
    pull(); var p = S.post; if (!p.title.trim()) { toast('Add a title first.', true); return Promise.reject(new Error('Add a title first.')); }
    var row = { cat: p.cat, date: p.date, title: p.title.trim(), summary: p.summary, body: p.body, cover_url: p.cover || null, pdf_url: p.pdfUrl || null, pdf_name: p.pdf || null, status: status, updated_at: new Date().toISOString() };
    S.busy = true; render();
    var q = p.id ? api('/rest/v1/posts?id=eq.' + p.id, { method: 'PATCH', json: row, headers: { Prefer: 'return=representation' } }) : api('/rest/v1/posts', { method: 'POST', json: row, headers: { Prefer: 'return=representation' } });
    return q.then(function (r) { var n = M.map(r[0]); n.notify = p.notify; S.post = n; S.busy = false; return loadAll(); });
  }
  function sendNow(test) {
    S.busy = true; render();
    api('/api/send-circular', { method: 'POST', json: { post_id: S.post.id, test: !!test } })
      .then(function (j) { S.busy = false; if (!test) S.modal = null; render(); toast(test ? 'Test email sent to ' + j.to + '.' : 'Sent to ' + j.sent + ' subscriber' + (j.sent === 1 ? '' : 's') + '.'); })
      .catch(fail);
  }
  function enter() { S.view = 'posts'; app.innerHTML = '<div class="lg"><p>Loading…</p></div>'; loadAll().then(render, function (x) { signout(x.message); }); }
  function signout(msg) { keep(null); S.view = 'login'; S.modal = null; S.busy = false; render(); if (msg) toast(msg, true); }

  /* ---------- Events ---------- */
  app.addEventListener('submit', function (ev) {
    ev.preventDefault(); var f = ev.target.dataset.form;
    if (f === 'login') {
      var em = ev.target.email.value.trim(), pw = ev.target.pw.value; S.busy = true; render();
      auth('token?grant_type=password', { email: em, password: pw })
        .then(function (j) { keep({ access_token: j.access_token, refresh_token: j.refresh_token, email: j.user.email }); S.busy = false; return api('/rest/v1/staff?select=user_id'); })
        .then(function (r) { if (!r.length) { signout('This account is not on the MESCO staff list.'); return; } enter(); })
        .catch(function (x) { S.busy = false; render(); toast(/invalid/i.test(x.message) ? 'Email or password is incorrect.' : x.message, true); });
    }
    if (f === 'addsub') {
      var v = ev.target.querySelector('input').value.trim().toLowerCase();
      api('/rest/v1/subscribers?on_conflict=email', { method: 'POST', json: { email: v, status: 'active' }, headers: { Prefer: 'resolution=merge-duplicates,return=minimal' } })
        .then(loadAll).then(function () { render(); toast('Subscriber added.'); }).catch(fail);
    }
  });
  app.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-go],[data-act],[data-cmd]'); if (!b || b.disabled) return;
    if (b.dataset.cmd) { ev.preventDefault(); var val = b.dataset.val || null; if (b.dataset.cmd === 'createLink') { val = prompt('Link address', 'https://'); if (!val) return; } document.getElementById('f-body').focus(); document.execCommand(b.dataset.cmd, false, val); pull(); preview(); return; }
    if (b.dataset.go) { S.view = b.dataset.go; S.modal = null; render(); return; }
    var a = b.dataset.act, id = b.dataset.id, find = function () { return S.posts.filter(function (p) { return p.id === id; })[0]; };
    if (a === 'forgot') {
      ev.preventDefault(); var em = (app.querySelector('[name=email]') || {}).value;
      if (!em) { toast('Type your email address first, then press “Forgot password?”.', true); return; }
      auth('recover', { email: em, redirect_to: location.origin + '/admin/' }).then(function () { toast('If that address is a staff account, a reset link is on its way.'); }).catch(fail);
    }
    if (a === 'logout') { fetch(C.url + '/auth/v1/logout', { method: 'POST', headers: { apikey: C.key, Authorization: 'Bearer ' + sess.access_token } }); signout(); }
    if (a === 'new') { S.post = blank(); S.view = 'edit'; render(); }
    if (a === 'edit') { S.post = JSON.parse(JSON.stringify(find())); S.post.notify = false; S.view = 'edit'; render(); }
    if (a === 'del') { if (confirm('Delete this post? It is removed from the site straight away.')) api('/rest/v1/posts?id=eq.' + id, { method: 'DELETE' }).then(loadAll).then(function () { render(); toast('Post deleted.'); }).catch(fail); }
    if (a === 'send') { S.post = find(); S.modal = sendModal; render(); }
    if (a === 'save') store('draft').then(function () { render(); toast('Draft saved. Drafts are not visible on the site.'); }, fail);
    if (a === 'publish') { var nt = S.post.notify; store('published').then(function () { if (nt) { S.modal = sendModal; } else S.view = 'posts'; render(); toast('Published. It is now live on the Guidelines & News page.'); }, fail); }
    if (a === 'close') { S.modal = null; if (S.view === 'edit') S.view = 'posts'; render(); }
    if (a === 'test') sendNow(true);
    if (a === 'sendall') { if (confirm('Send this email to ' + active().length + ' subscribers now? This cannot be undone.')) sendNow(false); }
    if (a === 'rmsub') { if (confirm('Remove this subscriber?')) api('/rest/v1/subscribers?id=eq.' + id, { method: 'DELETE' }).then(loadAll).then(render).catch(fail); }
    if (a === 'csv') { var link = document.createElement('a'); link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent('email,status,subscribed\n' + S.subs.map(function (s) { return s.email + ',' + s.status + ',' + s.created_at.slice(0, 10); }).join('\n')); link.download = 'mesco-subscribers.csv'; link.click(); }
    if (a === 'img') { ev.preventDefault(); document.getElementById('f-img').click(); }
    if (a === 'nocover') { ev.preventDefault(); pull(); S.post.cover = ''; render(); }
    if (a === 'reload') loadAll().then(render).catch(fail);
  });
  app.addEventListener('change', function (ev) {
    var t = ev.target;
    if (t.dataset.req) { api('/rest/v1/requests?id=eq.' + t.dataset.req, { method: 'PATCH', json: { status: t.value } }).then(loadAll).then(function () { toast('Status updated.'); }).catch(fail); return; }
    var f = t.files && t.files[0]; if (!f) return;
    if (t.id === 'f-cover') { toast('Uploading image…'); shrink(f, 1600, function (bl) { upload(bl, 'cover.jpg').then(function (u) { pull(); S.post.cover = u; render(); }).catch(fail); }); }
    if (t.id === 'f-img') { toast('Uploading image…'); shrink(f, 1400, function (bl) { upload(bl, 'image.jpg').then(function (u) { document.getElementById('f-body').focus(); document.execCommand('insertImage', false, u); pull(); preview(); }).catch(fail); }); }
    if (t.id === 'f-pdf') { if (f.size > 20e6) { toast('PDF is over 20 MB. Please compress it first.', true); return; } toast('Uploading PDF…'); upload(f, f.name).then(function (u) { pull(); S.post.pdfUrl = u; S.post.pdf = f.name; render(); toast('PDF attached.'); }).catch(fail); }
  });
  app.addEventListener('input', function (ev) { if (S.view !== 'edit') return; pull(); if (ev.target.id === 'f-sum') document.getElementById('cnt').textContent = ev.target.value.length; preview(); });

  // Password-reset links land here with a recovery token in the URL hash.
  var h = new URLSearchParams(location.hash.slice(1));
  if (h.get('type') === 'recovery' && h.get('access_token')) {
    keep({ access_token: h.get('access_token'), refresh_token: h.get('refresh_token'), email: '' }); history.replaceState(null, '', location.pathname);
    var pw = prompt('Choose a new password (at least 10 characters)');
    if (pw && pw.length >= 10) api('/auth/v1/user', { method: 'PUT', json: { password: pw } }).then(function (u) { sess.email = u.email; keep(sess); toast('Password changed.'); enter(); }).catch(fail);
    else signout('Password not changed. Request a new reset link.');
    return;
  }
  if (sess && sess.access_token) enter(); else render();
})();
