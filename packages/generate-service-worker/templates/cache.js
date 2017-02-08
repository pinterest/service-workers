/*
 * AUTOGENERATED FROM GENERATE-SERVICE-WORKER
 * Injected Global: $Cache
 */

/*         -------- CACHE CONSTANTS ---------         */

const CACHE_VERSION = 1;
const CURRENT_CACHE = `prefetch-${CACHE_VERSION}`;

const inRange = (start, end) => value => value >= start && value < end;

/*         -------- CACHE LISTENERS ---------         */

self.addEventListener('install', handleInstall);
self.addEventListener('activate', handleActivate);
if ($Cache.precache || $Cache.strategy) {
  self.addEventListener('fetch', handleFetch);
}

/*         -------- CACHE HANDLERS ---------         */

function handleInstall(event) {
  logger.log('Entering install handler.', event);
  if ($Cache.prefetch) {
    event.waitUntil(prefetch()
      .then(() => clients.claim()));
  } else {
    event.waitUntil(self.skipWaiting());
  }
}

function handleActivate(event) {
  logger.log('Entering activate handler.', event);
  const cachesCleared = caches.keys().then(cacheNames => {
    return Promise.all(cacheNames.map(cacheName => {
      if (cacheName !== CURRENT_CACHE) {
        logger.log('Deleting out of date cache:', cacheName);
        return caches.delete(cacheName);
      }
      return Promise.resolve();
    }));
  });
  event.waitUntil(cachesCleared);
}

function handleFetch(event) {
  logger.log('Entering fetch handler.', event);
  if (event.request.method === 'GET') {
    const strategy = getStrategyForUrl(event.request.url);
    if (strategy) {
      logger.log('Using strategy: ', strategy);
      event.respondWith(applyEventStrategy(strategy, event));
    }
  }
}

/*         -------- CACHE HELPERS ---------         */

function applyEventStrategy(strategy, event) {
  const request = event.request;
  switch (strategy.type) {
    case 'offline-only':
      return fetchAndCache(request)().catch(getFromCache(request));
    case 'fallback-only':
      return fetchAndCache(request)().then(fallbackToCache(request));
    case 'prefer-cache':
      return getFromCache(request)().catch(fetchAndCache(request));
    case 'race':
      return getFromFastest(request)();
    default:
      return Promise.reject(`Strategy not supported: ${strategy.type}`);
  }
}

function insertInCache(request, response) {
  logger.log(`Inserting data in cache for ${request.url}.`, response);
  return caches.open(CURRENT_CACHE)
    .then(cache => cache.put(request, response));
}

function getFromCache(request) {
  return () => {
    logger.log(`Retrieving cache entry for ${request.url}.`);
    return caches.open(CURRENT_CACHE).then(cache => {
      return cache.match(request).then(response => {
        if (response) {
          return response;
        }
        throw new Error(`No cache entry found for ${request.url}`);
      });
    });
  };
}

function getStrategyForUrl() {
  // if ($Cache.strategy) {
  //
  // }
  return null;
}

/*         -------- CACHE STRATEGIES ---------         */

function fetchAndCache(request) {
  return () => {
    logger.log(`Fetching cacheable response for ${request.url}.`);
    return fetch(request.clone()).then(_response => {
      const response = _response.clone();
      if (inRange(200, 400)(response.status)) {
        insertInCache(request, response);
      }
      return response;
    });
  };
}

function fallbackToCache(request) {
  return (response) => {
    if (!inRange(200, 400)(response.status)) {
      return getFromCache(request)();
    }
    return response;
  };
}

function getFromFastest(request) {
  return () => new Promise((resolve, reject) => {
    var errors = 0;

    function raceReject() {
      errors += 1;
      if (errors === 2) {
        reject(new Error('Network and cache both failed.'));
      }
    }

    function raceResolve(response) {
      if (response instanceof Response) {
        resolve(response);
      } else {
        raceReject();
      }
    }

    getFromCache(request)()
      .then(raceResolve, raceReject);

    fetchAndCache(request)()
      .then(raceResolve, raceReject);
  });
}

function prefetch() {
  return caches.open(CURRENT_CACHE).then(cache => {
    return $Cache.precache.map(urlToPrefetch => {
      const cacheBustedUrl = new URL(urlToPrefetch, location.href);
      cacheBustedUrl.search += (cacheBustedUrl.search ? '&' : '?') + `cache-bust=${Date.now()}`;

      const request = new Request(cacheBustedUrl, { mode: 'no-cors' });
      return fetch(request).then(response => {
        if (!inRange(200, 400)(response.status)) {
          logger.error(`Prefetch failed for ${urlToPrefetch}.`);
          return undefined;
        }
        return cache.put(urlToPrefetch, response);
      });
    }).then(() => logger.log('Prefetch complete'));
  });
}

// Export functions on the server for testing
if (typeof __TEST_MODE__ !== 'undefined') {
  module.exports = {
    handleInstall: handleInstall,
    handleActivate: handleActivate,
    handleFetch: handleFetch,
    applyEventStrategy: applyEventStrategy,
    getStrategyForUrl: getStrategyForUrl,
    insertInCache: insertInCache,
    getFromCache: getFromCache,
    fetchAndCache: fetchAndCache,
    fallbackToCache: fallbackToCache,
    getFromFastest: getFromFastest,
    prefetch: prefetch
  };
}
