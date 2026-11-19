// MESCO client content — kept exactly as received (Nov 2026). Do not edit wording here without Talal's sign-off.
export const NAV = [['Home', '/'], ['Services', '/services/'], ['Guidelines & News', '/news/'], ['Our Team', '/team/'], ['About', '/about/'], ['Contact Us', '/contact/']];

export const SERVICES = [
  { slug: 'claims', icon: 'anchor', name: 'Claims', overview: '24/7 local representation and emergency response for P&I Clubs, shipowners and marine insurers. casualty attendance' },
  { slug: 'crew-medical-repatriation', icon: 'medical', name: 'Crew, Medical Ass. & Repatriation', overview: 'Comprehensive crew assistance, medical coordination, repatriation and welfare services.' },
  { slug: 'legal', icon: 'scales', name: 'Legal Consultancy & Services', overview: 'Claims handling, investigations, maritime legal support, litigation and dispute resolution.' },
  { slug: 'surveys', icon: 'clipboard', name: 'Surveys', overview: 'Independent marine and cargo surveys, inspections and factual reporting.' },
  { slug: 'marine-consultancy', icon: 'compass', name: 'Marine Consultancy', fixed: true, overview: 'Technical advisory, marine risk management, operational consultancy, and project support, backed by up-to-date responses and tailored recommendations across all Egyptian ports.' },
];

export const HOME = {
  eyebrow: 'Egypt’s Trusted Maritime Partner Since 1960',
  slogan: 'Your Maritime Interests. Our Expertise. One Trusted Partner.',
  intro: 'For more than 65 years, MESCO has supported P&I Clubs, shipowners, and marine insurers across Egypt, combining in-depth knowledge of the Egyptian shipping industry with independent expertise, responsive local representation, and integrated maritime services backed by 24/7 assistance.',
  numbers: [['65+ Years', 'Maritime Excellence'], ['24/7', 'Emergency Response'], ['All Egyptian Ports', 'Nationwide Coverage'], ['One Integrated Partner', 'Surveys • Claims • Legal • Consultancy • Crew Support']],
  trustedTitle: 'Trusted by Leading P&I Clubs Worldwide',
  trusted: 'MESCO is proud to support leading P&I Clubs, marine insurers, shipowners, brokers, and maritime organisations through long-standing professional relationships built on trust, responsiveness, technical expertise, and dependable local representation.',
  // Islamic P&I Club left out until MESCO confirms (their own note: not listed as correspondent).
  appointments: [['UK Club', 'Sole Correspondents in Egypt'], ['West of England'], ['Japan P&I Club'], ['NorthStandard'], ['Steamship Mutual'], ['The Shipowners’ Club'], ['The London P&I Club', 'London Steamship (A. Bilbrough & Co.)'], ['American Club'], ['British Marine'], ['Al-Bahriah Insurance & Reinsurance'], ['Hydor P&I'], ['Turk P&I Club'], ['China P&I Club'], ['TT Club'], ['ITIC', 'International Transport Intermediaries Club'], ['MSIG Specialty Marine NV'], ['Intercoastal Shipowners'], ['Osprey Underwriting Agencies', 'Osprey Underwriting Managers (Pty) Ltd.'], ['Hellenic War Risks', 'Hellenic Mutual War Risks Association'], ['Richards Hogg Lindley (RHL)', 'Advisor']],
  teamTitle: 'Experience Behind Every Response',
  team: ['Behind every assignment is a multidisciplinary team of maritime lawyers, surveyors, claims specialists, consultants, and crew assistance professionals committed to delivering timely, practical, and commercially focused solutions.', 'Meet the experienced professionals behind MESCO’s trusted reputation, delivering practical maritime solutions across every Egyptian port.'],
  helpTitle: 'Need Immediate Assistance?',
  helpSub: 'Available 24 Hours a Day. 365 Days a Year.',
  help: ['Whether you’re responding to a marine casualty, cargo incident, crew emergency, pollution event, or urgent legal matter, MESCO is ready to assist—24 hours a day, 365 days a year, across every Egyptian port.', 'Our experienced professionals coordinate rapid local attendance, surveys, legal support, claims handling, and emergency response from the first notification through to final resolution.'],
  seoTitle: 'Integrated Maritime Services in Egypt | P&I Correspondence • Marine Surveys • Claims & Legal Services • Marine Consultancy',
  seoDesc: 'MESCO is Egypt’s trusted maritime partner since 1960, providing integrated P&I correspondence, marine surveys, claims handling, maritime legal services, marine consultancy, crew, medical & repatriation services, and Suez Canal support across all Egyptian ports with 24/7 emergency response.',
};

