// ── Service Worker — offline cache ───────────────────────────────────────────
// IMPORTANT: bump CACHE version on every deployment to force cache refresh.
// Format: 'cpmt-YYYY-MM-DD' — update the date when deploying changes.
const CACHE = 'cpmt-2026-05-21';

// Core app assets — required for offline use
const CORE_ASSETS = [
  './',
  './index.html',
  './summary.html',
  './setup.html',
  './lineup.html',
  './css/style.css',
  './js/i18n.js',
  './js/state.js',
  './js/utils.js',
  './js/excel.js',
  './js/nav.js',
  './translations/fr.json',
  './translations/en.json',
  './defaults.json',
  './manifest.json',
  './CPMT_template.xlsx',
  './docs/CPMT_tutoriel.pdf',
  './img/logo_WH.png',
  './img/flag_fr.svg',
  './img/flag_en.svg',
];

// Optional CDN assets — cached opportunistically, not blocking install
const CDN_ASSETS = [
  'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(async cache => {
      // Cache core assets (fail fast if any missing)
      await cache.addAll(CORE_ASSETS);
      // Cache CDN assets individually — don't block install on CDN failure
      await Promise.allSettled(
        CDN_ASSETS.map(url =>
          fetch(url).then(res => cache.put(url, res)).catch(() => {})
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network first, fallback to cache; cache put wrapped properly
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        // Use waitUntil-equivalent: cache update does not block response
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
