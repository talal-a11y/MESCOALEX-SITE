// Shared demo data store. Draft only: posts and subscribers live in this browser (localStorage). The real build stores them in a database.
window.MESCO = {
  seed: [
    { id: 'sample-circular', cat: 'Circular', date: '2026-11-10', status: 'published', pdf: 'sample-circular.pdf', title: 'Sample circular: how a circular appears on this page', summary: 'A sample entry showing the layout. The list shows a title, date and two-line summary. The full text and the PDF sit on the circular’s own page.', body: '<p>This is a sample post. MESCO’s own circulars replace it once examples are received.</p><h2>How circulars are published</h2><p>Staff sign in to the admin page, fill in the template (title, date, summary, text, cover image, PDF) and press Publish. The circular appears here straight away and can be emailed to subscribers in the same step.</p><p>The full text is placed on the page as well as in the PDF, so that search engines and AI assistants can read it.</p>' },
    { id: 'sample-guideline', cat: 'Loss prevention', date: '2026-11-03', status: 'published', title: 'Sample loss prevention guideline: layout example', summary: 'A sample entry showing how a loss prevention guideline is listed and read. Replace with MESCO’s guidance.', body: '<p>This is a sample post. Loss prevention guidelines use the same template as circulars and can carry images, headings and a PDF download.</p>' },
    { id: 'sample-news', cat: 'News', date: '2026-10-27', status: 'published', title: 'Sample news update: layout example', summary: 'A sample entry showing how a short news update appears in the list and on the homepage.', body: '<p>This is a sample post. News updates published from the admin page appear on the homepage and in this list, newest first.</p>' },
  ],
  read(k) { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) { return []; } },
  write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  all() {
    const mine = this.read('mesco_posts'), ids = new Set(mine.map(p => p.id));
    return mine.concat(this.seed.filter(p => !ids.has(p.id))).filter(p => !p.deleted).sort((a, b) => b.date.localeCompare(a.date));
  },
  published() { return this.all().filter(p => p.status === 'published'); },
  save(p) { const l = this.read('mesco_posts').filter(x => x.id !== p.id); l.push(p); return this.write('mesco_posts', l); },
  fmt(d) { return new Date(d + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); },
  esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); },
};

window.MESCO.seed.push(
 { id: 'sample-lp2', cat: 'Loss prevention', date: '2026-10-21', status: 'published', title: 'Sample guideline: cargo securing before departure', summary: 'Sample entry. Replace with MESCO\u2019s guidance.', body: '<p>This is a sample post.</p>' },
 { id: 'sample-lp3', cat: 'Loss prevention', date: '2026-10-09', status: 'published', title: 'Sample guideline: documentation for crew medical cases', summary: 'Sample entry. Replace with MESCO\u2019s guidance.', body: '<p>This is a sample post.</p>' },
 { id: 'sample-lp4', cat: 'Loss prevention', date: '2026-09-24', status: 'published', title: 'Sample guideline: preserving evidence after a cargo incident', summary: 'Sample entry. Replace with MESCO\u2019s guidance.', body: '<p>This is a sample post.</p>' },
 { id: 'sample-c2', cat: 'Circular', date: '2026-10-15', status: 'published', title: 'Sample circular: port procedures update', summary: 'Sample entry. Replace with MESCO\u2019s circular.', body: '<p>This is a sample post.</p>' });
