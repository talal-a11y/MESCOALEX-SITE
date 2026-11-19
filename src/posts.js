// Shared data store. Published posts are read live from the MESCO database (Supabase); staff edit them in /admin/.
window.MESCO = {
  cfg: window.MESCO_CFG || {},
  list: null,
  map(r) { return { id: r.id, cat: r.cat, date: r.date, status: r.status, title: r.title, summary: r.summary || '', body: r.body || '', cover: r.cover_url || '', pdfUrl: r.pdf_url || '', pdf: r.pdf_name || '' }; },
  load() {
    var M = this; if (M._p) return M._p;
    M._p = fetch(M.cfg.url + '/rest/v1/posts?select=*&status=eq.published&order=date.desc,created_at.desc', { headers: { apikey: M.cfg.key, Authorization: 'Bearer ' + M.cfg.key } })
      .then(function (r) { if (!r.ok) throw r; return r.json(); })
      .then(function (rows) { M.list = rows.map(M.map); return M.list; })
      .catch(function () { M.list = []; M.failed = true; return M.list; });
    return M._p;
  },
  all() { return this.list || []; },
  published() { return this.all().filter(function (p) { return p.status === 'published'; }); },
  fmt(d) { return new Date(d + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); },
  esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); },
};
