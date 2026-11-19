(function () {
  var M = window.MESCO, PG = window.MESCO_PAGES, raf, io;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var red = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function parse(h) { var m = /^([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/.exec(h), p = m[1] || '/'; if (p.slice(-1) !== '/') p += '/'; return { path: p, q: m[2] || '', hash: m[3] || '' }; }
  var route = parse(location.pathname + location.search + location.hash);
  function param(k) { return new URLSearchParams(route.q).get(k); }

  var burger = $('.burger'), nav = $('#nav');
  if (burger) burger.onclick = function () { var o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); };

  function row(p) {
    var d = new Date(p.date + 'T00:00');
    return '<a class="lg-row" href="/news/post/?id=' + encodeURIComponent(p.id) + '"><span class="d"><b class="num">' + ('0' + d.getDate()).slice(-2) + '</b>' + d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) + '</span><span><span class="chip">' + M.esc(p.cat) + '</span><strong>' + M.esc(p.title) + '</strong><em>' + M.esc(p.summary) + '</em></span><span class="go" aria-hidden="true">→</span></a>';
  }
  var PH = '<span class="ph-l"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.500"><rect x="3" y="5" width="18" height="14" rx="1.500"/><circle cx="9" cy="10" r="1.800"/><path d="M21 16l-5-5-8 8"/></svg>Image placeholder</span>';
  function card(p) {
    return '<a class="nc" href="/news/post/?id=' + encodeURIComponent(p.id) + '"><span class="nc-img' + (p.cover ? '" style="background-image:url(' + p.cover + ')"' : ' ph">' + PH) + (p.cover ? '>' : '') + '<span class="chip">' + M.esc(p.cat) + '</span></span><span class="nc-b"><span class="d">' + M.fmt(p.date) + '</span><strong>' + M.esc(p.title) + '</strong><em>' + M.esc(p.summary) + '</em></span></a>';
  }
  function split(el) {
    if (el.dataset.sp) return; el.dataset.sp = 1; var i = 0;
    (function walk(n) {
      [].slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(' ')); return; }
            var o = document.createElement('span'), x = document.createElement('span');
            o.className = 'w'; x.textContent = w; x.style.setProperty('--i', i++); o.appendChild(x); f.appendChild(o);
          });
          n.replaceChild(f, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(el);
  }
  function count(el) {
    var to = +el.dataset.count, t0 = performance.now();
    (function f(now) { var k = Math.min(1, (now - t0) / 1600); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  function draw(cat) {
    if (!M.list) { $$('[data-posts]').forEach(function (el) { el.innerHTML = '<p class="pending" style="padding:20px 0">Loading…</p>'; }); M.load().then(function () { draw(cat); }); return; }
    $$('[data-posts]').forEach(function (el) {
      var only = el.dataset.cat || cat, not = el.dataset.not;
      var l = M.published().filter(function (p) { return (!only || p.cat === only) && (!not || p.cat !== not); });
      if (el.dataset.posts !== 'all') l = l.slice(0, +el.dataset.posts);
      el.innerHTML = l.length ? l.map(el.classList.contains('tk') ? card : row).join('') : '<p class="pending" style="padding:20px 0">' + (M.failed ? 'Posts could not be loaded. Please refresh the page.' : 'Nothing published here yet.') + '</p>';
    });
  }

  function boot() {
    cancelAnimationFrame(raf); if (io) io.disconnect();
    if (nav) nav.classList.remove('open');
    $$('.nav a').forEach(function (a) { var h = a.getAttribute('href'); if (h === '/' ? route.path === '/' : route.path.indexOf(h) === 0) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });

    var nums = $('.nums'); if (nums) nums.classList.add('rv', 'rv-wipe');
    $$('.split').forEach(split);
    var rv = $$('.rv,.split');
    if (red || !('IntersectionObserver' in window)) rv.forEach(function (e) { e.classList.add('in'); });
    else { io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); var c = e.target.querySelector('[data-count]'); if (c && !red) count(c); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }); rv.forEach(function (e) { io.observe(e); }); }

    var art = $('.hero-art');
    var vids = $$('video[data-v]');
    if (vids.length) {
      window.__blobs = window.__blobs || {};
      vids.forEach(function (v) {
        var n = v.dataset.v;
        var go = function () { v.muted = true; v.setAttribute('muted', ''); v.play().catch(function () {}); };
        if (window.MESCO_VIDEOS && window.MESCO_VIDEOS[n]) {
          if (window.__blobs[n]) { v.src = window.__blobs[n]; go(); }
          else fetch(window.MESCO_VIDEOS[n]).then(function (r) { return r.blob(); }).then(function (b) { window.__blobs[n] = URL.createObjectURL(b); v.src = window.__blobs[n]; go(); });
        } else go();
      });
      var kick = function () { vids.forEach(function (v) { v.play().catch(function () {}); }); };
      addEventListener('touchstart', kick, { once: true, passive: true }); addEventListener('scroll', kick, { once: true, passive: true });
    }
    // typing headline
    var ty = $('.type');
    if (ty && !ty.classList.contains('typed')) {
      var lines = ty.innerHTML.split(/<br\s*\/?>/i).map(function (l) { return l.replace(/<[^>]+>/g, ''); });
      ty.innerHTML = ''; ty.classList.add('typed');
      if (red) ty.innerHTML = lines.join('<br>');
      else {
        var cur = document.createElement('span'); cur.className = 'cur'; ty.appendChild(cur);
        var li = 0, ci = 0, node = document.createTextNode(''); ty.insertBefore(node, cur);
        var step = function () {
          if (li >= lines.length) { setTimeout(function () { cur.remove(); }, 2200); return; }
          if (ci < lines[li].length) { node.textContent += lines[li][ci++]; var ch = node.textContent.slice(-1); setTimeout(step, /[.,]/.test(ch) ? 260 : 38 + Math.random() * 40); }
          else { li++; ci = 0; if (li < lines.length) { ty.insertBefore(document.createElement('br'), cur); node = document.createTextNode(''); ty.insertBefore(node, cur); } setTimeout(step, 320); }
        };
        setTimeout(step, 700);
      }
    }
    // one logo: starts large in the hero and flies up into the header as you scroll
    var old = document.getElementById('flylogo'); if (old) old.remove();
    var slot = $('.hero-logo'), hdImg = $('.hd .logo img');
    if (slot && hdImg && !red) {
      var fly = hdImg.cloneNode(); fly.id = 'flylogo'; fly.removeAttribute('class'); document.body.appendChild(fly);
      var place = function () {
        var s = slot.getBoundingClientRect(), e = hdImg.getBoundingClientRect();
        var sTop = s.top + scrollY, dist = Math.max(1, sTop - e.top);
        var p = Math.min(1, Math.max(0, scrollY / dist)), k = p * p * (3 - 2 * p);
        var x = s.left + (e.left - s.left) * k, y = (s.top) * (1 - k) + e.top * k, w = s.width + (e.width - s.width) * k;
        if (p >= 1) { x = e.left; y = e.top; w = e.width; }
        fly.style.width = w + 'px'; fly.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; fly.style.visibility = p >= 1 ? 'hidden' : 'visible'; hdImg.style.visibility = p >= 1 ? 'visible' : 'hidden';
      };
      place(); addEventListener('scroll', place, { passive: true }); addEventListener('resize', place);
      fly.onclick = function () { location.href = hdImg.closest('a').getAttribute('href'); };
    } else if (hdImg) hdImg.style.visibility = 'visible';
    if (art && red && art.pauseAnimations) { art.setCurrentTime(40); art.pauseAnimations(); }

    var rot = $('#rot');
    if (rot) {
      var labs = $$('.blab', rot), cards = $$('.rot-stage .svc', rot), tabs = $$('[role=tab]', rot), blips = $$('.blip', rot), sweep = $('.sweep', rot), ang = 0, last = 0, paused = false;
      var show = function (n) {
        cards.forEach(function (c, k) { c.classList.toggle('on', k === n); c.classList.remove('flash'); });
        tabs.forEach(function (b, k) { b.setAttribute('aria-selected', k === n); });
        blips.forEach(function (b, k) { b.classList.toggle('on', k === n); });
        labs.forEach(function (b, k) { b.classList.toggle('on', k === n); });
        void cards[n].offsetWidth; cards[n].classList.add('flash');
      };
      var pick = function (n) { ang = +blips[n].dataset.b; show(n); };
      tabs.concat(labs).forEach(function (b) { b.onclick = function () { pick(+b.dataset.i); }; });
      blips.forEach(function (b) { b.onclick = function () { pick(+b.dataset.i); }; b.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(+b.dataset.i); } }; });
      var box = $('.exp-rot', rot); box.onmouseenter = function () { paused = true; }; box.onmouseleave = function () { paused = false; };
      blips[0].classList.add('on'); labs[0].classList.add('on');
      var tick = function (now) {
        var dt = Math.min(now - (last || now), 100); last = now;
        if (!paused) {
          var prev = ang; ang = (ang + dt * 360 / 13500) % 360;
          sweep.setAttribute('transform', 'rotate(' + ang.toFixed(1) + ' 200 200)');
          blips.forEach(function (b, k) { var a = +b.dataset.b; if (prev < ang ? (prev < a && ang >= a) : (a > prev || a <= ang)) show(k); });
        }
        raf = requestAnimationFrame(tick);
      };
      if (!red) raf = requestAnimationFrame(tick);
    }

    var c0 = param('c') || '';
    draw(c0);
    $$('#filters button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.c === c0);
      b.onclick = function () { $$('#filters button').forEach(function (x) { x.classList.toggle('on', x === b); }); draw(b.dataset.c); };
    });

    $$('.tk-b').forEach(function (b) { b.onclick = function () { var t = b.closest('.wrap').nextElementSibling.querySelector('.tk'); t.scrollBy({ left: +b.dataset.d * 414, behavior: 'smooth' }); }; });
    $$('.tk').forEach(function (t) {
      var down = false, x0, s0, moved;
      t.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = t.scrollLeft; t.style.scrollSnapType = 'none'; });
      addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true; t.scrollLeft = s0 - dx; });
      addEventListener('pointerup', function () { if (!down) return; down = false; t.style.scrollSnapType = ''; });
      t.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
      t.addEventListener('dragstart', function (e) { e.preventDefault(); });
    });
    $$('.tp').forEach(function (t) { t.onclick = function (e) { if (e.target.closest('.btn')) return; $$('.tp').forEach(function (x) { x.classList.toggle('open', x === t); }); }; });
    $$('.tp .reveal').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); b.textContent = 'To be confirmed'; }; });
    $$('.c5').forEach(function (c) { c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%'); }); });
    var post = $('#post');
    if (post) {
      post.innerHTML = '<section class="sec"><div class="wrap"><p class="pending">Loading…</p></div></section>';
      M.load().then(function () {
        var id = param('id'), p = M.all().filter(function (x) { return x.id === id; })[0];
        post.innerHTML = p ? '<section class="ph"><div class="wrap"><p class="kicker">' + M.esc(p.cat) + ' · ' + M.fmt(p.date) + '</p><h1>' + M.esc(p.title) + '</h1></div></section><section class="sec"><div class="wrap article prose"><p>' + M.esc(p.summary) + '</p>' + (p.cover ? '<div class="cover" style="background-image:url(' + p.cover + ')"></div>' : '') + p.body + (p.pdfUrl ? '<p><a class="btn btn-primary" href="' + M.esc(p.pdfUrl) + '" target="_blank" rel="noopener">Download PDF · ' + M.esc(p.pdf || 'document.pdf') + '</a></p>' : '') + '<p><a class="more" href="/news/">← All guidelines and news</a></p></div></section>'
          : '<section class="sec"><div class="wrap"><h1>Post not found</h1><p><a href="/news/">Back to all posts</a></p></div></section>';
        if (p) document.title = p.title + ' | MESCO';
      });
    }

    function post2(url, body) {
      return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || 'Something went wrong. Please try again or call us.'); return j; }); });
    }
    function busy(f, on, label) { var b = $('button[type=submit],button:not([type])', f); if (!b) return; if (on) { b.dataset.l = b.textContent; b.textContent = label; b.disabled = true; } else { b.textContent = b.dataset.l || b.textContent; b.disabled = false; } }
    var sub = $('#sub');
    if (sub) sub.onsubmit = function (e) {
      e.preventDefault(); var em = $('input[type=email]', sub).value.trim(), ok = $('.form-ok', sub); busy(sub, true, 'Subscribing…');
      post2('/api/subscribe', { email: em, website: (sub.querySelector('[name=website]') || {}).value })
        .then(function () { ok.hidden = false; ok.classList.remove('err'); ok.textContent = 'Subscribed: ' + em + '. A confirmation email is on its way.'; sub.reset(); })
        .catch(function (x) { ok.hidden = false; ok.classList.add('err'); ok.textContent = x.message; })
        .then(function () { busy(sub, false); });
    };
    var req = $('#req');
    if (req) req.onsubmit = function (e) {
      e.preventDefault(); if (!req.checkValidity()) { req.reportValidity(); return; }
      var fd = new FormData(req), ok = $('.form-ok', req), cb = req.querySelector('[name=cb]:checked');
      busy(req, true, 'Sending…');
      post2('/api/request', { name: fd.get('name'), company: fd.get('company'), email: fd.get('email'), phone: fd.get('phone'), vessel: fd.get('vessel'), port: fd.get('port'), type: fd.get('type'), description: fd.get('desc'), callback: cb ? cb.value : '', website: fd.get('website') })
        .then(function (j) { ok.hidden = false; ok.classList.remove('err'); ok.textContent = 'Request received. Reference ' + j.ref + '. ' + (j.emailed ? 'A confirmation email is on its way and ' : '') + 'the 24/7 team has been notified.'; req.reset(); })
        .catch(function (x) { ok.hidden = false; ok.classList.add('err'); ok.textContent = x.message; })
        .then(function () { busy(req, false); ok.scrollIntoView({ block: 'center', behavior: 'smooth' }); });
    };
    var dlg = $('#tmd');
    if (dlg) {
      $$('.tm').forEach(function (b) { b.onclick = function () { $('h2', dlg).textContent = b.dataset.n; $('.role', dlg).textContent = b.dataset.r; dlg.showModal(); }; });
      $('.x', dlg).onclick = function () { dlg.close(); };
      $('.reveal', dlg).onclick = function () { this.textContent = 'To be confirmed'; };
    }
    if ($('#app') && window.MESCO_ADMIN) window.MESCO_ADMIN();
  }

  var art0;
  addEventListener('scroll', function () {
    var a = $('.hero-art'), t = $('.hero-txt'); if (!a || red) return;
    var y = scrollY; if (y > 1000) return;
    a.style.transform = 'scale(' + (1 + y * .00025).toFixed(4) + ')';
    t.style.transform = 'translateY(' + (y * .06).toFixed(1) + 'px)';
  }, { passive: true });
  if (PG) {
    var render = function () {
      route = parse(location.hash.slice(1) || '/');
      var pg = PG[route.path] || PG['/'];
      document.title = pg.t; document.body.className = pg.c; var mn = $('#main'); mn.style.animation = 'none'; mn.innerHTML = pg.h; void mn.offsetWidth; mn.style.animation = '';
      boot();
      var el = route.hash && document.getElementById(route.hash);
      if (el) el.scrollIntoView(); else scrollTo(0, 0);
    };
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]'); if (!a) return;
      var h = a.getAttribute('href'); if (h.charAt(0) !== '/') return;
      e.preventDefault(); if (('#' + h) === location.hash) return;
      document.body.classList.add('pt-out'); setTimeout(function () { location.hash = '#' + h; }, 330);
    });
    addEventListener('hashchange', render);
    render();
  } else {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]'); if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey) return;
      var h = a.getAttribute('href'); if (!h || h.charAt(0) !== '/' || h.indexOf('#') === 0) return;
      e.preventDefault(); document.body.classList.add('pt-out'); setTimeout(function () { location.href = h; }, 330);
    });
    addEventListener('pageshow', function () { document.body.classList.remove('pt-out'); });
    boot();
  }
})();
