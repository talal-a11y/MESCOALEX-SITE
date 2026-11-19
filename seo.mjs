// Search & AI visibility pages (GEO/AEO). Not linked from the main menu; listed in the sitemap and llms.txt.
// Copy is drawn only from what MESCO supplied (homepage draft, About, Surveys, Claims & Legal, Crew & Medical documents).
export function seoPages({ esc, icon, pageHead, HOME, PAGES, ABOUT }) {
  const SITE = 'https://mescoalex.com';
  const ORG = 'MESCO (Middle East Survey & Control Office)';
  const PORTS = ['Alexandria', 'Port Said', 'Damietta', 'Suez'];
  const SURVEY_WHY = PAGES.surveys.blocks.find(b => b[0] === 'ticks')[1];
  const LEGAL_LIST = PAGES.legal.blocks.find(b => b[0] === 'ul')[1];
  const CREW_LIST = PAGES['crew-medical-repatriation'].blocks.find(b => b[0] === 'ul')[1];
  const SURVEYS = PAGES.surveys.blocks.find(b => b[0] === 'dl')[1].map(l => { const [n, ...d] = l.split(' – '); return [n, d.join(' – ')]; });
  const CLUBS = HOME.appointments.map(a => a[0]);
  const slug = s => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const SURVEY_INTRO = 'For more than 65 years, MESCO has provided independent marine surveying services throughout Egyptian ports. Combining extensive local knowledge with internationally recognised surveying standards, MESCO appoints suitable surveyors and specialist surveying firms according to the nature, location, urgency, and technical requirements of each assignment.';
  const H24 = 'MESCO’s emergency response runs 24 hours a day, 365 days a year, across every Egyptian port.';

  const pages = [];
  const add = (o) => pages.push(o);

  /* ---------- Who and where ---------- */
  add({ group: 'Who MESCO is', path: '/p-and-i-correspondents-egypt/', title: 'P&I correspondents in Egypt', kicker: 'P&I correspondence', terms: ['P&I correspondent Egypt', 'P&I correspondents Alexandria', 'P&I club correspondent Egypt'], schema: 'Organization, Service',
    body: [['lead', `${ORG} provides P&I correspondence services in Egypt for most International Group P&I Clubs, as well as numerous other P&I Clubs worldwide, including both mutual and fixed-premium insurers.`],
      ['p', ABOUT.paras[0]], ['p', ABOUT.paras[2]],
      ['h2', 'Principal appointments'], ['cols', CLUBS],
      ['h2', 'Coverage'], ['p', ABOUT.paras[3]]],
    faq: [['Which P&I Clubs does MESCO act for in Egypt?', `MESCO’s principal appointments include ${CLUBS.slice(0, -1).join(', ')}, with Richards Hogg Lindley (RHL) as advisor.`],
      ['Who is the UK Club’s correspondent in Egypt?', 'MESCO acts as sole correspondents in Egypt for the UK Club.'],
      ['When was MESCO established?', 'MESCO was established in 1960 by Mr. Hamdy El Sabbagh, former Undersecretary of State at the Ministry of Maritime Transport and the Ministry of Finance.']] });

  for (const port of PORTS) add({ group: 'Egyptian ports', path: `/egypt/${slug(port)}/`, title: `P&I correspondents and marine surveyors in ${port}`, kicker: `Port of ${port}`, terms: [`marine surveyor ${port}`, `P&I correspondent ${port}`, `marine claims ${port}`], schema: 'LocalBusiness, Service, FAQPage',
    body: [['lead', `${ORG} provides P&I correspondence, marine surveys, claims and legal services, marine consultancy, and crew, medical and repatriation assistance at the port of ${port}.`],
      ['p', 'MESCO’s extensive network of experienced surveyors covers all Egyptian ports, ensuring prompt attendance, professional on-site representation, accurate reporting, and actionable recommendations for effective claims handling and informed decision-making.'],
      ['h2', `Services available in ${port}`], ['links', [['P&I correspondence', '/p-and-i-correspondents-egypt/'], ['Marine surveys', '/surveys/'], ['Marine claims handling', '/claims/marine-claims-egypt/'], ['Maritime legal services', '/claims/maritime-lawyers-egypt/'], ['Crew repatriation', '/crew/crew-repatriation-egypt/'], ['Medical assistance for seafarers', '/crew/seafarer-medical-assistance-egypt/'], ['Marine consultancy', '/marine-consultancy-egypt/']]],
      ['h2', '24/7 attendance'], ['p', HOME.help[0]], ['p', HOME.help[1]]],
    faq: [[`Can MESCO attend a vessel in ${port} outside working hours?`, `Yes. ${H24}`],
      [`Which surveys can MESCO arrange in ${port}?`, `${SURVEYS.map(s => s[0]).join('; ')}.`],
      [`Who does MESCO represent in ${port}?`, 'P&I Clubs, shipowners, marine insurers, charterers, cargo interests, and the international shipping community.']] });

  add({ group: 'Egyptian ports', path: '/suez-canal/', title: 'Suez Canal support: transits, emergencies and casualties', kicker: 'Suez Canal', terms: ['Suez Canal casualty assistance', 'Suez Canal P&I correspondent', 'Suez Canal transit assistance'], schema: 'Service, FAQPage',
    body: [['lead', `${ORG} provides professional assistance during Suez Canal transits, emergencies and operational matters.`],
      ['p', HOME.help[0]], ['p', HOME.help[1]],
      ['h2', 'What MESCO coordinates'], ['cols', ['Rapid local attendance', 'Surveys', 'Legal support', 'Claims handling', 'Emergency response', 'Crew, medical and repatriation assistance']],
      ['p', 'Suez Canal updates are published with MESCO’s circulars and P&I reports.']],
    faq: [['Does MESCO assist vessels during a Suez Canal transit?', 'Yes. MESCO provides professional assistance during Suez Canal transits, emergencies and operational matters.'],
      ['Is help available at night and at weekends?', `Yes. ${H24}`]] });

  /* ---------- Surveys ---------- */
  add({ group: 'Marine surveys', path: '/surveys/', title: 'Marine surveys in Egypt', kicker: 'Marine surveys', terms: ['marine survey Egypt', 'cargo survey Egypt', 'marine surveyor Egypt'], schema: 'Service, ItemList',
    body: [['lead', PAGES.surveys.blocks[0][1]], ['p', SURVEY_INTRO],
      ['h2', 'Survey types'], ['links', SURVEYS.filter(s => !s[0].startsWith('Container Inspections')).map(s => [s[0], `/surveys/${slug(s[0])}-egypt/`])],
      ['h2', 'Why choose MESCO for marine surveys'], ['ticks', SURVEY_WHY]] });
  for (const [name, desc] of SURVEYS) {
    if (name.startsWith('Container Inspections')) continue;
    const extra = name === 'Container Surveys' ? [['p', 'Container inspections are performed by IICL-qualified surveyors where applicable.']] : [];
    add({ group: 'Marine surveys', path: `/surveys/${slug(name)}-egypt/`, title: `${name} in Egypt`, kicker: 'Marine surveys', terms: [`${name.toLowerCase()} Egypt`, `${name.toLowerCase().replace(/s$/, '')} Alexandria`, `${name.toLowerCase().replace(/s$/, '')} Port Said`], schema: 'Service, FAQPage',
      body: [['lead', `${desc}`], ...extra, ['p', `MESCO arranges ${name.toLowerCase()} at all Egyptian ports. ${SURVEY_INTRO}`],
        ['h2', 'Why choose MESCO'], ['ticks', SURVEY_WHY.slice(0, 4)]],
      faq: [['Are MESCO’s survey findings independent?', 'Yes. MESCO provides independent and objective survey findings, with detailed survey reports trusted by P&I Clubs and marine insurers.'],
        ['How quickly can a surveyor attend?', 'MESCO offers rapid attendance at all Egyptian ports, with a 24/7 response for casualties, claims, and urgent inspections.']] });
  }

  /* ---------- Claims & legal ---------- */
  const CL = PAGES['claims-legal'].blocks;
  add({ group: 'Claims & legal', path: '/claims/marine-claims-egypt/', title: 'Marine claims handling in Egypt', kicker: 'Claims', terms: ['marine claims Egypt', 'P&I claims handling Egypt', 'casualty response Egypt'], schema: 'Service, FAQPage',
    body: [['lead', CL[0][1]], ['p', CL[1][1]], ['h2', 'Why choose MESCO'], ['ticks', PAGES.legal.blocks.find(b => b[0] === 'ticks')[1]]],
    faq: [['Who does MESCO handle claims for?', 'P&I Clubs, shipowners, insurers, and marine underwriters.'], ['Does MESCO respond to casualties at night?', `Yes. ${H24}`]] });
  add({ group: 'Claims & legal', path: '/claims/maritime-lawyers-egypt/', title: 'Maritime legal services in Egypt', kicker: 'Legal', terms: ['maritime lawyer Egypt', 'admiralty lawyer Egypt', 'shipping lawyer Alexandria'], schema: 'Service, FAQPage',
    body: [['lead', 'With more than 65 years of maritime experience, MESCO provides practical legal support across a wide range of shipping, insurance, and admiralty matters.'], ['h2', 'Legal services'], ['cols', LEGAL_LIST]],
    faq: [['Does MESCO have in-house maritime lawyers?', 'Yes. MESCO combines independent marine surveying, claims handling, technical consultancy, medical assistance and in-house maritime legal expertise.']] });
  add({ group: 'Claims & legal', path: '/claims/cargo-collision-pollution-claims-egypt/', title: 'Cargo, collision and pollution claims in Egypt', kicker: 'Claims', terms: ['cargo claims Egypt', 'collision claims Egypt', 'pollution claims Egypt'], schema: 'Service',
    body: [['lead', 'MESCO handles cargo claims, collision claims and pollution claims in Egypt on behalf of P&I Clubs, shipowners, insurers, and marine underwriters.'], ['p', CL[1][1]], ['p', 'MESCO’s services include recovery actions, settlement negotiations, and court proceedings and litigation.']] });

  /* ---------- Crew & medical ---------- */
  const CM = PAGES['crew-medical-repatriation'].blocks;
  add({ group: 'Crew & medical', path: '/crew/crew-repatriation-egypt/', title: 'Crew repatriation from Egypt', kicker: 'Crew assistance', terms: ['crew repatriation Egypt', 'seafarer repatriation Egypt', 'medical escort repatriation Egypt'], schema: 'Service, FAQPage',
    body: [['lead', CM[4][1]], ['p', CM[1][1]], ['h2', 'Includes'], ['cols', ['Fatality & Repatriation Support', 'Medical Escorts by Qualified Doctors or Nurses', 'Travel & Accommodation Arrangements', 'Close follow up and regular reporting']]],
    faq: [['Can MESCO arrange a medical escort?', 'Yes. MESCO coordinates medical escorts by qualified doctors or nurses.']] });
  add({ group: 'Crew & medical', path: '/crew/seafarer-medical-assistance-egypt/', title: 'Medical assistance for seafarers in Egypt', kicker: 'Medical assistance', terms: ['seafarer medical assistance Egypt', 'crew hospital Egypt', 'P&I crew medical case Egypt'], schema: 'Service, FAQPage',
    body: [['lead', CM[2][1]], ['p', CM[3][1]], ['h2', 'Services include'], ['cols', CREW_LIST.slice(2)]],
    faq: [['Does MESCO review medical costs?', 'Yes. MESCO’s in-house medical consultants review medical treatment and associated expenses to ensure their reasonableness and accuracy.']] });
  add({ group: 'Crew & medical', path: '/crew/stowaway-cases-egypt/', title: 'Stowaway and irregular migration cases in Egypt', kicker: 'Crew assistance', terms: ['stowaway Egypt P&I', 'stowaway assistance Egypt'], schema: 'Service',
    body: [['lead', 'MESCO provides prompt assistance in cases involving stowaway or irregular migration incidents, ensuring efficient coordination from the initial response through to final resolution.'], ['p', `${H24}`]] });

  add({ group: 'Marine consultancy', path: '/marine-consultancy-egypt/', title: 'Marine consultancy in Egypt', kicker: 'Marine consultancy', terms: ['marine consultancy Egypt', 'marine risk management Egypt'], schema: 'Service',
    body: [['lead', 'Technical advisory, marine risk management, operational consultancy, and project support, backed by up-to-date responses and tailored recommendations across all Egyptian ports.']] });

  /* ---------- Answers ---------- */
  const QA = [
    ['What is MESCO?', `${ORG} is an Egyptian maritime services company established in 1960. It provides P&I correspondence, marine surveys, claims and legal services, marine consultancy, and crew, medical and repatriation assistance across all Egyptian ports.`],
    ['Who founded MESCO?', 'Mr. Hamdy El Sabbagh, former Undersecretary of State at the Ministry of Maritime Transport and the Ministry of Finance, founded MESCO in 1960. MESCO is led by Mr. Ashraf El Sabbagh.'],
    ['Which ports does MESCO cover?', 'All Egyptian ports, including the Suez Canal.'],
    ['Is MESCO available 24/7?', 'Yes. MESCO is available 24 hours a day, 365 days a year.'],
    ['Who are MESCO’s clients?', 'P&I Clubs, shipowners, marine insurers, brokers, and the international shipping community.'],
    ['Which P&I Clubs appoint MESCO?', `Principal appointments include ${CLUBS.slice(0, 8).join(', ')} and others.`],
    ['What marine surveys does MESCO carry out?', `${SURVEYS.map(s => s[0]).join('; ')}.`],
    ['What does MESCO do after a marine casualty?', HOME.help[1]],
    ['Does MESCO provide maritime legal services?', `Yes: ${LEGAL_LIST.join(', ').toLowerCase()}.`],
    ['Does MESCO handle crew medical and repatriation cases?', 'Yes. MESCO coordinates medical treatment, cost review, fatality and repatriation support, medical escorts, and stowaway and irregular migration cases.'],
    ['Are MESCO’s investigations independent?', 'Yes. MESCO provides independent investigations and objective reporting.'],
  ];
  add({ group: 'Answers for search and AI', path: '/questions/', title: 'Questions about MESCO', kicker: 'Answers', terms: ['who is MESCO Alexandria', 'P&I correspondent Egypt 24/7', 'marine surveyor Egypt'], schema: 'FAQPage', body: [['lead', 'Short, direct answers that search engines and AI assistants can quote.']], faq: QA });

  const sitemap = pages.map(p => `  <url><loc>${SITE}${p.path}</loc></url>`).join('\n');
  const llms = `# MESCO — Middle East Survey & Control Office\n\n> Egyptian maritime services company, established 1960 in Alexandria. P&I correspondents, marine surveyors, claims handlers, maritime lawyers and consultants. All Egyptian ports, 24/7.\n\n## Services\n${pages.filter(p => p.group !== 'Answers for search and AI').map(p => `- [${p.title}](${SITE}${p.path})`).join('\n')}\n\n## Answers\n- [Questions about MESCO](${SITE}/questions/)\n`;
  const orgLd = { '@context': 'https://schema.org', '@type': 'Organization', name: 'MESCO – Middle East Survey & Control Office', url: SITE, foundingDate: '1960', founder: { '@type': 'Person', name: 'Hamdy El Sabbagh' }, areaServed: { '@type': 'Country', name: 'Egypt' }, knowsAbout: ['P&I correspondence', 'Marine surveys', 'Marine claims', 'Maritime law', 'Crew repatriation', 'Suez Canal'], description: HOME.seoDesc };
  add({ group: 'Files for search engines and AI', path: '/for-search-engines/', title: 'Files that search engines and AI assistants read', kicker: 'Behind the site', terms: [], schema: '—',
    body: [['lead', 'These files are not pages people visit. They tell Google, Bing and AI assistants what MESCO does, which pages exist and how to describe the company accurately.'],
      ['h2', 'llms.txt'], ['p', 'A plain summary of MESCO for AI assistants such as ChatGPT, Claude, Gemini and Perplexity.'], ['code', llms],
      ['h2', 'Structured data (Organization)'], ['p', 'Placed in every page so search engines identify MESCO, its founding year and the services it offers.'], ['code', JSON.stringify(orgLd, null, 2)],
      ['h2', 'sitemap.xml'], ['p', 'Lists every page, including the ones not in the main menu, so they are found and indexed.'], ['code', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}/</loc></url>\n${sitemap}\n</urlset>`],
      ['h2', 'robots.txt'], ['code', `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml`]] });

  /* ---------- Render ---------- */
  const ld = p => JSON.stringify({ '@context': 'https://schema.org', '@type': p.faq ? 'FAQPage' : 'Service', name: p.title, url: SITE + p.path, provider: { '@type': 'Organization', name: 'MESCO – Middle East Survey & Control Office' }, areaServed: 'Egypt', ...(p.faq ? { mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) } : {}) }, null, 2);
  const blk = ([t, v]) => ({
    lead: () => `<p>${esc(v)}</p>`, p: () => `<p>${esc(v)}</p>`, h2: () => `<h2>${esc(v)}</h2>`,
    cols: () => `<ul class="plain">${v.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`,
    ticks: () => `<ul class="ticks">${v.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`,
    links: () => `<ul class="plain">${v.map(([n, h]) => `<li><a href="${h}">${esc(n)}</a></li>`).join('')}</ul>`,
    code: () => `<pre class="code"><code>${esc(v)}</code></pre>`,
  }[t]());
  const out = {};
  for (const p of pages) {
    const faq = p.faq ? `<h2>Questions</h2><div class="faq">${p.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>` : '';
    const behind = p.terms.length ? `<aside class="side seo-side"><h3>Behind this page</h3><dl><dt>Address</dt><dd>mescoalex.com${p.path}</dd><dt>Written to answer</dt><dd>${p.terms.map(t => `<span class="q">“${esc(t)}”</span>`).join('')}</dd><dt>Structured data</dt><dd>${esc(p.schema)}</dd><dt>In main menu</dt><dd>No — found through Google and AI answers</dd></dl><details><summary>View structured data</summary><pre class="code"><code>${esc(ld(p))}</code></pre></details><span class="btn btn-sos">Request Assistance – Available 24/7</span></aside>` : '';
    out[p.path] = { t: `${p.title} | MESCO`, c: 'seo', h: pageHead(p.kicker, p.title, '') + `<section class="sec"><div class="wrap ${behind ? 'two' : ''}"><article class="prose">${p.body.map(blk).join('')}${faq}</article>${behind}</div></section>` };
  }
  const groups = [...new Set(pages.map(p => p.group))];
  out['/'] = { t: 'MESCO – search & AI visibility pages', c: 'seo', h: pageHead('Behind the site', 'Pages built for Google and AI answers', '') +
    `<section class="sec"><div class="wrap"><p class="lead narrow">${pages.length} pages and files that sit behind the main website. They are not in the menu, so the site stays simple for visitors, but each one is written to answer a specific search on Google or a question put to an AI assistant, using only information MESCO has supplied.</p>
${groups.map(g => `<h2 class="seo-g rv">${esc(g)}</h2><div class="seo-list">${pages.filter(p => p.group === g).map(p => `<a class="seo-row rv" href="${p.path}"><span><strong>${esc(p.title)}</strong><em>mescoalex.com${p.path}</em></span><span class="tq">${p.terms.slice(0, 2).map(t => `“${esc(t)}”`).join(' · ') || 'Read by search engines and AI assistants'}</span>${icon('arrow', 'go')}</a>`).join('')}</div>`).join('')}</div></section>` };
  return out;
}
