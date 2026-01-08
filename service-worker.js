const CACHE_NAME = "liralink-v5";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./logo.jpg",
  "./logo2.jpg",
  "./icon-192.png",
  "./icon-512.png"
  // لاحظ: لا نُجبر الآن على إضافة موارد خارجية (مثل CDN) إلى addAll
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      // محاولة إضافة الموارد المحلية. إذا فشل أي مورد سيُلتقط الاستثناء
      await cache.addAll(urlsToCache);
    } catch (err) {
      // إذا فشل أي إضافة (مثلاً مشاكل CORS أو موارد غير موجودة)، سجّل لكن أكمل التثبيت
      console.warn("Service Worker: some resources failed to cache during install:", err);
      // حاول إضافة كل مورد على حدة كحالة احتياطية
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (e) {
          console.warn("Failed to cache", url, e);
        }
      }
    }
    // قم بالـ skipWaiting فقط إن رغبت أن يفعل الـ SW مباشرةً
    // self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  // تنظيف الكاشات القديمة إن وجدت
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => {
      if (key !== CACHE_NAME) return caches.delete(key);
    }));
    // clients.claim() لجعل الـ SW يتولى الصفحات المفتوحة فوراً
    // self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // إذا موجود في الكاش، أعده، وإلا اجلب من الشبكة
      return response || fetch(event.request).catch(err => {
        // طلب الشبكة فشل، حاول إرجاع ملف افتراضي من الكاش (اختياري)
        return caches.match('./index.html');
      });
    })
  );
});
