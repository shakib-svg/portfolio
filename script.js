/* ═══════════════════════════════════════════════════════════
   SHAKIB YOUSSEF — PORTFOLIO ENGINE
   i18n (FR/EN/AR + RTL) · signal monitor · ambient network
   Hardened: strict mode, safe storage, sanitized rendering,
   guarded canvases, visibility-aware animation loops.
═══════════════════════════════════════════════════════════ */
'use strict';

/* ─────────────────────────────────────────
   0. UTILITIES
───────────────────────────────────────── */
const $  = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

const reducedMotion = window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/* Safe localStorage wrapper — never throws (private mode, quotas, disabled storage) */
const storage = {
  get(key) {
    try { return window.localStorage.getItem(key); } catch (_) { return null; }
  },
  set(key, value) {
    try { window.localStorage.setItem(key, value); } catch (_) { /* storage unavailable — degrade silently */ }
  }
};

/* Minimal whitelist sanitizer for the few translation strings containing markup.
   Only <br>, <em>, <strong> survive; everything else is escaped. All strings are
   developer-authored constants, this is defense-in-depth, not user-input handling. */
function sanitizeMarkup(str) {
  const escaped = String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped
    .replace(/&lt;(\/?)(br|em|strong)&gt;/gi, '<$1$2>');
}

/* ─────────────────────────────────────────
   0b. THEME (light default · dark opt-in)
───────────────────────────────────────── */
const THEME_KEY = 'sy-portfolio-theme';
const THEMES = ['light', 'dark'];

/* Canvas palettes, kept in sync with the CSS custom properties */
const CANVAS_PALETTES = {
  light: {
    net: '29,86,214',                    /* ambient network rgb */
    trace: '#1d56d6',                    /* nominal signal */
    anom: '#e8590c',                     /* anomaly trace */
    anomGlow: 'rgba(232,89,12,0.55)',
    band: 'rgba(232,89,12,0.07)',
    grid: 'rgba(16,31,66,0.07)',
    thresh: 'rgba(16,31,66,0.30)',
    flag: 'rgba(210,74,3,0.95)'
  },
  dark: {
    net: '111,157,255',
    trace: '#6f9dff',
    anom: '#ffab5c',
    anomGlow: 'rgba(255,171,92,0.7)',
    band: 'rgba(255,171,92,0.07)',
    grid: 'rgba(255,255,255,0.05)',
    thresh: 'rgba(255,255,255,0.25)',
    flag: 'rgba(255,171,92,0.95)'
  }
};
let PALETTE = CANVAS_PALETTES.light;

function applyTheme(theme) {
  if (THEMES.indexOf(theme) === -1) theme = 'light';
  document.documentElement.setAttribute('data-theme', theme);
  PALETTE = CANVAS_PALETTES[theme];
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#0a0e1a' : '#f5f7fc');
  $$('.theme-btn').forEach(btn => btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false'));
  storage.set(THEME_KEY, theme);
  /* let canvases redraw their static frames if animations are off */
  try { window.dispatchEvent(new CustomEvent('sy-theme')); } catch (_) { /* very old engines */ }
}

$$('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });
});

/* Restore: saved theme > OS preference > light */
(function initTheme() {
  const saved = storage.get(THEME_KEY);
  if (saved) { applyTheme(saved); return; }
  const prefersDark = window.matchMedia
    && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
})();

/* ─────────────────────────────────────────
   1. TRANSLATIONS
───────────────────────────────────────── */
const HTML_KEYS = new Set(['hero.name', 'about.p1', 'about.p2', 'about.p3']);

