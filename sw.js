// FollowPro Service Worker
// Provides offline support and caching for PWA

const CACHE_NAME = 'followpro-v1';
const CACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  // Google Fonts
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap',
  // CDN scripts
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js',
];

// Install: cache all core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing FollowPro v1...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      // Cache local files strictly, CDN files with fallback
      const localFiles = ['./', './index.html', './manifest.json'];
      const cdnFiles = CACHE_URLS.filter(u => u.startsWith('https://'));
      
      return cache.addAll(localFiles).then(() => {
        // Cache CDN files individually, ignore failures
        return Promise.allSettled(
          cdnFiles.map(url =>
            fetch(url, { mode: 'cors' })
              .then(res => cache.put(url, res))
              .catch(() => console.log('[SW] CDN cache miss (ok):', url))
          )
        );
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Removing old cache:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for app shell, network-first for everything else
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // For app shell (HTML, manifest, CDN libs) — cache first
  const isAppShell = url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.json') ||
    url.hostname === 'cdnjs.cloudflare.com' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com';

  if (isAppShell) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        }).catch(() => {
          // Offline fallback for HTML
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
    );
    return;
  }

  // For everything else — network first, cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Background sync placeholder for future use
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-followups') {
    console.log('[SW] Background sync triggered');
  }
});

// Push notifications placeholder
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  self.registration.showNotification(data.title || 'FollowPro Reminder', {
    body: data.body || 'You have a follow-up scheduled.',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    tag: 'followpro-reminder',
    renotify: true,
    data: { url: './' }
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      if (clientList.length > 0) return clientList[0].focus();
      return clients.openWindow('./');
    })
  );
});
