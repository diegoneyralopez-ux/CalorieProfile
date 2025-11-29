// A simple service worker for caching the app shell for offline use.

const CACHE_NAME = 'calorie-profile-v1';

// List all essential files that make up the app shell.
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/components/Dashboard.tsx',
  '/components/Loggers.tsx',
  '/components/MealHistory.tsx',
  '/components/Onboarding.tsx',
  '/components/ProfileSettings.tsx',
  '/components/UIComponents.tsx',
  '/services/geminiService.ts'
  // NOTE: You would also add your icon files here, e.g., '/icon-192.png', '/icon-512.png'
];

// Event: install
// This is the perfect time to cache our app shell.
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: App shell cached successfully');
        return self.skipWaiting(); // Activate the new service worker immediately
      })
  );
});

// Event: activate
// This event is used to clean up old caches.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim(); // Take control of all open clients
    })
  );
});


// Event: fetch
// Intercept network requests and serve from cache if available (cache-first strategy).
self.addEventListener('fetch', event => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If we have a match in the cache, return it.
        if (response) {
          // console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }

        // console.log('Service Worker: Fetching from network:', event.request.url);
        // If no match, fetch from the network.
        return fetch(event.request).then(networkResponse => {
            // Optional: You could cache dynamic requests here if you wanted,
            // but for a simple app shell cache, we'll skip that.
            return networkResponse;
        });
      })
      .catch(error => {
        // This is a fallback for when both cache and network fail.
        // You could return a custom offline page here.
        console.error('Service Worker: Fetch failed:', error);
        // For now, just rethrow the error.
        throw error;
      })
  );
});