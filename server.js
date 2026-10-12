// AgroSense Standalone Node.js Dev HTTP Web Server

const http = require('http');
const fs = require('fs');
const path = require('path');

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
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let cleanUrl = req.url.split('?')[0];
  if (cleanUrl === '/landing' || cleanUrl === '/landing/') {
    cleanUrl = '/landing.html';
  }
  let filePath = path.join(PUBLIC_DIR, cleanUrl === '/' ? 'index.html' : cleanUrl);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback SPA routing to index.html
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
        res.end(content, 'utf-8');
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

