const CACHE_NAME = 'neuroimaging-dashboard-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/static/js/main.js',
    '/static/css/main.css',
    '/manifest.json',
    '/favicon.ico',
    '/logo192.png',
    '/logo512.png',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
];

const API_CACHE_NAME = 'api-cache-v1';
const API_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return (
                                cacheName.startsWith('neuroimaging-dashboard-') &&
                                cacheName !== CACHE_NAME
                            );
                        })
                        .map((cacheName) => caches.delete(cacheName))
                );
            }),
            self.clients.claim(),
        ])
    );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
        return;
    }

    // Handle static assets
    event.respondWith(
        caches.match(request).then((response) => {
            return response || fetchAndCache(request);
        })
    );
});

// Handle API requests with caching strategy
async function handleApiRequest(request) {
    // Try to fetch fresh data
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(API_CACHE_NAME);
            cache.put(request, response.clone());
            return response;
        }
    } catch (error) {
        console.error('Error fetching API data:', error);
    }

    // If fetch fails, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        // Check if cache is still valid
        const cachedTime = new Date(cachedResponse.headers.get('cache-time'));
        if (Date.now() - cachedTime.getTime() < API_CACHE_DURATION) {
            return cachedResponse;
        }
    }

    // If no cache or expired, return offline response
    return new Response(
        JSON.stringify({
            error: 'You are offline and no cached data is available.',
        }),
        {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
        }
    );
}

// Fetch and cache function for static assets
async function fetchAndCache(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('Error fetching and caching:', error);
        throw error;
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-scans') {
        event.waitUntil(syncScans());
    }
});

// Handle push notifications
self.addEventListener('push', (event) => {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url,
        },
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

// Sync scans function
async function syncScans() {
    const cache = await caches.open('offline-scans');
    const keys = await cache.keys();
    
    return Promise.all(
        keys.map(async (request) => {
            try {
                const response = await fetch(request);
                if (response.ok) {
                    await cache.delete(request);
                }
                return response;
            } catch (error) {
                console.error('Error syncing scan:', error);
                return null;
            }
        })
    );
}

// Periodic background sync for data updates
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-data') {
        event.waitUntil(updateData());
    }
});

// Update data function
async function updateData() {
    try {
        const cache = await caches.open(API_CACHE_NAME);
        const requests = await cache.keys();
        
        await Promise.all(
            requests.map(async (request) => {
                try {
                    const response = await fetch(request);
                    if (response.ok) {
                        await cache.put(request, response);
                    }
                } catch (error) {
                    console.error('Error updating cached data:', error);
                }
            })
        );
    } catch (error) {
        console.error('Error in updateData:', error);
    }
}

// Handle errors
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

// Handle unhandled rejections
self.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection in Service Worker:', event.reason);
}); 