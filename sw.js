// FollowPro Service Worker v3
// BUMP VERSION on every deploy to force cache refresh for all users
const VERSION    = 'followpro-v3';
const CACHE_NAME = VERSION;

const SHELL_URLS = ['./', './index.html', './manifest.json'];

const CDN_URLS = [
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js',
];

// ── Install ──────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing', VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await cache.addAll(SHELL_URLS);
      await Promise.allSettled(CDN_URLS.map(url =>
        fetch(url, { mode:'cors', credentials:'omit' })
          .then(res => { if(res.ok) cache.put(url, res); })
          .catch(() => {})
      ));
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: wipe all old caches ──────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating', VERSION);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ───────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);
  const isShell =
    url.pathname.endsWith('.html') || url.pathname.endsWith('.json') ||
    url.hostname === 'cdnjs.cloudflare.com' ||
    url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if(isShell) {
    event.respondWith(
      caches.match(request).then(cached => {
        if(cached) return cached;
        return fetch(request).then(res => {
          if(res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return res;
        }).catch(() =>
          request.headers.get('accept')?.includes('text/html') ? caches.match('./index.html') : undefined
        );
      })
    );
    return;
  }
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

// ── Notification scheduling via postMessage ─────────────────────────────
// App sends: { type:'SCHEDULE_NOTIFICATIONS', followups:[...] }
let scheduledFollowups = [];
const firedTags = new Set();

self.addEventListener('message', event => {
  if(event.data?.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduledFollowups = event.data.followups || [];
    firedTags.clear();
    scheduleAll();
  }
});

function todayStr() { return new Date().toISOString().split('T')[0]; }

function scheduleAll() {
  const now   = new Date();
  const today = todayStr();
  scheduledFollowups.forEach(f => {
    if(!f.scheduleTime || f.scheduleDate !== today) return;
    const tag = `fu-${f.id}`;
    if(firedTags.has(tag)) return;
    const [h, m] = f.scheduleTime.split(':').map(Number);
    const fireAt = new Date(); fireAt.setHours(h, m, 0, 0);
    const delay  = fireAt - now;
    if(delay < -60000 || delay > 86400000) return; // past or too far
    firedTags.add(tag);
    setTimeout(() => fireNotif(f, tag), Math.max(0, delay));
  });
}

function fireNotif(f, tag) {
  self.registration.showNotification(`📞 Follow up: ${f.name}`, {
    body:     (f.interested ? f.interested + ' · ' : '') + (f.note || 'Time to call!'),
    icon:     './icons/icon-192.png',
    badge:    './icons/icon-192.png',
    tag,
    renotify: true,
    vibrate:  [200, 100, 200],
    data:     { url:'./', id:f.id, phone:f.phone },
    actions:  [{ action:'call', title:'📞 Call Now' }, { action:'done', title:'✅ Mark Done' }],
  });
}

// ── Notification click ──────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const { action } = event;
  const { phone, url } = event.notification.data || {};
  if(action === 'call' && phone) {
    event.waitUntil(clients.openWindow('tel:' + phone)); return;
  }
  event.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
      if(list.length > 0) return list[0].focus();
      return clients.openWindow(url || './');
    })
  );
});

self.addEventListener('sync', event => {
  if(event.tag === 'sync-followups') console.log('[SW] background sync');
});
