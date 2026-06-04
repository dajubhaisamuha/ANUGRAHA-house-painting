const CACHE = 'anugraha-v4.6';
const ASSETS = [
  '/ANUGRAHA-house-painting/',
  '/ANUGRAHA-house-painting/index.html',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Mukta:wght@400;500;600;700;800&family=Yatra+One&display=swap'
];

// Install - cache assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate - clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', e => {
  // Skip Firebase requests - always need network
  if (e.request.url.includes('firestore') || 
      e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis.com/identitytoolkit')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful responses
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
