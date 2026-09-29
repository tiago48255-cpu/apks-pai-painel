const CACHE = 'meus-negocios-v4';
const ASSETS = [
  'index.html?v=4', 'web/style.css?v=4', 'web/panel.js?v=4', 'web/apps.json?v=4', 'web/manifest.webmanifest?v=4',
  'web/assets/icon.svg', 'web/assets/icon-192.png', 'web/assets/icon-512.png', 'web/assets/rc-logo.png',
  'apps/rc-servicos/web/index.html', 'apps/rc-servicos/web/app.css?v=4',
  'apps/rc-servicos/web/brand-assets.js?v=4', 'apps/rc-servicos/web/app.js?v=4', 'apps/rc-servicos/web/improvements.js?v=4',
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
