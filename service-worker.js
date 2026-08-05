const CACHE_NAME = 'sj-games-v1.0.0';
const ASSETS = [
  '/sj-games/',
  '/sj-games/index.html',
  '/sj-games/style.css',
  '/sj-games/app.js',
  '/sj-games/firebase.js',
  '/sj-games/manifest.json',
  '/sj-games/assets/icons/icon-48.png',
  '/sj-games/assets/icons/icon-72.png',
  '/sj-games/assets/icons/icon-96.png',
  '/sj-games/assets/icons/icon-128.png',
  '/sj-games/assets/icons/icon-144.png',
  '/sj-games/assets/icons/icon-152.png',
  '/sj-games/assets/icons/icon-192.png',
  '/sj-games/assets/icons/icon-256.png',
  '/sj-games/assets/icons/icon-384.png',
  '/sj-games/assets/icons/icon-512.png',
  '/sj-games/assets/icons/favicon.ico',
  '/sj-games/assets/icons/favicon-32.png',
  '/sj-games/assets/icons/favicon-16.png',
  '/sj-games/assets/icons/apple-touch-icon.png',
  '/sj-games/assets/icons/maskable-icon.png',
  '/sj-games/assets/icons/logo.svg',
  '/sj-games/assets/sounds/win.mp3',
  '/sj-games/assets/sounds/click.mp3',
  '/sj-games/assets/sounds/correct.mp3',
  '/sj-games/assets/sounds/wrong.mp3',
  '/sj-games/assets/sounds/notification.mp3'
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching assets...');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) {
          return cached;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseClone);
              });
            return response;
          })
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match('/sj-games/index.html');
            }
          });
      })
  );
});
