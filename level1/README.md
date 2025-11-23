# Level 1 – CDN Edge Caching Architecture

![Level 1 diagram](../docs/level1.png)

This level demonstrates **true Level 1 architecture with CDN edge caching**. A CDN edge server sits between users and your origin servers, caching static assets globally for faster delivery. This is the first real scaling step for frontend applications.

## Level 1 Architecture - Three Layers

**The layers:**

1. **CDN Edge Server (Port 9000)**: Simulates a CDN edge server (like Cloudflare, CloudFront, Fastly)
   - Caches static assets (HTML, CSS, JS, images)
   - Serves cached content on cache HIT (instant delivery)
   - Fetches from origin on cache MISS (first request)
   - Proxies API requests (no caching for dynamic data)
   - Adds cache headers (X-Cache: HIT/MISS, ETag, Cache-Control)

2. **Origin Server (Port 8080)**: Serves the original static files
   - Contains the actual HTML/CSS/JS files
   - CDN fetches from here on cache MISS
   - Sets cache headers instructing CDN behavior

3. **API Server (Port 3000)**: Handles dynamic data
   - Business logic and database operations
   - Bypasses CDN cache (always fresh data)
   - CORS-enabled for cross-origin requests

## How CDN Edge Caching Works

### Request Flow - Static Assets

```
User → CDN Edge Server
        ├── Cache HIT? → Serve instantly (X-Cache: HIT) ✅
        └── Cache MISS? → Fetch from Origin → Cache → Serve (X-Cache: MISS) ⚠️
```

### Request Flow - API Calls

```
User → CDN Edge Server → API Server → Database
       (proxies through,  (dynamic data)
        no caching)
```

## Level 1 in Practice

**What makes this Level 1:**

- ✅ **CDN edge caching** - Static assets cached at edge servers
- ✅ **Geographic distribution** - Edge servers closer to users (simulated)
- ✅ **Reduced origin load** - Cache serves most requests
- ✅ **Cache headers** - ETag, Cache-Control, X-Cache
- ✅ **TTL-based expiration** - Cached items expire after 1 hour
- ✅ **Cache invalidation** - API endpoint to purge cache

**Pros:**

- **Lower latency globally**: Static content served from nearest edge server
- **Reduced origin server load**: Most traffic handled by CDN cache
- **Better traffic spike handling**: CDN absorbs traffic surges
- **Improved Core Web Vitals**: Faster LCP and TTFB
- **Cost reduction**: Less bandwidth on origin server

**Cons:**

- **Cache invalidation complexity**: Must purge cache on deployments
- **White screen still possible**: Client-side rendering means JS must download/execute
- **Additional configuration**: Need to set cache headers correctly
- **Not ideal for highly dynamic content**: Personalized content can't be cached

## Observing Cache Behavior

The demo includes **real-time cache statistics** displayed on the page:

- **Requests**: Total requests to CDN edge
- **Hits**: Requests served from cache
- **Misses**: Requests fetched from origin
- **Hit Rate**: Percentage of cached responses
- **Cached Items**: Number of items in cache

**Try this:**
1. Load the page (first time) → See **Cache MISS** for static files
2. Reload the page → See **Cache HIT** - much faster!
3. Check Network tab in DevTools for `X-Cache: HIT/MISS` headers

## Project Structure

```
level1/cinema-app/
├── cdn-edge/              # 🌐 CDN Edge Server
│   ├── server.js          # Cache simulation + proxying
│   └── package.json
├── web/                   # 🏠 Origin Server (static files)
│   ├── server.js          # Serves static files with cache headers
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── package.json
└── api/                   # 🔧 API Server (dynamic data)
    ├── server.js          # Express API with CORS
    └── package.json
```

## Running the Cinema App Locally

You need to run **three separate servers** to see Level 1 in action:

### 1. Start the API Server

```bash
cd level1/cinema-app/api
npm install
npm start
```

The API will run at `http://localhost:3000`

### 2. Start the Origin Server

In a **new terminal window**:

