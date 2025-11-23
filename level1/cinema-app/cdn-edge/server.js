import express from "express";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 9000;

// Configuration
const ORIGIN_SERVER = process.env.ORIGIN_SERVER || "http://localhost:8080";
const API_SERVER = process.env.API_SERVER || "http://localhost:3000";

/**
 * 🌐 CDN Edge Server Simulation
 * 
 * This server simulates a CDN edge server (like Cloudflare, CloudFront, Fastly).
 * 
 * Key behaviors:
 * - Caches static assets (HTML, CSS, JS, images)
 * - Proxies API requests directly to backend (no caching)
 * - Adds cache headers (X-Cache: HIT/MISS)
 * - Implements TTL-based cache expiration
 * - Generates ETags for cache validation
 */

// In-memory cache storage (simulates edge server cache)
const edgeCache = new Map();

// Cache statistics
const cacheStats = {
    hits: 0,
    misses: 0,
    requests: 0,
    cachedItems: 0
};

/**
 * Generate ETag from content
 */
function generateETag(content) {
    return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Check if content type should be cached
 */
function isCacheable(url, contentType) {
    // Don't cache API requests
    if (url.startsWith('/api/')) return false;

    // Cache static assets
    const cacheableTypes = [
        'text/html',
        'text/css',
        'application/javascript',
        'image/',
        'font/'
    ];

    return cacheableTypes.some(type => contentType?.startsWith(type));
}

/**
 * Cache middleware - simulates CDN edge caching
 */
app.use(async (req, res, next) => {
    cacheStats.requests++;

    // API requests bypass cache and go directly to API server
    if (req.url.startsWith('/api/')) {
        console.log(`[CDN Edge] API request - proxying to ${API_SERVER}${req.url}`);

        try {
            const apiResponse = await fetch(`${API_SERVER}${req.url}`, {
                method: req.method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
            });

            const data = await apiResponse.json();
            res.set('X-Cache', 'BYPASS');
            res.set('X-Cache-Reason', 'Dynamic API request');
            return res.json(data);
        } catch (error) {
            console.error('[CDN Edge] API proxy error:', error.message);
            return res.status(502).json({ error: 'Bad Gateway - API server unavailable' });
        }
    }

    const cacheKey = req.url || '/';
    const cachedItem = edgeCache.get(cacheKey);

    // Check cache - simulate edge server cache lookup
    if (cachedItem && Date.now() < cachedItem.expiresAt) {
        cacheStats.hits++;
        console.log(`[CDN Edge] ✅ CACHE HIT: ${cacheKey}`);

        // Serve from cache with cache headers
        res.set({
            'Content-Type': cachedItem.contentType,
            'Cache-Control': 'public, max-age=31536000',
            'ETag': cachedItem.etag,
            'X-Cache': 'HIT',
            'X-Cache-Key': cacheKey,
            'X-Served-From': 'CDN Edge Server'
        });

        return res.send(cachedItem.content);
    }

    // Cache MISS - fetch from origin server
    cacheStats.misses++;
    console.log(`[CDN Edge] ❌ CACHE MISS: ${cacheKey} - fetching from origin`);

    try {
        const originUrl = `${ORIGIN_SERVER}${cacheKey}`;
        const originResponse = await fetch(originUrl);

        if (!originResponse.ok) {
            throw new Error(`Origin server returned ${originResponse.status}`);
        }

        const contentType = originResponse.headers.get('content-type');
        const content = await originResponse.text();
        const etag = generateETag(content);

        // Cache the response if it's cacheable
        if (isCacheable(cacheKey, contentType)) {
            const ttl = 60 * 60 * 1000; // 1 hour cache TTL
            edgeCache.set(cacheKey, {
                content,
                contentType,
                etag,
                expiresAt: Date.now() + ttl,
                cachedAt: new Date().toISOString()
            });
            cacheStats.cachedItems = edgeCache.size;
            console.log(`[CDN Edge] 💾 Cached: ${cacheKey} (TTL: 1 hour)`);
        }

        // Return with cache MISS header
        res.set({
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000',
            'ETag': etag,
            'X-Cache': 'MISS',
            'X-Cache-Key': cacheKey,
            'X-Served-From': 'Origin Server (via CDN)'
        });

        res.send(content);
    } catch (error) {
        console.error('[CDN Edge] Origin fetch error:', error.message);
        res.status(502).send(`
      <html>
        <body style="font-family: system-ui; padding: 2rem; background: #0b0c10; color: #f5f5f5;">
          <h1>502 Bad Gateway</h1>
          <p>CDN Edge Server could not reach the origin server.</p>
          <p>Error: ${error.message}</p>
          <p><a href="/" style="color: #66d9ef;">Try again</a></p>
        </body>
      </html>
    `);
    }
});

// Cache statistics endpoint
app.get('/__cache-stats', (req, res) => {
    const hitRate = cacheStats.requests > 0
        ? ((cacheStats.hits / cacheStats.requests) * 100).toFixed(2)
        : 0;

    res.json({
        ...cacheStats,
        hitRate: `${hitRate}%`,
        cache: Array.from(edgeCache.entries()).map(([key, value]) => ({
            url: key,
            size: value.content.length,
            contentType: value.contentType,
            cachedAt: value.cachedAt,
            expiresAt: new Date(value.expiresAt).toISOString()
        }))
    });
});

// Cache invalidation endpoint (for demonstration)
app.post('/__cache-purge', (req, res) => {
    const cleared = edgeCache.size;
    edgeCache.clear();
    cacheStats.cachedItems = 0;
    console.log(`[CDN Edge] 🗑️  Cache purged: ${cleared} items cleared`);
    res.json({ message: `Cache purged successfully. ${cleared} items cleared.` });
});

app.listen(PORT, () => {
    console.log(`CDN Edge server simulating edge caching behavior.
   Static assets will be cached, API requests will be proxied.
  `);
});
