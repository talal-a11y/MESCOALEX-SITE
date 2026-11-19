// MESCO admin — visual demo. Posts and subscribers are saved in this browser only; no email is sent.
(function () {
  var M = window.MESCO, app = document.getElementById('app'), MARK = app.dataset.mark, MARKD = app.dataset.markd, e = M.esc;
  var S = { view: sessionStorage.getItem('mesco_admin') ? 'posts' : 'login', post: null, modal: null };
  var SAMPLE_SUBS = ['claims@sample-club.example', 'correspondents@sample-insurer.example', 'ops@sample-shipowner.example'];
  var subs = function () { return SAMPLE_SUBS.concat(M.read('mesco_subs')).filter(function (s) { return M.read('mesco_unsubs').indexOf(s) < 0; }); };
  var CATS = ['Circular', 'Loss prevention', 'News'];
  var REQS = [['MES-2026-4812', 'Sample request', 'Cargo', 'Alexandria', 'New'], ['MES-2026-4807', 'Sample request', 'Crew / medical', 'Port Said', 'In hand'], ['MES-2026-4795', 'Sample request', 'Casualty', 'Suez', 'Closed']];
  var TEAM = [['Seif El Din El Sabbagh', 'General Manager'], ['Team member', 'Maritime lawyer'], ['Team member', 'Marine surveyor'], ['Team member', 'Claims handler'], ['Team member', 'Crew & medical assistance']];

  function toast(t) { var d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 3800); }
  function blank() { return { id: 'p' + Date.now(), cat: 'Circular', date: new Date().toISOString().slice(0, 10), status: 'draft', title: '', summary: '', body: '', cover: '', pdf: '', notify: true }; }

  /* ---------- Views ---------- */
  function login() {
    return '<div class="lg"><form class="lg-card form" data-form="login"><div class="lg-logo">' + MARKD + '<div><b>MESCO</b><span>Site admin</span></div></div><h1>Sign in</h1><p>Publish news, circulars and team changes.</p>' +
      '<label>Email<input type="email" value="staff@mescoalex.com" required></label><label>Password<input type="password" value="demo-password" required></label>' +
      '<button class="btn btn-primary">Sign in</button><a href="#" data-act="forgot">Forgot password?</a><p class="hint">Demo: details are pre-filled. Press Sign in.</p></form></div>';
  }
  function shell(inner) {
    var item = function (v, label, n) { return '<button data-go="' + v + '"' + (S.view === v || (v === 'posts' && S.view === 'edit') ? ' class="on"' : '') + '>' + label + (n != null ? '<i>' + n + '</i>' : '') + '</button>'; };
    return '<div class="ad"><aside class="ad-side"><div class="ad-logo">' + MARK + '<div><b>MESCO</b><span>Site admin</span></div></div>' +
      item('posts', 'News &amp; circulars', M.all().length) + item('subs', 'Subscribers', subs().length) + item('team', 'Team') + item('reqs', 'Requests', REQS.length) +
      '<div class="ad-foot"><a href="/" target="_blank">View site ↗</a><button data-act="logout">Sign out</button></div></aside><main class="ad-main">' + inner + '</main></div>' + (S.modal || '');
  }
  function posts() {
    return '<div class="ad-h"><div><h1>News &amp; circulars</h1><p>Everything published here appears on the Guidelines &amp; News page.</p></div><button class="btn btn-primary" data-act="new">+ New post</button></div>' +
      '<div class="tbl"><div class="tr th"><span>Title</span><span>Category</span><span>Date</span><span>Status</span><span></span></div>' + M.all().map(function (p) {
        return '<div class="tr"><span><b>' + e(p.title || 'Untitled') + '</b></span><span>' + e(p.cat) + '</span><span>' + M.fmt(p.date) + '</span><span><em class="st ' + p.status + '">' + (p.status === 'published' ? 'Published' : 'Draft') + '</em></span><span class="acts"><button data-act="edit" data-id="' + p.id + '">Edit</button><button data-act="send" data-id="' + p.id + '">Email</button><button data-act="del" data-id="' + p.id + '">Delete</button></span></div>';
      }).join('') + '</div>';
  }
  function editor() {
    var p = S.post;
    return '<div class="ad-h"><div><button class="back" data-go="posts">← All posts</button><h1>' + (p.title ? 'Edit post' : 'New post') + '</h1></div><div class="acts"><button class="btn btn-ghost" data-act="save">Save draft</button><button class="btn btn-primary" data-act="publish">Publish</button></div></div>' +
      '<div class="ed"><div class="ed-form form">' +
      '<div class="step"><b>1</b> Details</div><label>Title<input id="f-title" value="' + e(p.title) + '" placeholder="e.g. Circular 12/2026: Port update"></label>' +
      '<div class="f2"><label>Category<select id="f-cat">' + CATS.map(function (c) { return '<option' + (c === p.cat ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></label><label>Date<input id="f-date" type="date" value="' + p.date + '"></label></div>' +
      '<label>Summary <small>shown in the list — two lines, max 200 characters (<span id="cnt">' + p.summary.length + '</span>/200)</small><textarea id="f-sum" rows="2" maxlength="200">' + e(p.summary) + '</textarea></label>' +
      '<div class="step"><b>2</b> Cover image</div><label class="drop" id="drop">' + (p.cover ? '<img src="' + p.cover + '" alt="">' : '<span>Click to choose an image<small>JPG or PNG. Resized automatically.</small></span>') + '<input type="file" id="f-cover" accept="image/*" hidden></label>' +
      '<div class="step"><b>3</b> Text</div><div class="rte"><div class="tb"><button data-cmd="bold"><b>B</b></button><button data-cmd="italic"><i>I</i></button><button data-cmd="formatBlock" data-val="h2">Heading</button><button data-cmd="formatBlock" data-val="p">Text</button><button data-cmd="insertUnorderedList">• List</button><button data-cmd="createLink">Link</button><button data-act="img">+ Image</button><input type="file" id="f-img" accept="image/*" hidden></div><div class="rte-body" id="f-body" contenteditable="true" data-ph="Write or paste the full text here…">' + p.body + '</div></div>' +
      '<div class="step"><b>4</b> PDF and email</div><label class="pdf"><span>' + (p.pdf ? '📎 ' + e(p.pdf) : 'Attach the PDF version (optional)') + '</span><input type="file" id="f-pdf" accept="application/pdf" hidden><em>Choose file</em></label>' +
      '<label class="ck"><input type="checkbox" id="f-notify"' + (p.notify !== false ? ' checked' : '') + '> Email this post to subscribers when published (' + subs().length + ' subscribers)</label>' +
      '</div><div class="ed-prev"><p class="pv-l">Live preview — list card</p><div id="pv-card"></div><p class="pv-l">Live preview — page</p><div class="pv-page" id="pv-page"></div></div></div>';
  }
  function preview() {
    var p = S.post, c = document.getElementById('pv-card'); if (!c) return;
    c.innerHTML = '<div class="post"><div class="cover"' + (p.cover ? ' style="background-image:url(' + p.cover + ')"' : '') + '></div><div class="post-b"><div class="meta"><span class="chip">' + e(p.cat) + '</span>' + M.fmt(p.date) + '</div><h3>' + e(p.title || 'Post title') + '</h3><p>' + e(p.summary || 'The summary appears here.') + '</p></div></div>';
    document.getElementById('pv-page').innerHTML = '<h2>' + e(p.title || 'Post title') + '</h2>' + (p.body || '<p class="pending">The full text appears here.</p>');
  }
  function subsView() {
    return '<div class="ad-h"><div><h1>Subscribers</h1><p>Collected from the subscribe box on the site. Every email carries an unsubscribe link.</p></div><div class="acts"><button class="btn btn-ghost" data-act="csv">Export CSV</button></div></div>' +
      '<form class="add form" data-form="addsub"><input type="email" placeholder="Add an email address" required><button class="btn btn-primary">Add</button></form>' +
      '<div class="tbl"><div class="tr th t2"><span>Email</span><span></span></div>' + subs().map(function (s) { return '<div class="tr t2"><span>' + e(s) + (SAMPLE_SUBS.indexOf(s) >= 0 ? ' <em class="st draft">Sample</em>' : '') + '</span><span class="acts"><button data-act="unsub" data-id="' + e(s) + '">Remove</button></span></div>'; }).join('') + '</div>';
  }
  function teamView() {
    return '<div class="ad-h"><div><h1>Team</h1><p>Add, edit, reorder or remove team members. Changes appear on the Our Team page.</p></div><button class="btn btn-primary" data-act="soon">+ Add member</button></div><div class="tbl"><div class="tr th t3"><span>Name</span><span>Position</span><span></span></div>' +
      TEAM.map(function (t) { return '<div class="tr t3"><span><b>' + e(t[0]) + '</b></span><span>' + e(t[1]) + '</span><span class="acts"><button data-act="soon">Edit</button></span></div>'; }).join('') + '</div><p class="hint">Draft: the team editor is shown for layout. It is switched on in the build phase.</p>';
  }
  function reqsView() {
    return '<div class="ad-h"><div><h1>Requests</h1><p>Every Request Assistance submission from the site, with its status.</p></div></div><div class="tbl"><div class="tr th"><span>Reference</span><span>From</span><span>Type</span><span>Port</span><span>Status</span></div>' +
      REQS.map(function (r) { return '<div class="tr"><span><b>' + r[0] + '</b></span><span>' + r[1] + '</span><span>' + r[2] + '</span><span>' + r[3] + '</span><span><select><option' + (r[4] === 'New' ? ' selected' : '') + '>New</option><option' + (r[4] === 'In hand' ? ' selected' : '') + '>In hand</option><option' + (r[4] === 'Closed' ? ' selected' : '') + '>Closed</option></select></span></div>'; }).join('') + '</div><p class="hint">Draft: sample rows only.</p>';
  }
  function sendModal(p) {
    return '<div class="ov"><div class="md"><button class="x" data-act="close">×</button><h2>Email to subscribers</h2><p>Preview of the email your ' + subs().length + ' subscribers receive.</p>' +
      '<div class="em"><div class="em-h">' + MARK + '<b>MESCO</b><span>' + e(p.cat) + '</span></div>' + (p.cover ? '<img src="' + p.cover + '" alt="">' : '') + '<div class="em-b"><small>' + M.fmt(p.date) + '</small><h3>' + e(p.title || 'Untitled') + '</h3><p>' + e(p.summary) + '</p><span class="btn btn-primary">Read the full ' + e(p.cat.toLowerCase()) + '</span>' + (p.pdf ? '<span class="em-pdf">📎 ' + e(p.pdf) + '</span>' : '') + '</div><div class="em-f">Middle East Survey &amp; Control Office · Alexandria, Egypt<br>You receive this because you subscribed on mescoalex.com · <u>Unsubscribe</u></div></div>' +
      '<div class="acts"><button class="btn btn-ghost" data-act="test">Send test to me</button><button class="btn btn-primary" data-act="sendall">Send to ' + subs().length + ' subscribers</button></div></div></div>';
  }
  function render() {
    var v = { login: login, posts: posts, edit: editor, subs: subsView, team: teamView, reqs: reqsView }[S.view]();
    app.innerHTML = S.view === 'login' ? v : shell(v);
    if (S.view === 'edit') preview();
  }

  /* ---------- Helpers ---------- */
  function pull() { var p = S.post, g = function (i) { return document.getElementById(i); }; if (!g('f-title')) return; p.title = g('f-title').value; p.cat = g('f-cat').value; p.date = g('f-date').value || p.date; p.summary = g('f-sum').value; p.body = g('f-body').innerHTML; p.notify = g('f-notify').checked; }
  function shrink(file, max, cb) { var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, max / im.width), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', .8)); }; im.src = r.result; }; r.readAsDataURL(file); }
  function store(status) { pull(); var p = S.post; if (!p.title.trim()) { toast('Add a title first.'); return false; } p.status = status; if (!M.save(p)) { toast('This browser’s demo storage is full. Use a smaller image.'); return false; } return true; }

  /* ---------- Events ---------- */
  app.addEventListener('submit', function (ev) {
    ev.preventDefault(); var f = ev.target.dataset.form;
    if (f === 'login') { sessionStorage.setItem('mesco_admin', '1'); S.view = 'posts'; render(); }
    if (f === 'addsub') { var l = M.read('mesco_subs'); l.push(ev.target.querySelector('input').value); M.write('mesco_subs', l); render(); toast('Subscriber added.'); }
  });
  app.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-go],[data-act],[data-cmd]'); if (!b) return;
    if (b.dataset.cmd) { ev.preventDefault(); var val = b.dataset.val || null; if (b.dataset.cmd === 'createLink') { val = prompt('Link address', 'https://'); if (!val) return; } document.getElementById('f-body').focus(); document.execCommand(b.dataset.cmd, false, val); pull(); preview(); return; }
    if (b.dataset.go) { S.view = b.dataset.go; S.modal = null; render(); return; }
    var a = b.dataset.act, id = b.dataset.id, find = function () { return M.all().filter(function (p) { return p.id === id; })[0]; };
    if (a === 'forgot') { ev.preventDefault(); toast('A reset link is emailed to the staff address.'); }
    if (a === 'logout') { sessionStorage.removeItem('mesco_admin'); S.view = 'login'; render(); }
    if (a === 'new') { S.post = blank(); S.view = 'edit'; render(); }
    if (a === 'edit') { S.post = JSON.parse(JSON.stringify(find())); S.view = 'edit'; render(); }
    if (a === 'del') { if (confirm('Delete this post?')) { var p = find(); p.deleted = true; M.save(p); render(); toast('Post deleted.'); } }
    if (a === 'send') { S.post = find(); S.modal = sendModal(S.post); render(); }
    if (a === 'save') { if (store('draft')) { toast('Draft saved.'); } }
    if (a === 'publish') { if (store('published')) { S.view = 'posts'; S.modal = S.post.notify ? sendModal(S.post) : null; render(); toast('Published. It is now live on the news page.'); } }
    if (a === 'close') { S.modal = null; render(); }
    if (a === 'test') toast('Test email sent to staff@mescoalex.com. (Demo: nothing was sent.)');
    if (a === 'sendall') { S.modal = null; render(); toast('Sent to ' + subs().length + ' subscribers. (Demo: nothing was sent.)'); }
    if (a === 'unsub') { var u = M.read('mesco_unsubs'); u.push(id); M.write('mesco_unsubs', u); render(); }
    if (a === 'csv') { var link = document.createElement('a'); link.href = 'data:text/csv,' + encodeURIComponent('email\n' + subs().join('\n')); link.download = 'mesco-subscribers.csv'; link.click(); }
    if (a === 'img') { ev.preventDefault(); document.getElementById('f-img').click(); }
    if (a === 'soon') toast('Shown for layout. Switched on in the build phase.');
  });
  app.addEventListener('input', function (ev) { if (S.view !== 'edit') return; pull(); if (ev.target.id === 'f-sum') document.getElementById('cnt').textContent = ev.target.value.length; preview(); });
  app.addEventListener('change', function (ev) {
    var t = ev.target, f = t.files && t.files[0]; if (!f) return;
    if (t.id === 'f-cover') shrink(f, 1200, function (d) { pull(); S.post.cover = d; render(); });
    if (t.id === 'f-img') shrink(f, 1000, function (d) { document.getElementById('f-body').focus(); document.execCommand('insertImage', false, d); pull(); preview(); });
    if (t.id === 'f-pdf') { pull(); S.post.pdf = f.name; render(); }
  });
  render();
})();