const TRANSLATIONS = {

  /* ══════════════ FRANÇAIS ══════════════ */
  fr: {
    'meta.title': 'Shakib Youssef — Traitement du signal, Deep Learning & IA de confiance',
    'meta.desc': "Shakib Youssef — Élève-ingénieur à l'ENSTA Paris, spécialisé en traitement du signal, deep learning, vision par ordinateur, détection d'anomalies et IA de confiance. Recherche une thèse CIFRE à partir d'octobre 2026.",
    'skip': 'Aller au contenu',

    'nav.about': 'À propos', 'nav.education': 'Formation', 'nav.experience': 'Expérience',
    'nav.projects': 'Projets', 'nav.publications': 'Publications', 'nav.skills': 'Compétences',
    'nav.certifications': 'Certifications', 'nav.contact': 'Contact',
    'nav.cv': 'CV', 'nav.cvAria': 'Télécharger le CV (PDF)',
    'lang.groupLabel': 'Choix de la langue',
    'theme.toggle': 'Basculer entre thème clair et sombre',

    'hero.status': 'Recherche une thèse CIFRE — octobre 2026',
    'hero.name': 'Shakib<br><em>Youssef</em>',
    'hero.headline': "Traitement du signal & deep learning pour une IA de confiance",
    'hero.sub': "Élève-ingénieur en dernière année à l'ENSTA — Institut Polytechnique de Paris. Je conçois des systèmes de détection d'anomalies, de vision par ordinateur et d'IA explicable, du signal brut à la décision interprétable.",
    'hero.cta.projects': 'Voir les projets',
    'hero.cta.publications': 'Publications',
    'hero.cta.cv': 'Télécharger le CV',
    'hero.cta.contact': 'Me contacter',
    'hero.panel.aria': "Domaines d'expertise",
    'hero.photoAlt': 'Portrait professionnel de Shakib Youssef',
    'hero.panel.title': 'PROFIL · DOMAINES',
    'hero.panel.d1': 'Traitement du signal',
    'hero.panel.d2': 'Deep learning',
    'hero.panel.d3': 'Vision par ordinateur',
    'hero.panel.d4': "Détection d'anomalies",
    'hero.panel.d5': 'IA explicable (XAI)',
    'hero.panel.d6': 'IA médicale',
    'hero.scroll': 'défiler',

    'monitor.channel': 'SIG-01 · SÉRIE TEMPORELLE · TEMPS RÉEL',
    'monitor.model': 'MODÈLES : AUTOENCODEUR · PATCHCORE · PADIM',
    'monitor.nominal': 'signal nominal',
    'monitor.anomaly': 'anomalie détectée',
    'monitor.threshold': 'seuil de reconstruction',
    'monitor.flag': 'ANOMALIE',

    'about.label': 'À PROPOS',
    'about.title': 'Du signal brut à la décision interprétable',
    'about.p1': "Je suis <strong>Shakib Youssef</strong>, élève-ingénieur en dernière année à l'<strong>ENSTA — Institut Polytechnique de Paris</strong>, spécialisé en <strong>Conception des Systèmes Numériques</strong> : traitement du signal, deep learning et architectures neuronales.",
    'about.p2': "Actuellement en stage de fin d'études chez <strong>IFP Énergies Nouvelles</strong> (Lyon), je développe des méthodes de <strong>détection d'anomalies non supervisée</strong> sur séries temporelles industrielles : encodage signal-vers-image (GAF, MTF), autoencodeurs convolutifs, méthodes par mémoire d'embeddings (PatchCore, PaDiM), et explicabilité par Grad-CAM et LRP.",
    'about.p3': "Mes travaux se situent à l'intersection du <strong>signal</strong> (audio, vocal, ECG, EEG), de l'<strong>imagerie</strong> (médicale, industrielle) et de l'<strong>IA de confiance</strong>. Je recherche une <strong>thèse CIFRE à partir d'octobre 2026</strong> pour approfondir ces axes entre recherche académique et impact industriel.",
    'about.s1': 'Institut Polytechnique de Paris',
    'about.s2': 'IFP Énergies Nouvelles — Lyon',
    'about.s3': 'Publications IEEE',
    'about.s4': 'TOEIC — Anglais',
    'about.s5': 'Expériences R&D en IA',
    'about.s6': 'Langues de travail',

    'edu.label': 'FORMATION',
    'edu.title': 'Parcours académique',
    'edu.e1.date': 'Août 2024 — Présent',
    'edu.e1.role': "Diplôme d'ingénieur — Conception des Systèmes Numériques",
    'edu.e1.org': 'ENSTA — Institut Polytechnique de Paris · France',
    'edu.e1.desc': 'Spécialisation en systèmes numériques : traitement du signal, deep learning, systèmes embarqués et architectures logicielles.',
    'edu.e2.date': 'Sept. 2021 — Juin 2024',
    'edu.e2.role': 'Licence en Technologie et Sciences',
    'edu.e2.org': 'Université Libanaise · Liban',
    'edu.e2.desc': 'Génie des réseaux informatiques et télécommunications — fondements du signal, des réseaux et de la programmation.',

    'exp.label': 'EXPÉRIENCE',
    'exp.title': 'Parcours professionnel',
    'exp.badge.pfe': 'Stage de fin d\u2019études',
    'exp.badge.intern': 'Stage',
    'exp.e1.date': 'Mars 2026 — Présent',
    'exp.e1.role': "Vision par ordinateur & IA pour la détection d'anomalies",
    'exp.e1.org': 'IFP Énergies Nouvelles · Lyon, France',
    'exp.e1.b1': "Développement de modèles de détection d'anomalies non supervisée sur séries temporelles industrielles par encodage signal-vers-image (GAF, MTF), autoencodeurs convolutifs et CNN.",
    'exp.e1.b2': "Benchmark de méthodes par mémoire d'embeddings — PatchCore et PaDiM — face aux approches par reconstruction, sur les mêmes représentations image.",
    'exp.e1.b3': 'Validation des approches sur données synthétiques (Tennessee Eastman Process) et données réelles de pilotes industriels.',
    'exp.e1.b4': 'Explicabilité des détections au niveau capteur via Grad-CAM et Layer-wise Relevance Propagation (LRP).',
    'exp.e2.date': 'Mai 2025 — Sept. 2025',
    'exp.e2.role': "Capteurs de profondeur & IA pour l'estimation de pose",
    'exp.e2.org': 'Ivanae Medical / LaTIM · Brest, France',
    'exp.e2.b1': "Évaluation comparative et intégration de caméras de profondeur au sein d'un dispositif médical de suivi respiratoire.",
    'exp.e2.b2': "Optimisation et adaptation de modèles d'estimation de pose (OpenPose, ViTPose, BlazePose) pour la précision et la robustesse en conditions réelles.",
    'exp.e3.date': 'Déc. 2023 — Juin 2024',
    'exp.e3.role': "Détection de plaques d'immatriculation",
    'exp.e3.org': 'RODOK SARL · Liban',
    'exp.e3.b1': "Conception d'une chaîne de prétraitement d'images (filtrage, correction, normalisation) pour améliorer la qualité de détection.",
    'exp.e3.b2': "Développement d'un pipeline YOLOv8 pour la localisation des plaques et l'extraction/reconnaissance des caractères (OCR).",
    'exp.e4.date': 'Mai 2023 — Août 2023',
    'exp.e4.role': "Système d'IA pour la santé",
    'exp.e4.org': 'Together for Chehim · Liban',
    'exp.e4.b1': 'Conception de modèles de classification pour la détection de pathologies cardiaques à partir de signaux ECG.',
    'exp.e4.b2': "Mise en production d'un prototype de prédiction sur données patients réelles : prétraitement, entraînement, validation.",

    'proj.label': 'PROJETS',
    'proj.title': "Projets de recherche & d'ingénierie",
    'proj.p1.date': 'Sept. 2025 — Mars 2026',
    'proj.p1.title': 'ExpMedIa — Explicabilité en imagerie médicale',
    'proj.p1.ctx': 'ENSTA · Projet de recherche',
    'proj.p1.desc': "Comment faire confiance à un diagnostic produit par un réseau profond ? Développement et analyse de modèles deep learning pour l'imagerie médicale (CheXNet, PYLON), puis explication de leurs décisions via Grad-CAM, Grad-CAM++, LRP et Integrated Gradients.",
    'proj.p2.date': 'Déc. 2024 — Juil. 2025',
    'proj.p2.title': 'Segmentation de tumeurs cérébrales par Transformers',
    'proj.p2.ctx': 'Projet personnel',
    'proj.p2.desc': "Modèle Transformers U-Net pour la segmentation de tumeurs cérébrales sur IRM multimodales, avec amélioration de la précision sur les sous-régions tumorales (WT, TC, ET).",
    'proj.p3.date': 'Sept. 2024 — Mai 2025',
    'proj.p3.title': 'Surveillance multi-caméras temps réel',
    'proj.p3.ctx': "ENSTA · Projet d'ingénierie",
    'proj.p3.desc': "Système de surveillance détectant et suivant des objets sur flux vidéo multi-caméras. Pipeline YOLOv10 + DeepSORT optimisé pour la détection et le suivi en temps réel.",
    'proj.p3.t3': 'Temps réel',
    'proj.p4.date': 'Mars 2024 — Juil. 2024',
    'proj.p4.title': 'Analyse EEG pour interface cerveau–ordinateur',
    'proj.p4.ctx': 'Université Libanaise · Recherche',
    'proj.p4.desc': "Algorithmes de traitement du signal EEG pour réduire le bruit et améliorer l'extraction de caractéristiques, en collaboration avec des équipes de recherche pour optimiser des modèles d'apprentissage sur données EEG.",
    'proj.p4.t3': 'Traitement du signal',

    'pub.label': 'RECHERCHE',
    'pub.title': 'Publications',
    'pub.sub': 'Travaux évalués par les pairs, publiés dans des conférences internationales IEEE.',

    'skills.label': 'COMPÉTENCES',
    'skills.title': 'Cartographie des capacités',
    'skills.g1': 'PROGRAMMATION',
    'skills.g2': 'IA & VISION PAR ORDINATEUR',
    'skills.g3': 'SIGNAL & DONNÉES',
    'skills.g4': 'OUTILS DE DÉVELOPPEMENT',
    'skills.g5': "SYSTÈMES D'EXPLOITATION",
    'skills.g6': 'LANGUES',
    'skills.g7': 'R&D & COMPÉTENCES TRANSVERSES',
    'skills.lang.fr': 'Français — B2',
    'skills.lang.en': 'Anglais — TOEIC 940/990',
    'skills.lang.ar': 'Arabe — langue maternelle',
    'skills.soft.s1': 'Recherche & développement',
    'skills.soft.s2': 'Rédaction technique',
    'skills.soft.s3': 'Gestion de projet',
    'skills.soft.s4': 'Travail en équipe',
    'skills.soft.s5': 'Autonomie',
    'skills.soft.s6': 'Prise de décision',
    'skills.soft.s7': 'Communication orale & écrite',
    'skills.soft.s8': 'Organisation',

    'cert.label': 'CERTIFICATIONS',
    'cert.title': 'Certifications',
    'cert.c1.title': 'AI and the Future of Youth',
    'cert.c1.org': 'Digital World AI',
    'cert.c2.title': 'Fondations du piratage éthique',
    'cert.c2.org': 'Semicolon Academy',
    'cert.c3.title': 'Python · Pandas · Intro au Machine Learning',
    'cert.c3.org': 'Kaggle',
    'cert.c4.title': 'Gestion de projet agile avec Scrum',
    'cert.c4.org': 'MOOC Gestion de Projet',
    'cert.c5.title': 'Outils et applications web pour la gestion de projet',
    'cert.c5.org': 'MOOC Gestion de Projet',
    'cert.c6.title': 'Tronc commun GdP24',
    'cert.c6.org': 'MOOC Gestion de Projet',

    'contact.label': 'CONTACT',
    'contact.title': "Construisons l'IA de confiance de demain.",
    'contact.sub': "Ouvert aux thèses CIFRE, collaborations de recherche, projets R&D en IA et discussions scientifiques — n'hésitez pas à me contacter.",
    'contact.loc': 'Lyon, France',
    'contact.cv': 'Télécharger mon CV',

    'footer.line': '© 2026 Shakib Youssef — ENSTA Paris · IFP Énergies Nouvelles',
    'footer.tag': 'signal → représentation → décision → explication'
  },

  /* ══════════════ ENGLISH ══════════════ */
  en: {
    'meta.title': 'Shakib Youssef — Signal Processing, Deep Learning & Trustworthy AI',
    'meta.desc': 'Shakib Youssef — Engineering student at ENSTA Paris specializing in signal processing, deep learning, computer vision, anomaly detection, and trustworthy AI. Seeking a CIFRE PhD from October 2026.',
    'skip': 'Skip to content',

    'nav.about': 'About', 'nav.education': 'Education', 'nav.experience': 'Experience',
    'nav.projects': 'Projects', 'nav.publications': 'Publications', 'nav.skills': 'Skills',
    'nav.certifications': 'Certifications', 'nav.contact': 'Contact',
    'nav.cv': 'CV', 'nav.cvAria': 'Download CV (PDF)',
    'lang.groupLabel': 'Language selection',
    'theme.toggle': 'Toggle light/dark theme',

    'hero.status': 'Seeking a CIFRE PhD — October 2026',
    'hero.name': 'Shakib<br><em>Youssef</em>',
    'hero.headline': 'Signal processing & deep learning for trustworthy AI',
    'hero.sub': "Final-year engineering student at ENSTA — Institut Polytechnique de Paris. I design anomaly detection, computer vision and explainable AI systems — from raw signals to interpretable decisions.",
    'hero.cta.projects': 'View projects',
    'hero.cta.publications': 'Publications',
    'hero.cta.cv': 'Download CV',
    'hero.cta.contact': 'Contact me',
    'hero.panel.aria': 'Areas of expertise',
    'hero.photoAlt': 'Professional portrait of Shakib Youssef',
    'hero.panel.title': 'PROFILE · DOMAINS',
    'hero.panel.d1': 'Signal processing',
    'hero.panel.d2': 'Deep learning',
    'hero.panel.d3': 'Computer vision',
    'hero.panel.d4': 'Anomaly detection',
    'hero.panel.d5': 'Explainable AI (XAI)',
    'hero.panel.d6': 'Medical AI',
    'hero.scroll': 'scroll',

    'monitor.channel': 'SIG-01 · TIME SERIES · LIVE',
    'monitor.model': 'MODELS: AUTOENCODER · PATCHCORE · PADIM',
    'monitor.nominal': 'nominal signal',
    'monitor.anomaly': 'anomaly detected',
    'monitor.threshold': 'reconstruction threshold',
    'monitor.flag': 'ANOMALY',

    'about.label': 'ABOUT',
    'about.title': 'From raw signals to interpretable decisions',
    'about.p1': "I am <strong>Shakib Youssef</strong>, a final-year engineering student at <strong>ENSTA — Institut Polytechnique de Paris</strong>, specializing in <strong>Digital Systems Design</strong>: signal processing, deep learning and neural architectures.",
    'about.p2': "I am currently completing my graduation internship at <strong>IFP Énergies Nouvelles</strong> (Lyon), developing <strong>unsupervised anomaly detection</strong> methods for industrial time series: signal-to-image encoding (GAF, MTF), convolutional autoencoders, embedding memory-bank methods (PatchCore, PaDiM), and explainability with Grad-CAM and LRP.",
    'about.p3': "My work sits at the intersection of <strong>signals</strong> (audio, voice, ECG, EEG), <strong>imaging</strong> (medical, industrial) and <strong>trustworthy AI</strong>. I am seeking a <strong>CIFRE PhD starting October 2026</strong> to pursue these directions between academic research and industrial impact.",
    'about.s1': 'Institut Polytechnique de Paris',
    'about.s2': 'IFP Énergies Nouvelles — Lyon',
    'about.s3': 'IEEE publications',
    'about.s4': 'TOEIC — English',
    'about.s5': 'AI R&D experiences',
    'about.s6': 'Working languages',

    'edu.label': 'EDUCATION',
    'edu.title': 'Academic background',
    'edu.e1.date': 'Aug. 2024 — Present',
    'edu.e1.role': "Engineering degree — Digital Systems Design",
    'edu.e1.org': 'ENSTA — Institut Polytechnique de Paris · France',
    'edu.e1.desc': 'Specialization in digital systems: signal processing, deep learning, embedded systems and software architectures.',
    'edu.e2.date': 'Sept. 2021 — June 2024',
    'edu.e2.role': 'BSc in Technology and Science',
    'edu.e2.org': 'Lebanese University · Lebanon',
    'edu.e2.desc': 'Computer networks and telecommunications engineering — foundations in signals, networks and programming.',

    'exp.label': 'EXPERIENCE',
    'exp.title': 'Professional experience',
    'exp.badge.pfe': 'Graduation internship',
    'exp.badge.intern': 'Internship',
    'exp.e1.date': 'March 2026 — Present',
    'exp.e1.role': 'Computer vision & AI for anomaly detection',
    'exp.e1.org': 'IFP Énergies Nouvelles · Lyon, France',
    'exp.e1.b1': 'Developing unsupervised anomaly detection models for industrial time series through signal-to-image encoding (GAF, MTF), convolutional autoencoders and CNNs.',
    'exp.e1.b2': 'Benchmarking embedding memory-bank methods — PatchCore and PaDiM — against reconstruction-based approaches on the same image representations.',
    'exp.e1.b3': 'Validating the proposed approaches on synthetic data (Tennessee Eastman Process) and real data from industrial pilot units.',
    'exp.e1.b4': 'Sensor-level explainability of detections via Grad-CAM and Layer-wise Relevance Propagation (LRP).',
    'exp.e2.date': 'May 2025 — Sept. 2025',
    'exp.e2.role': 'Depth sensors & AI for pose estimation',
    'exp.e2.org': 'Ivanae Medical / LaTIM · Brest, France',
    'exp.e2.b1': 'Comparative evaluation and integration of depth cameras within a medical respiratory-monitoring device.',
    'exp.e2.b2': 'Optimization and adaptation of pose-estimation models (OpenPose, ViTPose, BlazePose) for accuracy and robustness in real conditions.',
    'exp.e3.date': 'Dec. 2023 — June 2024',
    'exp.e3.role': 'License plate detection',
    'exp.e3.org': 'RODOK SARL · Lebanon',
    'exp.e3.b1': 'Designed an image preprocessing chain (filtering, correction, normalization) to improve detection quality.',
    'exp.e3.b2': 'Built a YOLOv8-based pipeline for plate localization and character extraction/recognition (OCR).',
    'exp.e4.date': 'May 2023 — Aug. 2023',
    'exp.e4.role': 'AI system for healthcare',
    'exp.e4.org': 'Together for Chehim · Lebanon',
    'exp.e4.b1': 'Designed classification models for detecting cardiac pathologies from ECG signals.',
    'exp.e4.b2': 'Deployed a prediction prototype on real patient data: preprocessing, training, validation.',

    'proj.label': 'PROJECTS',
    'proj.title': 'Research & engineering projects',
    'proj.p1.date': 'Sept. 2025 — March 2026',
    'proj.p1.title': 'ExpMedIa — Explainability in medical imaging',
    'proj.p1.ctx': 'ENSTA · Research project',
    'proj.p1.desc': 'How can we trust a diagnosis produced by a deep network? Development and analysis of deep learning models for medical imaging (CheXNet, PYLON), with decision explanations via Grad-CAM, Grad-CAM++, LRP and Integrated Gradients.',
    'proj.p2.date': 'Dec. 2024 — July 2025',
    'proj.p2.title': 'Brain tumor segmentation with Transformers',
    'proj.p2.ctx': 'Personal project',
    'proj.p2.desc': 'Transformers U-Net model for brain tumor segmentation on multimodal MRI, improving accuracy on tumor sub-regions (WT, TC, ET).',
    'proj.p3.date': 'Sept. 2024 — May 2025',
    'proj.p3.title': 'Real-time multi-camera surveillance',
    'proj.p3.ctx': 'ENSTA · Engineering project',
    'proj.p3.desc': 'Surveillance system detecting and tracking objects across multi-camera video streams. YOLOv10 + DeepSORT pipeline optimized for real-time detection and tracking.',
    'proj.p3.t3': 'Real-time',
    'proj.p4.date': 'March 2024 — July 2024',
    'proj.p4.title': 'EEG analysis for brain–computer interfaces',
    'proj.p4.ctx': 'Lebanese University · Research',
    'proj.p4.desc': 'EEG signal-processing algorithms to reduce noise and improve feature extraction, in collaboration with research teams to optimize machine learning models on EEG data.',
    'proj.p4.t3': 'Signal processing',

    'pub.label': 'RESEARCH',
    'pub.title': 'Publications',
    'pub.sub': 'Peer-reviewed work published in IEEE international conferences.',

    'skills.label': 'SKILLS',
    'skills.title': 'Capability map',
    'skills.g1': 'PROGRAMMING',
    'skills.g2': 'AI & COMPUTER VISION',
    'skills.g3': 'SIGNAL & DATA',
    'skills.g4': 'DEVELOPMENT TOOLS',
    'skills.g5': 'OPERATING SYSTEMS',
    'skills.g6': 'LANGUAGES',
    'skills.g7': 'R&D & TRANSVERSAL SKILLS',
    'skills.lang.fr': 'French — B2',
    'skills.lang.en': 'English — TOEIC 940/990',
    'skills.lang.ar': 'Arabic — native',
    'skills.soft.s1': 'Research & development',
    'skills.soft.s2': 'Technical writing',
    'skills.soft.s3': 'Project management',
    'skills.soft.s4': 'Teamwork',
    'skills.soft.s5': 'Autonomy',
    'skills.soft.s6': 'Decision-making',
    'skills.soft.s7': 'Oral & written communication',
    'skills.soft.s8': 'Organization',

    'cert.label': 'CERTIFICATIONS',
    'cert.title': 'Certifications',
    'cert.c1.title': 'AI and the Future of Youth',
    'cert.c1.org': 'Digital World AI',
    'cert.c2.title': 'Ethical Hacking Foundations',
    'cert.c2.org': 'Semicolon Academy',
    'cert.c3.title': 'Python · Pandas · Intro to Machine Learning',
    'cert.c3.org': 'Kaggle',
    'cert.c4.title': 'Agile Project Management with Scrum',
    'cert.c4.org': 'Project Management MOOC',
    'cert.c5.title': 'Web Tools & Applications for Project Management',
    'cert.c5.org': 'Project Management MOOC',
    'cert.c6.title': 'GdP24 Core Curriculum',
    'cert.c6.org': 'Project Management MOOC',

    'contact.label': 'CONTACT',
    'contact.title': "Let's build tomorrow's trustworthy AI.",
    'contact.sub': 'Open to CIFRE PhD opportunities, research collaborations, AI R&D projects and scientific discussions — feel free to reach out.',
    'contact.loc': 'Lyon, France',
    'contact.cv': 'Download my CV',

    'footer.line': '© 2026 Shakib Youssef — ENSTA Paris · IFP Énergies Nouvelles',
    'footer.tag': 'signal → representation → decision → explanation'
  },

  /* ══════════════ العربية ══════════════ */
  ar: {
    'meta.title': 'شكيب يوسف — معالجة الإشارات والتعلّم العميق والذكاء الاصطناعي الموثوق',
    'meta.desc': 'شكيب يوسف — طالب هندسة في ENSTA باريس، متخصص في معالجة الإشارات والتعلّم العميق والرؤية الحاسوبية وكشف الشذوذ والذكاء الاصطناعي الموثوق. أبحث عن أطروحة دكتوراه CIFRE ابتداءً من أكتوبر 2026.',
    'skip': 'الانتقال إلى المحتوى',

    'nav.about': 'نبذة عني', 'nav.education': 'التعليم', 'nav.experience': 'الخبرات',
    'nav.projects': 'المشاريع', 'nav.publications': 'المنشورات', 'nav.skills': 'المهارات',
    'nav.certifications': 'الشهادات', 'nav.contact': 'التواصل',
    'nav.cv': 'السيرة', 'nav.cvAria': 'تنزيل السيرة الذاتية (PDF)',
    'lang.groupLabel': 'اختيار اللغة',
    'theme.toggle': 'التبديل بين الوضع الفاتح والداكن',

    'hero.status': 'أبحث عن أطروحة دكتوراه CIFRE — أكتوبر 2026',
    'hero.name': 'شكيب<br><em>يوسف</em>',
    'hero.headline': 'معالجة الإشارات والتعلّم العميق من أجل ذكاء اصطناعي موثوق',
    'hero.sub': 'طالب هندسة في السنة الأخيرة في ENSTA — معهد باريس التقني المتعدد (Institut Polytechnique de Paris). أصمّم أنظمة كشف الشذوذ والرؤية الحاسوبية والذكاء الاصطناعي القابل للتفسير — من الإشارة الخام إلى القرار القابل للتفسير.',
    'hero.cta.projects': 'عرض المشاريع',
    'hero.cta.publications': 'المنشورات',
    'hero.cta.cv': 'تنزيل السيرة الذاتية',
    'hero.cta.contact': 'تواصل معي',
    'hero.panel.aria': 'مجالات الخبرة',
    'hero.photoAlt': 'صورة شخصية احترافية لشكيب يوسف',
    'hero.panel.title': 'الملف · المجالات',
    'hero.panel.d1': 'معالجة الإشارات',
    'hero.panel.d2': 'التعلّم العميق',
    'hero.panel.d3': 'الرؤية الحاسوبية',
    'hero.panel.d4': 'كشف الشذوذ',
    'hero.panel.d5': 'الذكاء الاصطناعي القابل للتفسير (XAI)',
    'hero.panel.d6': 'الذكاء الاصطناعي الطبي',
    'hero.scroll': 'مرّر',

    'monitor.channel': 'SIG-01 · سلسلة زمنية · بث مباشر',
    'monitor.model': 'النماذج: Autoencoder · PatchCore · PaDiM',
    'monitor.nominal': 'إشارة طبيعية',
    'monitor.anomaly': 'تم كشف شذوذ',
    'monitor.threshold': 'عتبة إعادة البناء',
    'monitor.flag': 'شذوذ',

    'about.label': 'نبذة عني',
    'about.title': 'من الإشارة الخام إلى القرار القابل للتفسير',
    'about.p1': 'أنا <strong>شكيب يوسف</strong>، طالب هندسة في السنة الأخيرة في <strong>ENSTA — معهد باريس التقني المتعدد</strong>، متخصص في <strong>تصميم الأنظمة الرقمية</strong>: معالجة الإشارات والتعلّم العميق والبنى العصبونية.',
    'about.p2': 'أُجري حالياً تدريب التخرّج في <strong>IFP Énergies Nouvelles</strong> (ليون، فرنسا)، حيث أطوّر أساليب <strong>كشف الشذوذ غير الموجَّه</strong> على السلاسل الزمنية الصناعية: ترميز الإشارة إلى صورة (GAF, MTF)، والمشفّرات الذاتية التلافيفية، وأساليب ذاكرة التضمينات (PatchCore, PaDiM)، وقابلية التفسير عبر Grad-CAM وLRP.',
    'about.p3': 'تقع أعمالي عند تقاطع <strong>الإشارات</strong> (الصوت، الكلام، ECG، EEG) و<strong>التصوير</strong> (الطبي والصناعي) و<strong>الذكاء الاصطناعي الموثوق</strong>. أبحث عن <strong>أطروحة دكتوراه CIFRE ابتداءً من أكتوبر 2026</strong> لتعميق هذه المحاور بين البحث الأكاديمي والأثر الصناعي.',
    'about.s1': 'معهد باريس التقني المتعدد',
    'about.s2': 'IFP Énergies Nouvelles — ليون',
    'about.s3': 'منشورات IEEE',
    'about.s4': 'TOEIC — الإنجليزية',
    'about.s5': 'خبرات بحث وتطوير في الذكاء الاصطناعي',
    'about.s6': 'لغات عمل',

    'edu.label': 'التعليم',
    'edu.title': 'المسار الأكاديمي',
    'edu.e1.date': 'أغسطس 2024 — حتى الآن',
    'edu.e1.role': 'شهادة مهندس — تصميم الأنظمة الرقمية',
    'edu.e1.org': 'ENSTA — معهد باريس التقني المتعدد · فرنسا',
    'edu.e1.desc': 'تخصص في الأنظمة الرقمية: معالجة الإشارات، التعلّم العميق، الأنظمة المدمجة والبنى البرمجية.',
    'edu.e2.date': 'سبتمبر 2021 — يونيو 2024',
    'edu.e2.role': 'إجازة في التكنولوجيا والعلوم',
    'edu.e2.org': 'الجامعة اللبنانية · لبنان',
    'edu.e2.desc': 'هندسة شبكات المعلوماتية والاتصالات — أسس الإشارات والشبكات والبرمجة.',

    'exp.label': 'الخبرات',
    'exp.title': 'المسار المهني',
    'exp.badge.pfe': 'تدريب التخرّج',
    'exp.badge.intern': 'تدريب',
    'exp.e1.date': 'مارس 2026 — حتى الآن',
    'exp.e1.role': 'الرؤية الحاسوبية والذكاء الاصطناعي لكشف الشذوذ',
    'exp.e1.org': 'IFP Énergies Nouvelles · ليون، فرنسا',
    'exp.e1.b1': 'تطوير نماذج كشف الشذوذ غير الموجَّه على السلاسل الزمنية الصناعية عبر ترميز الإشارة إلى صورة (GAF, MTF) والمشفّرات الذاتية التلافيفية وشبكات CNN.',
    'exp.e1.b2': 'مقارنة أداء أساليب ذاكرة التضمينات — PatchCore وPaDiM — مع الأساليب القائمة على إعادة البناء على التمثيلات الصورية نفسها.',
    'exp.e1.b3': 'التحقق من الأساليب المقترحة على بيانات اصطناعية (Tennessee Eastman Process) وبيانات حقيقية من وحدات صناعية تجريبية.',
    'exp.e1.b4': 'قابلية تفسير الكشف على مستوى الحسّاسات عبر Grad-CAM وLRP.',
    'exp.e2.date': 'مايو 2025 — سبتمبر 2025',
    'exp.e2.role': 'حسّاسات العمق والذكاء الاصطناعي لتقدير وضعية الجسم',
    'exp.e2.org': 'Ivanae Medical / LaTIM · بريست، فرنسا',
    'exp.e2.b1': 'تقييم مقارن ودمج كاميرات العمق ضمن جهاز طبي لمراقبة التنفّس.',
    'exp.e2.b2': 'تحسين وتكييف نماذج تقدير الوضعية (OpenPose, ViTPose, BlazePose) لرفع الدقة والمتانة في الظروف الحقيقية.',
    'exp.e3.date': 'ديسمبر 2023 — يونيو 2024',
    'exp.e3.role': 'كشف لوحات تسجيل المركبات',
    'exp.e3.org': 'RODOK SARL · لبنان',
    'exp.e3.b1': 'تصميم سلسلة معالجة مسبقة للصور (ترشيح، تصحيح، تسوية) لتحسين جودة الكشف.',
    'exp.e3.b2': 'تطوير خط معالجة قائم على YOLOv8 لتحديد مواقع اللوحات واستخراج الأحرف والتعرّف عليها (OCR).',
    'exp.e4.date': 'مايو 2023 — أغسطس 2023',
    'exp.e4.role': 'نظام ذكاء اصطناعي للصحة',
    'exp.e4.org': 'Together for Chehim · لبنان',
    'exp.e4.b1': 'تصميم نماذج تصنيف لكشف أمراض القلب انطلاقاً من إشارات ECG.',
    'exp.e4.b2': 'إطلاق نموذج أولي للتنبؤ على بيانات مرضى حقيقية: معالجة مسبقة، تدريب، تحقق.',

    'proj.label': 'المشاريع',
    'proj.title': 'مشاريع بحثية وهندسية',
    'proj.p1.date': 'سبتمبر 2025 — مارس 2026',
    'proj.p1.title': 'ExpMedIa — قابلية التفسير في التصوير الطبي',
    'proj.p1.ctx': 'ENSTA · مشروع بحثي',
    'proj.p1.desc': 'كيف نثق بتشخيص صادر عن شبكة عميقة؟ تطوير وتحليل نماذج تعلّم عميق للتصوير الطبي (CheXNet, PYLON)، ثم تفسير قراراتها عبر Grad-CAM وGrad-CAM++ وLRP وIntegrated Gradients.',
    'proj.p2.date': 'ديسمبر 2024 — يوليو 2025',
    'proj.p2.title': 'تجزئة أورام الدماغ باستخدام Transformers',
    'proj.p2.ctx': 'مشروع شخصي',
    'proj.p2.desc': 'نموذج Transformers U-Net لتجزئة أورام الدماغ على صور رنين مغناطيسي متعددة الأنماط، مع تحسين الدقة على المناطق الفرعية للورم (WT, TC, ET).',
    'proj.p3.date': 'سبتمبر 2024 — مايو 2025',
    'proj.p3.title': 'مراقبة متعددة الكاميرات في الزمن الحقيقي',
    'proj.p3.ctx': 'ENSTA · مشروع هندسي',
    'proj.p3.desc': 'نظام مراقبة يكشف الأجسام ويتتبعها عبر تدفقات فيديو متعددة الكاميرات. خط معالجة YOLOv10 + DeepSORT محسّن للكشف والتتبع في الزمن الحقيقي.',
    'proj.p3.t3': 'زمن حقيقي',
    'proj.p4.date': 'مارس 2024 — يوليو 2024',
    'proj.p4.title': 'تحليل إشارات EEG لواجهة دماغ–حاسوب',
    'proj.p4.ctx': 'الجامعة اللبنانية · بحث',
    'proj.p4.desc': 'خوارزميات معالجة إشارات EEG لتقليل الضجيج وتحسين استخراج الخصائص، بالتعاون مع فرق بحثية لتحسين نماذج تعلّم الآلة على بيانات EEG.',
    'proj.p4.t3': 'معالجة الإشارات',

    'pub.label': 'البحث العلمي',
    'pub.title': 'المنشورات',
    'pub.sub': 'أعمال محكَّمة منشورة في مؤتمرات IEEE دولية.',

    'skills.label': 'المهارات',
    'skills.title': 'خريطة القدرات',
    'skills.g1': 'البرمجة',
    'skills.g2': 'الذكاء الاصطناعي والرؤية الحاسوبية',
    'skills.g3': 'الإشارات والبيانات',
    'skills.g4': 'أدوات التطوير',
    'skills.g5': 'أنظمة التشغيل',
    'skills.g6': 'اللغات',
    'skills.g7': 'البحث والتطوير والمهارات العامة',
    'skills.lang.fr': 'الفرنسية — B2',
    'skills.lang.en': 'الإنجليزية — TOEIC 940/990',
    'skills.lang.ar': 'العربية — اللغة الأم',
    'skills.soft.s1': 'البحث والتطوير',
    'skills.soft.s2': 'الكتابة التقنية',
    'skills.soft.s3': 'إدارة المشاريع',
    'skills.soft.s4': 'العمل الجماعي',
    'skills.soft.s5': 'الاستقلالية',
    'skills.soft.s6': 'اتخاذ القرار',
    'skills.soft.s7': 'التواصل الشفهي والكتابي',
    'skills.soft.s8': 'التنظيم',

    'cert.label': 'الشهادات',
    'cert.title': 'الشهادات',
    'cert.c1.title': 'AI and the Future of Youth',
    'cert.c1.org': 'Digital World AI',
    'cert.c2.title': 'أسس الاختراق الأخلاقي',
    'cert.c2.org': 'Semicolon Academy',
    'cert.c3.title': 'Python · Pandas · مدخل إلى تعلّم الآلة',
    'cert.c3.org': 'Kaggle',
    'cert.c4.title': 'إدارة المشاريع الرشيقة باستخدام Scrum',
    'cert.c4.org': 'MOOC إدارة المشاريع',
    'cert.c5.title': 'أدوات وتطبيقات ويب لإدارة المشاريع',
    'cert.c5.org': 'MOOC إدارة المشاريع',
    'cert.c6.title': 'المنهاج المشترك GdP24',
    'cert.c6.org': 'MOOC إدارة المشاريع',

    'contact.label': 'التواصل',
    'contact.title': 'لنبنِ معاً الذكاء الاصطناعي الموثوق للغد.',
    'contact.sub': 'منفتح على أطروحات CIFRE والتعاون البحثي ومشاريع البحث والتطوير في الذكاء الاصطناعي والنقاشات العلمية — لا تتردد في التواصل معي.',
    'contact.loc': 'ليون، فرنسا',
    'contact.cv': 'تنزيل سيرتي الذاتية',

    'footer.line': '© 2026 شكيب يوسف — ENSTA باريس · IFP Énergies Nouvelles',
    'footer.tag': 'إشارة ← تمثيل ← قرار ← تفسير'
  }
};

