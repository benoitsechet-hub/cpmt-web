// ── i18n — Translation system ────────────────────────────────────────────────
const LANG_KEY = 'cpmt_lang';
let TRANS = {};

export function getLang() {
  return localStorage.getItem(LANG_KEY) || 'fr';
}

export function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  location.reload();
}

export async function loadTranslations() {
  const lang = getLang();
  const res = await fetch(`./translations/${lang}.json`);
  TRANS = await res.json();
  applyTranslations();
}

export function t(key, params = {}) {
  let text = TRANS[key] || key;
  Object.entries(params).forEach(([k, v]) => {
    text = text.replace(`{${k}}`, v);
  });
  return text;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
}
