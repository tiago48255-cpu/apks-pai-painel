const CACHE = 'meus-negocios-v3';
const ASSETS = [
  'index.html', 'web/style.css', 'web/panel.js', 'web/apps.json', 'web/manifest.webmanifest',
  'web/assets/icon.svg', 'web/assets/icon-192.png', 'web/assets/icon-512.png', 'web/assets/rc-logo.png',
  'apps/rc-servicos/web/index.html', 'apps/rc-servicos/web/app.css',
  'apps/rc-servicos/web/brand-assets.js', 'apps/rc-servicos/web/app.js', 'apps/rc-servicos/web/improvements.js',
  'apps/rc-servicos/web/assets/logo.jpg', 'apps/rc-servicos/web/assets/logo.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
    return response;
  }).catch(() => caches.match(event.request)));
});
