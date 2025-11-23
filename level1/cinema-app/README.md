# Cinema App - Level 1 with CDN Edge Caching

This demonstrates **true Level 1 frontend architecture** with a simulated CDN edge server that caches static assets.

## Architecture Overview - Three Layers

```
Browser
   ↓
🌐 CDN Edge Server (localhost:9000)
   ├─→ Cache HIT  → Instant delivery
   ├─→ Cache MISS → Fetch from Origin
   │
   ├─→ 🏠 Origin Server (localhost:8080) - Static files
   └─→ 🔧 API Server (localhost:3000) - Dynamic data
```

## Quick Start - Three Servers

### Prerequisites
- Node.js 16+ installed
- Three terminal windows

### Terminal 1: API Server

```bash
cd api
npm install
npm start
```

✅ API running at `http://localhost:3000`

### Terminal 2: Origin Server

```bash
cd web
npm install
npm start
```

✅ Origin running at `http://localhost:8080`

### Terminal 3: CDN Edge Server

```bash
cd cdn-edge
npm install  
npm start
```

✅ CDN Edge running at `http://localhost:9000`

### Access the App

Visit **`http://localhost:9000`** (the CDN edge URL)

⚠️ **Important**: Always access through port 9000, not 8080 or 3000 directly.

## What You'll See

### Real-Time Cache Statistics

The app displays live cache stats:
- **Requests**: Total CDN requests
- **Hits**: Served from cache (green)
- **Misses**: Fetched from origin (red)
- **Hit Rate**: % of cached responses
- **Cached Items**: Number in cache

### First Load (Cache MISS)
1. CDN has no cache
2. Fetches from Origin (port 8080)
3. Caches the response
4. Returns with `X-Cache: MISS`

### Reload (Cache HIT)
1. CDN finds cached version
2. Returns instantly
3. No origin server request
4. Returns with `X-Cache: HIT` ⚡

## Testing Cache Behavior

### Check Response Headers

```bash
# First request
curl -I http://localhost:9000/
# Look for: X-Cache: MISS

# Second request  
curl -I http://localhost:9000/
# Look for: X-Cache: HIT
```

### View Cache Statistics

```bash
curl http://localhost:9000/__cache-stats
```

Returns:
```json
{
  "requests": 10,
  "hits": 7,
  "misses": 3,
  "hitRate": "70.00%",
  "cachedItems": 3,
  "cache": [...]
}
```

### Purge Cache

```bash
curl -X POST http://localhost:9000/__cache-purge
```

Clears all cached items.

## Project Structure

```
cinema-app/
├── cdn-edge/              # 🌐 CDN Edge Server
│   ├── server.js          # Cache simulation + proxying
│   └── package.json       # Express dependency
│
├── web/                   # 🏠 Origin Server
│   ├── server.js          # Serves static files with headers
│   ├── index.html         # HTML (cached)
│   ├── app.js             # JavaScript (cached)
│   ├── styles.css         # CSS (cached)
│   └── package.json
│
└── api/                   # 🔧 API Server
    ├── server.js          # Dynamic data (not cached)
    └── package.json
```

## Key Features

### 🎯 CDN Edge Caching

- **In-memory cache** simulates edge server behavior
- **TTL-based expiration** (1 hour)
- **ETag generation** for cache validation
- **Cache statistics** tracking hits/misses

### 📊 Cache Headers

Every response includes:
```http
Cache-Control: public, max-age=31536000
ETag: "abc123..."
X-Cache: HIT
X-Cache-Key: /app.js
X-Served-From: CDN Edge Server
```

### 🔄 Smart Proxying

- **Static assets**: Cached by CDN
- **API requests**: Proxied directly (no cache)

### 📈 Real-Time Monitoring

- Live cache statistics display
- Auto-refresh every 3 seconds
- Hit rate visualization

## Understanding the Flow

### Static Asset Request (e.g., /app.js)

```
1. Browser → CDN Edge (9000)
2. CDN checks cache
   ├─ HIT: Return cached version ✅
   └─ MISS: Fetch from Origin (8080) → Cache → Return ⚠️
3. Browser receives file
```

### API Request (e.g., /api/movies)

```
1. Browser → CDN Edge (9000)
2. CDN proxies to API (3000) - NO CACHING
3. API → Database → Response
4. CDN → Browser (X-Cache: BYPASS)
```

## Deployment to Production

### Option 1: Real CDN (Recommended)

Replace simulated CDN with real providers:

**Frontend/Origin:**
- Deploy `web/` to Netlify/Vercel/Cloudflare Pages
- Automatic CDN edge distribution globally

**API:**
- Deploy `api/` to Railway/Render/AWS
- Configure CORS for your CDN domain

**Benefits:**
- Global edge network
- DDoS protection
- SSL/TLS certificates
- Analytics and monitoring

### Option 2: Custom CDN Setup

Use the simulation pattern on real infrastructure:

**CDN Edge:**
- Deploy `cdn-edge/` to edge locations (CloudFlare Workers, Lambda@Edge)
- Configure cache rules

**Origin:**
- S3 bucket or web server for static files

**API:**
- Standard backend deployment

## Environment Configuration

### Development
```javascript
// cdn-edge/server.js
ORIGIN_SERVER = "http://localhost:8080"
API_SERVER = "http://localhost:3000"

// web/index.html
window.API_BASE = "http://localhost:9000"
```

### Production
```javascript
// cdn-edge (or use real CDN)
ORIGIN_SERVER = "https://cdn.yourdomain.com"
API_SERVER = "https://api.yourdomain.com"

// web/index.html
window.API_BASE = "https://yourdomain.com"
```

## Troubleshooting

### "Failed to load movies"

✅ Check all three servers are running:
```bash
# Terminal 1
cd api && npm start

# Terminal 2  
cd web && npm start

# Terminal 3
cd cdn-edge && npm start
```

✅ Access via port 9000: `http://localhost:9000`

### Low Cache Hit Rate

This is normal on first load! Hit rate improves as you:
- Reload the page
- Navigate between pages
- Return to the site

### Cache Not Updating

If you modify static files but see old content:
```bash
curl -X POST http://localhost:9000/__cache-purge
```

In production, use asset fingerprinting (`app.v2.js`) or CDN purge APIs.

## Learn More

See the [Level 1 architecture guide](../../level1/README.md) for:
- Detailed CDN concepts
- Cache header explanations
- When to use Level 1
- Comparison with Level 0
- Migration to Level 2

## Next Steps

This Level 1 implementation demonstrates:
✅ CDN edge caching
✅ Cache hit/miss behavior  
✅ Origin fallback
✅ API proxying
✅ Performance benefits

Ready for Level 2? Add SSR to eliminate the white screen problem!
