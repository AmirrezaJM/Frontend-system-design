import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

/**
 * 🏠 Origin Server
 * 
 * This server acts as the "origin" that the CDN fetches from.
 * In production, this could be an S3 bucket, another web server, etc.
 * 
 * It serves static files with proper cache headers that instruct
 * the CDN on how to cache content.
 */

// Serve static files with cache headers
app.use(express.static('.', {
    etag: true,
    lastModified: true,
    setHeaders: (res, filepath) => {
        // Tell CDN to cache for 1 year
        res.set('Cache-Control', 'public, max-age=31536000');
        res.set('X-Served-By', 'Origin Server');

        console.log(`[Origin] Serving: ${path.basename(filepath)}`);
    }
}));

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║  🏠 Origin Server Running                            ║
║                                                       ║
║  Port:          ${PORT}                                   ║
║  Serving:       Static files (HTML/CSS/JS)           ║
║                                                       ║
║  This is the origin that the CDN fetches from.       ║
╚═══════════════════════════════════════════════════════╝
  `);
});