const SUPPORTED_LANGS = ['fr', 'en', 'ar'];
const LANG_KEY = 'sy-portfolio-lang';
let currentLang = 'fr';

function t(key) {
  const table = TRANSLATIONS[currentLang] || TRANSLATIONS.fr;
  return Object.prototype.hasOwnProperty.call(table, key)
    ? table[key]
    : (TRANSLATIONS.fr[key] || '');
}

function applyLanguage(lang) {
  if (SUPPORTED_LANGS.indexOf(lang) === -1) lang = 'fr';
  currentLang = lang;

  const html = document.documentElement;
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  /* Text nodes */
  $$('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = t(key);
    if (!value) return;
    if (HTML_KEYS.has(key)) {
      el.innerHTML = sanitizeMarkup(value);
    } else {
      el.textContent = value;
    }
  });

  /* Attribute translations: data-i18n-attr="attr:key" (supports several, "|"-separated) */
  $$('[data-i18n-attr]').forEach(el => {
    const spec = el.getAttribute('data-i18n-attr') || '';
    spec.split('|').forEach(pair => {
      const idx = pair.indexOf(':');
      if (idx < 1) return;
      const attr = pair.slice(0, idx).trim();
      const key = pair.slice(idx + 1).trim();
      /* whitelist of attributes we allow to be set dynamically */
      if (['aria-label', 'title', 'placeholder', 'alt'].indexOf(attr) === -1) return;
      const value = t(key);
      if (value) el.setAttribute(attr, value);
    });
  });

  /* Document metadata */
  document.title = t('meta.title') || document.title;
  const metaDesc = $('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', t('meta.desc'));

  /* Switcher active states */
  $$('.lang-btn').forEach(btn => {
    const active = btn.getAttribute('data-lang') === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  storage.set(LANG_KEY, lang);
}

/* Wire up all language buttons (navbar + mobile menu) */
$$('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    applyLanguage(btn.getAttribute('data-lang'));
  });
});