const WHY_LEGAL = ['65+ years of maritime experience', 'Integrated technical and legal expertise', 'Rapid response across all Egyptian ports', 'Independent investigations and objective reporting', 'Trusted by leading P&I Clubs, insurers, and shipowners', '24/7 emergency response'];
const CTA_LEGAL = [['h2', 'Need Immediate Claims or Legal Assistance?'], ['p', 'Whether responding to a routine claim or a complex maritime casualty, MESCO provides the expertise, practical support, and rapid response needed to protect your interests and achieve the best possible outcome.'], ['cta', 'Contact Our Claims & Legal Team – Available 24/7']];

// Block types: lead, p, h2, ul (plain list), dl ("Title – description" list), ticks, cta, note (Bidaya draft note)
export const PAGES = {
  claims: {
    kicker: 'Claims & Legal Services', title: 'Claims', tagline: 'Protecting Your Interests from Incident to Resolution',
    blocks: [
      ['p', 'When maritime incidents occur, rapid response, thorough investigations, and practical legal support are essential to protecting your interests. Acting on behalf of P&I Clubs, shipowners, insurers, and marine underwriters, MESCO provides integrated claims handling, investigations, and maritime legal services across Egypt.'],
      ['p', 'From the initial notification through to final resolution, our multidisciplinary team coordinates maritime lawyers, surveyors, claims handlers, technical experts, and relevant authorities to deliver efficient, practical, and commercially focused solutions.'],
      ['h2', 'Why Choose MESCO?'], ['ticks', WHY_LEGAL], ...CTA_LEGAL,
    ],
  },
  legal: {
    kicker: 'Claims & Legal Services', title: 'Legal Consultancy & Services', tagline: 'Protecting Your Interests from Incident to Resolution',
    blocks: [
      ['h2', 'Maritime Legal Services'],
      ['p', 'With more than 65 years of maritime experience, MESCO provides practical legal support across a wide range of shipping, insurance, and admiralty matters.'],
      ['p', 'Our services include:'],
      ['ul', ['Maritime Claims Management', 'Legal Advice & Risk Assessment', 'Recovery Actions', 'Settlement Negotiations', 'Court Proceedings & Litigation', 'Regulatory & Compliance Advice', 'Admiralty Matters', 'Cargo Claims', 'Collision Claims', 'Pollution Claims']],
      ['h2', 'Why Choose MESCO?'], ['ticks', WHY_LEGAL], ...CTA_LEGAL,
    ],
  },
  surveys: {
    kicker: 'Services', title: 'Marine Surveys', tagline: 'Accurate Surveys. Reliable Evidence. Informed Decisions.',
    blocks: [
      ['p', 'Every marine survey conducted by MESCO has one clear objective: to establish the facts, preserve critical evidence, minimize risk, and provide reliable technical findings that support informed decisions and effective claims resolution.'],
      ['p', 'When maritime incidents occur, rapid attendance, thorough inspections, and accurate factual reporting are essential to protecting our clients’ interests. Taking the appropriate action at the earliest stage can significantly reduce exposure, strengthen the evidential position, and facilitate the successful resolution of claims and disputes.'],
      ['p', 'For more than 65 years, MESCO has provided independent marine surveying services throughout Egyptian ports. Combining extensive local knowledge with internationally recognised surveying standards, we appoint suitable surveyors and specialist surveying firms according to the nature, location, urgency, and technical requirements of each assignment. This tailored approach enables us to coordinate prompt attendance, objective assessments, practical recommendations, and comprehensive survey reports trusted by P&I Clubs, shipowners, marine insurers, charterers, cargo interests, and maritime lawyers worldwide.'],
      ['h2', 'Our Marine Survey Services'],
      ['dl', [
        'Cargo Condition Surveys – Independent assessment of cargo condition before, during, and after loading or discharge operations.',
        'Pre-Loading & Pre-Discharging Cargo Surveys – Verification of cargo condition and suitability before loading, and assessment of cargo condition immediately prior to discharge, particularly for sensitive cargoes such as steel products, project cargo, and bagged commodities.',
        'Draft Surveys – Accurate determination of bulk cargo quantities loaded or discharged.',
        'Container Surveys – Professional on-hire, off-hire, damage, repair, and in-service container inspections conducted by qualified surveyors.',
        'On-Hire & Off-Hire Bunker Surveys – Comprehensive condition assessments to protect owners’ and charterers’ interests.',
        'Hatch & Hold Cleanliness Surveys – Verification that cargo spaces are clean, dry, and suitable for loading.',
        'Underwater Hull Inspections – Efficient underwater examinations while minimizing unnecessary operational delays.',
        'Cargo Lashing & Securing Surveys – Inspection of stowage and securing arrangements to reduce cargo and transit risks.',
        'Cargo Hold Sealing & Unsealing Supervision – Independent witnessing and verification of cargo hold sealing and unsealing operations, including seal integrity checks, seal number verification, and comprehensive documentation to preserve the chain of custody, protect cargo interests, and support potential claims.',
        'Sampling & Laboratory Analysis – Professional cargo sampling, preparation, and independent analysis.',
        'Container Inspections by IICL-Qualified Surveyors – Professional inspections performed by qualified personnel where applicable.',
      ]],
      ['h2', 'Why Choose MESCO for Marine Surveys?'],
      ['ticks', ['65+ years of maritime surveying experience', 'Rapid attendance at all Egyptian ports', 'Independent and objective survey findings', 'Detailed survey reports trusted by P&I Clubs and marine insurers', 'Practical recommendations supporting informed decision-making', 'Experienced surveyors with extensive local maritime expertise', '24/7 response for casualties, claims, and urgent inspections']],
      ['p', 'From routine inspections to complex maritime incidents, MESCO delivers technical expertise, reliable evidence, and professional survey support required to protect your interests and assist in the effective resolution of claims.'],
      ['h2', 'Need a Marine Survey?'],
      ['p', 'Whether responding to an emergency, attending a routine inspection, or supporting a complex maritime case, MESCO provides the expertise, reliable evidence, and prompt attendance required to protect your interests and achieve effective case resolution.'],
      ['cta', 'Contact Our Survey Team – Available 24/7'],
    ],
  },
  'crew-medical-repatriation': {
    kicker: 'Services', title: 'Crew & Medical Assistance', tagline: 'Fast, Professional Support When It Matters Most',
    blocks: [
      ['p', 'Since handling a human being in distress is a considerable level of action, the crew welfare is our only priority at all events.'],
      ['p', 'MESCO provides prompt assistance in cases involving illness, injury, fatalities, medical emergencies, repatriation, and stowaway or irregular migration incidents, ensuring efficient coordination from the initial response through to final resolution.'],
      ['p', 'Supported by our in-house medical consultants and an established network of hospitals, specialist physicians, and healthcare providers across Egypt, MESCO coordinates timely medical treatment, effective case management, transparent reporting, and continuous communication on behalf of P&I Clubs, shipowners, and marine insurers.'],
      ['p', 'Our in-house medical consultants assist in reviewing medical treatment and associated expenses to ensure their reasonableness and accuracy, while working closely with treating physicians, hospitals, local agents, and P&I Clubs to facilitate efficient case management and the prompt resolution of crew claims, and above all mitigation of any potential risks.'],
      ['p', 'Where required, MESCO also coordinates medical escorts, repatriation arrangements, travel and accommodation, ensuring that every case is managed professionally, efficiently, and with the welfare of the crew as the highest priority.'],
      ['p', 'Our service is strictly maintained by factual reporting and clear expectations.'],
      ['h2', 'Our Services Include:'],
      ['ul', ['A team on call 24/7, well trained to answer the unsaid questions of the P & I CLUBS overseas.', 'A team ready to expand the least and most expected scenarios on each occurrence.', 'Physical and mental Illnesses & All types of injuries', 'Post and prior care including relevant logistics.', 'Medical Treatment Coordination.', 'Cost Review & Verification', 'Fatality & Repatriation Support', 'Medical Escorts by Qualified Doctors or Nurses', 'Stowaway & Irregular Migration Assistance', 'Travel & Accommodation Arrangements', 'Close follow up and regular reporting.', 'Free consultation.', 'Remote medical rescue.', 'Full network of medical care all over Egypt.', 'On board medical assistance.', 'On board medical services.', 'Compensation assessment for injuries and unfortunate events.']],
      ['cta', 'Request Assistance – Available 24/7'],
    ],
  },
  'marine-consultancy': {
    kicker: 'Services', title: 'Marine Consultancy', tagline: '',
    blocks: [
      ['p', 'Technical advisory, marine risk management, operational consultancy, and project support, backed by up-to-date responses and tailored recommendations across all Egyptian ports.'],
      ['note', 'Full page content for Marine Consultancy has not been received yet. This page shows the homepage overview until MESCO sends it.'],
      ['cta', 'Request Assistance – Available 24/7'],
    ],
  },
};