```bash
cd level1/cinema-app/web
npm install
npm start
```

The origin will run at `http://localhost:8080`

### 3. Start the CDN Edge Server

In a **third terminal window**:

```bash
cd level1/cinema-app/cdn-edge
npm install
npm start
```

The CDN edge will run at `http://localhost:9000`

### 4. Open the App

Visit `http://localhost:9000` (CDN edge URL) in your browser.

**Do NOT visit port 8080 or 3000 directly** - users always access through the CDN edge server in Level 1 architecture.

## Testing Cache Behavior

### Check Cache Headers

```bash
# First request - should be MISS
curl -I http://localhost:9000/

# Second request - should be HIT
curl -I http://localhost:9000/
```

Look for:
- `X-Cache: HIT` or `X-Cache: MISS`
- `ETag: "abc123..."`
- `Cache-Control: public, max-age=31536000`

### View Cache Statistics

```bash
curl http://localhost:9000/__cache-stats
```

Returns JSON with hits, misses, hit rate, and cached items.

### Purge Cache

```bash
curl -X POST http://localhost:9000/__cache-purge
```

Clears all cached items - useful when deploying new versions.

## Cache Headers Explained

### Cache-Control
```http
Cache-Control: public, max-age=31536000
```
- `public`: Can be cached by CDN
- `max-age=31536000`: Cache for 1 year (31536000 seconds)

### ETag
```http
ETag: "abc123..."
```
Hash of file content - used for cache validation

### X-Cache (Custom)
```http
X-Cache: HIT
X-Cache-Key: /app.js
X-Served-From: CDN Edge Server
```
Shows whether response came from cache or origin

## Deployment Suggestions

**CDN Edge (Simulated locally here):**
In production, use real CDN providers:
- **Cloudflare**: Global edge network, free tier available
- **AWS CloudFront**: Integrates with S3/origins
- **Fastly**: Advanced caching controls
- **Netlify/Vercel**: Built-in CDN for static sites

**Origin Server (Static Files):**
- **AWS S3**: Static file hosting
- **Netlify/Vercel**: Automatic deployments with CDN
- **GitHub Pages**: Free for public repos
- **Your own server**: Any web server (Nginx, Apache)

**API Server:**
- **Railway/Render**: Easy Node.js deployment
- **AWS Elastic Beanstalk**: Managed platform
- **DigitalOcean**: App Platform with databases

## When to Use Level 1

**Move to Level 1 when:**

- ✅ Users are geographically distributed
- ✅ Origin server is struggling with traffic
- ✅ Static asset delivery is slow
- ✅ You want to reduce bandwidth costs
- ✅ Core Web Vitals need improvement

**Stay at Level 0 if:**

- ❌ All users in single region
- ❌ Traffic is very low
- ❌ Simplicity is priority
- ❌ Still validating product-market fit

## Limitations & Next Steps

### White Screen of Death Still Exists

Level 1 uses client-side rendering. Users see blank page until:
1. HTML downloads (✅ fast with CDN)
2. CSS downloads (✅ fast with CDN)  
3. JS downloads (✅ fast with CDN)
4. **JS executes and renders** ⚠️ (can still be slow)

**Solution**: Level 2 with Server-Side Rendering (SSR)

### Cache Invalidation Challenge

When you deploy new code:
- Old versions might still be in CDN cache
- Users might see stale content

**Solutions**:
- Asset fingerprinting (`app.abc123.js`)
- Cache purging API calls
- Short TTL for HTML, long TTL for assets

### Not Suitable for Highly Dynamic Content

If most content is personalized or real-time:
- Can't cache effectively
- CDN benefit is limited

**Solution**: Selective caching + incremental static regeneration (Level 3+)

## Moving Beyond Level 1

Consider Level 2 when you need:
- Server-side rendering for SEO
- Reduced white screen problem
- Complex state management
- Better initial page load performance
- Social media preview cards

Level 2 adds SSR frameworks like Next.js, Nuxt, or SvelteKit.