/* Restore saved language (default: fr) */
applyLanguage(storage.get(LANG_KEY) || 'fr');

/* ─────────────────────────────────────────
   2. NAVBAR — scroll state
───────────────────────────────────────── */
const navbar = $('#navbar');
if (navbar) {
  const onScrollNav = () => navbar.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();
}

/* ─────────────────────────────────────────
   3. BURGER MENU (with ARIA + Escape)
───────────────────────────────────────── */
const burger = $('#burger');
const mobileMenu = $('#mobile-menu');

function setMenu(open) {
  if (!burger || !mobileMenu) return;
  burger.classList.toggle('open', open);
  mobileMenu.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.style.overflow = open ? 'hidden' : '';
}

if (burger && mobileMenu) {
  burger.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
  $$('.mm-link', mobileMenu).forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setMenu(false);
  });
}

/* ─────────────────────────────────────────
   4. SCROLL REVEAL (graceful fallback)
───────────────────────────────────────── */
const revealEls = $$('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach(el => el.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        window.setTimeout(() => entry.target.classList.add('visible'), Math.min(i, 5) * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));
}

/* ─────────────────────────────────────────
   5. ACTIVE NAV LINK (rAF-throttled)
───────────────────────────────────────── */
const sections = $$('.section, #hero');
const navAnchors = $$('.nav-links a, .mm-link');
let navTick = false;