export const ABOUT = {
  title: 'About MESCO', tagline: 'Your Maritime Interests. Our Expertise. Your Trusted Partner Across Egypt.',
  paras: [
    'Established in 1960 by Mr. Hamdy El Sabbagh, former Undersecretary of State at the Ministry of Maritime Transport and the Ministry of Finance, Middle East Survey & Control Office (MESCO) has built over 65 years of maritime expertise and professional trust. Under the leadership of Mr. Ashraf El Sabbagh, we continue to serve P&I Clubs, shipowners, marine insurers, and the international shipping community.',
    'MESCO provides P&I correspondence services for most International Group P&I Clubs, as well as numerous other P&I Clubs worldwide, including both mutual and fixed-premium insurers.',
    'Combining independent marine surveying, claims handling, technical consultancy, medical assistance and in-house maritime legal expertise, MESCO helps clients assess liabilities, preserve evidence, manage claims exposure, and protect their commercial and legal interests.',
    'Our extensive network of experienced surveyors covers all Egyptian ports, ensuring prompt attendance, professional on-site representation, accurate reporting, and actionable recommendations for effective claims handling and informed decision-making.',
  ],
  mission: 'To deliver responsive, reliable maritime services that protect our clients’ interests through practical, professional solutions.',
  vision: 'To remain Egypt’s leading maritime service provider and the trusted partner of choice for P&I Clubs, shipowners, insurers, and the global maritime community.',
  closing: ['MESCO — Local Expertise. Your Interests Protected.', 'Complete Maritime Solutions Under One Roof'],
  why: ['Established Since 1960', 'Correspondents for Most International Group P&I Clubs and Numerous Other Clubs Worldwide', 'Presence Across All Egyptian Ports', '24/7 Emergency Response', 'Experienced Surveyors, Claims Handlers, Maritime Lawyers & Consultants', 'Independent Investigations & Objective Reporting', 'Local Knowledge with International Maritime Standards', 'One Integrated Partner from Incident to Resolution'],
};

// Team: only names already known are shown; everything else is a labelled placeholder.
export const TEAM = [
  ['Seif El Din El Sabbagh', 'General Manager'],
  ['Team member', 'Maritime lawyer'], ['Team member', 'Marine surveyor'], ['Team member', 'Claims handler'], ['Team member', 'Crew & medical assistance'],
];
