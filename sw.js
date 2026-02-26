// Asli PWA Service Worker Engine 🚀
self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install Ho Gaya! 🔥');
});

self.addEventListener('fetch', (e) => {
    // Ye code browser ko batata hai ki humara app install hone ke layak hai
    e.respondWith(fetch(e.request).catch(() => console.log("Network Error")));
});