function updateActiveLink() {
  navTick = false;
  let current = '';
  const y = window.scrollY;
  sections.forEach(section => {
    if (y >= section.offsetTop - 120) current = section.id || current;
  });
  navAnchors.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}
window.addEventListener('scroll', () => {
  if (!navTick) { navTick = true; window.requestAnimationFrame(updateActiveLink); }
}, { passive: true });
updateActiveLink();

/* ─────────────────────────────────────────
   6. AMBIENT BACKGROUND — neural lattice
───────────────────────────────────────── */
(function ambientNetwork() {
  const canvas = $('#bg-canvas');
  if (!canvas || typeof canvas.getContext !== 'function') return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const NODE_COUNT = 46;
  let W = 0, H = 0, dpr = 1, nodes = [], rafId = null;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function build() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.5,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        a: Math.random() * 0.35 + 0.08
      });
    }
  }

  function frame(step) {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];
      if (step) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + PALETTE.net + ',' + p.a + ')';
      ctx.fill();
    }

    const MAX_D = 150;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < MAX_D * MAX_D) {
          const d = Math.sqrt(d2);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = 'rgba(' + PALETTE.net + ',' + (0.06 * (1 - d / MAX_D)).toFixed(4) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    frame(true);
    rafId = window.requestAnimationFrame(loop);
  }
  function start() { if (rafId === null && !reducedMotion) rafId = window.requestAnimationFrame(loop); }
  function stop()  { if (rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; } }

  resize();
  build();

  window.addEventListener('sy-theme', () => { if (reducedMotion || rafId === null) frame(false); });

  if (reducedMotion) {
    frame(false);               /* one static frame */
  } else {
    start();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => { resize(); build(); if (reducedMotion) frame(false); }, 150);
  });
})();

