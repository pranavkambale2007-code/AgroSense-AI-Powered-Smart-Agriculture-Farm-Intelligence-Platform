// AgroSense Standalone Node.js Dev HTTP Web Server

const http = require('http');
const fs = require('fs');
const path = require('path');
const { analyzeFarmSatelliteHealth, invalidateFarmCache } = require('./backend/satelliteEngine.js');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// Keep production bundle updated on startup
try {
  require('./scripts/build.js');
} catch (e) {
  console.log('[Bundle Check] Loaded existing bundle.');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.bin': 'application/octet-stream',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // CORS headers for local/cross-origin development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // REST API Endpoints: Real-time Sentinel-2 Satellite Intelligence
  if (pathname === '/api/satellite/analysis' && req.method === 'GET') {
    try {
      const farmId = urlObj.searchParams.get('farmId') || 'default-farm';
      const lat = parseFloat(urlObj.searchParams.get('lat')) || 18.5204;
      const lng = parseFloat(urlObj.searchParams.get('lng')) || 73.8567;
      const crop = urlObj.searchParams.get('crop') || 'Wheat';
      const name = urlObj.searchParams.get('name') || 'Farm Plot';
      const sizeAcres = parseFloat(urlObj.searchParams.get('sizeAcres')) || 5.0;
      const forceRefresh = urlObj.searchParams.get('refresh') === 'true';

      let boundaryPolygon = [];
      const boundaryParam = urlObj.searchParams.get('boundary');
      if (boundaryParam) {
        try {
          boundaryPolygon = JSON.parse(boundaryParam);
        } catch (e) {}
      }

      const farm = {
        id: farmId,
        name,
        crop,
        geoCoords: { lat, lng },
        boundaryPolygon,
        sizeAcres
      };

      const analysis = await analyzeFarmSatelliteHealth(farm, { forceRefresh });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(analysis));
      return;
    } catch (err) {
      console.error('Satellite API analysis error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || 'Satellite analysis failed' }));
      return;
    }
  }

  if (pathname === '/api/satellite/refresh' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = body ? JSON.parse(body) : {};
        const farmId = payload.farmId || 'default-farm';
        invalidateFarmCache(farmId);

        const farm = {
          id: farmId,
          name: payload.name || 'Farm Plot',
          crop: payload.crop || 'Wheat',
          geoCoords: payload.geoCoords || { lat: payload.lat || 18.5204, lng: payload.lng || 73.8567 },
          boundaryPolygon: payload.boundaryPolygon || [],
          sizeAcres: payload.sizeAcres || 5.0
        };

        const analysis = await analyzeFarmSatelliteHealth(farm, { forceRefresh: true });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(analysis));
      } catch (err) {
        console.error('Satellite API refresh error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Refresh failed' }));
      }
    });
    return;
  }

  if (pathname === '/api/satellite/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      provider: 'Copernicus Sentinel-2 Level-2A (via Element84 AWS Open Data)',
      resolutionMeters: 10,
      bands: ['B02 (Blue)', 'B03 (Green)', 'B04 (Red)', 'B08 (NIR)', 'B11 (SWIR)', 'SCL (Scene Classification)'],
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Static File Serving
  let cleanUrl = pathname;
  if (cleanUrl === '/landing' || cleanUrl === '/landing/') {
    cleanUrl = '/landing.html';
  }
  let filePath = path.join(PUBLIC_DIR, cleanUrl === '/' ? 'index.html' : cleanUrl);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If the request was for an asset (e.g. models, images, scripts, styles), return explicit 404
      const reqExt = path.extname(cleanUrl).toLowerCase();
      if (cleanUrl.startsWith('/models/') || cleanUrl.startsWith('/dist/') || cleanUrl.startsWith('/images/') || ['.bin', '.json', '.js', '.css', '.png', '.jpg', '.jpeg'].includes(reqExt)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Asset not found', path: cleanUrl }));
        return;
      }
      // Otherwise, fallback SPA routing to index.html
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🌾 AGROSENSE ENTERPRISE AGRONOMY PLATFORM v2.5.4`);
  console.log(`📡 Local Web Service: http://localhost:${PORT}`);
  console.log(`🌱 46-Crop Procedural Botanical Engine: Loaded`);
  console.log(`📊 ML Agronomic Diagnostic Pipeline: Initialized`);
  console.log(`====================================================`);
});

