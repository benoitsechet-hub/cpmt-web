// ── Navigation — renders header + injects translations ───────────────────────
import { t, getLang, setLang } from './i18n.js';
import { getState } from './state.js';

export function renderNav(step) {
  const lang      = getLang();
  const hasTeams  = !!(getState('teams')?.length);
  const hasSetup  = !!(getState('match_setup') && getState('competition_setup'));

  const steps = [
    { n:1, key:'step_load',  href:'./index.html',   enabled:true },
    { n:2, key:'step_teams', href:'./summary.html',  enabled:true },
    { n:3, key:'step_setup', href:'./setup.html',    enabled:hasTeams },
    { n:4, key:'step_match', href:'./lineup.html',   enabled:hasSetup },
  ];

  const stepsHtml = steps.map((s, i) => {
    const active   = s.n === step ? 'active' : '';
    const disabled = !s.enabled   ? 'disabled' : '';
    const href     = s.enabled ? s.href : '#';
    const arrow    = i < steps.length - 1 ? '<span class="step-arrow">›</span>' : '';
    return `
      <a href="${href}" class="step ${active} ${disabled}">
        <span class="step-num">${s.n}</span>
        <span class="step-label">${t(s.key)}</span>
      </a>${arrow}`;
  }).join('');

  const header = document.getElementById('app-header');
  header.innerHTML = `
    <div class="header-inner">
      <div class="header-brand">
        <img src="./img/logo_WH.png" alt="${t('nav_logo_alt')}" class="header-logo"
             onerror="this.style.display='none';document.getElementById('logo-fallback').style.display='flex'">
        <div class="header-logo-fallback" id="logo-fallback" style="display:none;">FFHB</div>
        <div class="header-divider"></div>
        <div class="header-title">
          <span class="header-org">${t('app_subtitle')}</span>
          <span class="header-app">${t('app_title')}</span>
        </div>
      </div>
      <a href="./docs/CPMT_tutoriel.pdf" class="tutorial-btn" target="_blank"
         rel="noopener" title="${t('nav_guide_btn')}">
        ${t('nav_guide_btn')}
      </a>
      <div class="lang-toggle">
        <a href="#" class="lang-btn ${lang==='fr'?'active':''}" onclick="window.__setLang('fr');return false;">
          <img src="./img/flag_fr.svg" class="lang-flag" alt="FR">FR
        </a>
        <a href="#" class="lang-btn ${lang==='en'?'active':''}" onclick="window.__setLang('en');return false;">
          <img src="./img/flag_en.svg" class="lang-flag" alt="EN">EN
        </a>
      </div>
      <nav class="header-steps">${stepsHtml}</nav>
    </div>`;

  // Expose setLang globally for inline onclick
  window.__setLang = setLang;

  // Update document lang attribute
  document.documentElement.lang = lang;
}
