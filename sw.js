// ── Service Worker — offline cache ───────────────────────────────────────────
const CACHE = 'cpmt-v1';
const ASSETS = [
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
  './img/logo_WH.png',
  './img/flag_fr.svg',
  './img/flag_en.svg',
  'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
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

// Network first, fallback to cache
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