/* ─────────────────────────────────────────
   7. SIGNATURE — live anomaly signal monitor
───────────────────────────────────────── */
(function signalMonitor() {
  const canvas = $('#signal-canvas');
  if (!canvas || typeof canvas.getContext !== 'function') return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let W = 0, H = 0, dpr = 1;
  let points = [];              /* { v: value in [-1,1], anomaly: bool } */
  let tPhase = 0;
  let anomalyTimer = 0;         /* frames remaining in current anomaly   */
  let nextAnomalyIn = 260;      /* frames until next anomaly burst       */
  let rafId = null;
  let inView = true;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    W = Math.max(rect.width, 10);
    H = Math.max(rect.height, 10);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const capacity = Math.ceil(W / 2) + 4;
    while (points.length > capacity) points.shift();
  }

  function nextValue() {
    tPhase += 0.045;
    let v = Math.sin(tPhase) * 0.32
          + Math.sin(tPhase * 2.7 + 1.3) * 0.14
          + Math.sin(tPhase * 0.31) * 0.18
          + (Math.random() - 0.5) * 0.07;
    let anomaly = false;

    if (anomalyTimer > 0) {
      /* anomaly burst: amplitude excursion beyond the ±2σ band */
      const k = anomalyTimer / 34;
      v += Math.sin(anomalyTimer * 0.9) * 0.85 * k + 0.35 * k;
      anomaly = true;
      anomalyTimer--;
    } else {
      nextAnomalyIn--;
      if (nextAnomalyIn <= 0) {
        anomalyTimer = 34;
        nextAnomalyIn = 300 + Math.floor(Math.random() * 260);
      }
    }
    return { v: Math.max(-1.15, Math.min(1.15, v)), anomaly };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const mid = H / 2;
    const amp = H * 0.30;
    const thr = amp * 0.72;    /* visual ±2σ threshold */

    /* faint horizontal grid */
    ctx.strokeStyle = PALETTE.grid;
    ctx.lineWidth = 1;
    for (let gy = 1; gy < 4; gy++) {
      const y = (H / 4) * gy;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    /* dashed thresholds */
    ctx.strokeStyle = PALETTE.thresh;
    ctx.setLineDash([5, 6]);
    ctx.beginPath(); ctx.moveTo(0, mid - thr); ctx.lineTo(W, mid - thr); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, mid + thr); ctx.lineTo(W, mid + thr); ctx.stroke();
    ctx.setLineDash([]);

    /* anomaly bands behind the trace */
    for (let i = 0; i < points.length; i++) {
      if (points[i].anomaly) {
        ctx.fillStyle = PALETTE.band;
        ctx.fillRect(i * 2, 0, 2, H);
      }
    }

    /* the trace, segmented by state */
    let lastAnomalyX = -1;
    for (let i = 1; i < points.length; i++) {
      const x0 = (i - 1) * 2, x1 = i * 2;
      const y0 = mid - points[i - 1].v * amp;
      const y1 = mid - points[i].v * amp;
      const anom = points[i].anomaly;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.strokeStyle = anom ? PALETTE.anom : PALETTE.trace;
      ctx.lineWidth = anom ? 2 : 1.6;
      ctx.shadowBlur = anom ? 9 : 0;
      ctx.shadowColor = anom ? PALETTE.anomGlow : 'transparent';
      ctx.stroke();
      if (anom) lastAnomalyX = x1;
    }
    ctx.shadowBlur = 0;

    /* flag label near the most recent anomaly */
    if (lastAnomalyX > 40) {
      const label = '▲ ' + (t('monitor.flag') || 'ANOMALY');
      ctx.font = '600 9px "JetBrains Mono", monospace';
      const tw = ctx.measureText(label).width;
      let lx = Math.min(lastAnomalyX + 6, W - tw - 10);
      ctx.fillStyle = PALETTE.flag;
      ctx.fillText(label, lx, 14);
    }

    /* live head dot */
    if (points.length > 1) {
      const hx = (points.length - 1) * 2;
      const hy = mid - points[points.length - 1].v * amp;
      ctx.beginPath();
      ctx.arc(hx, hy, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = points[points.length - 1].anomaly ? PALETTE.anom : PALETTE.trace;
      ctx.fill();
    }
  }

  function loop() {
    points.push(nextValue());
    const capacity = Math.ceil(W / 2) + 2;
    while (points.length > capacity) points.shift();
    draw();
    rafId = window.requestAnimationFrame(loop);
  }
  function start() { if (rafId === null && !reducedMotion && inView && !document.hidden) rafId = window.requestAnimationFrame(loop); }
  function stop()  { if (rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; } }

  resize();

  /* prefill so the strip is never empty on first paint */
  const prefill = Math.ceil(W / 2) + 2;
  for (let i = 0; i < prefill; i++) points.push(nextValue());
  draw();

  window.addEventListener('sy-theme', draw);

  if (!reducedMotion) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        inView = entries[0] ? entries[0].isIntersecting : true;
        if (inView) start(); else stop();
      }, { threshold: 0.05 }).observe(canvas);
    }
    start();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => { resize(); draw(); }, 150);
  });
})();

/* ─────────────────────────────────────────
   8. READING PROGRESS BAR
───────────────────────────────────────── */
(function progressBar() {
  const bar = $('#progress-bar');
  if (!bar) return;
  let tick = false;
  function update() {
    tick = false;
    const doc = document.documentElement;
    const max = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const pct = Math.min(Math.max(window.scrollY / max, 0), 1) * 100;
    bar.style.width = pct.toFixed(2) + '%';
  }
  window.addEventListener('scroll', () => {
    if (!tick) { tick = true; window.requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();