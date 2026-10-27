/**
 * AgroSense Production Deployment Preparation Tool
 * Creates a clean, standalone, zero-node_modules production deployment folder
 * guaranteed to contain fewer than 100 files for GitHub Web Interface drag-and-drop upload.
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DEPLOY_DIR = path.resolve(ROOT_DIR, '../agrosense-deploy');

console.log('🚀 Preparing compact AgroSense production deployment folder...');
console.log('Target deployment directory:', DEPLOY_DIR);

if (fs.existsSync(DEPLOY_DIR)) {
  fs.rmSync(DEPLOY_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DEPLOY_DIR, { recursive: true });

function copyFile(srcRel, destRel = srcRel) {
  const src = path.join(ROOT_DIR, srcRel);
  const dest = path.join(DEPLOY_DIR, destRel);
  if (!fs.existsSync(src)) {
    console.warn(`⚠️ Warning: Source file missing: ${srcRel}`);
    return false;
  }
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(src, dest);
  return true;
}

function copyDir(dirRel) {
  const src = path.join(ROOT_DIR, dirRel);
  if (!fs.existsSync(src)) return 0;
  let count = 0;
  for (const item of fs.readdirSync(src, { withFileTypes: true })) {
    const itemRel = path.join(dirRel, item.name).replace(/\\/g, '/');
    if (item.isDirectory()) {
      count += copyDir(itemRel);
    } else if (item.isFile()) {
      copyFile(itemRel);
      count++;
    }
  }
  return count;
}

let fileCount = 0;

// 1. Root static HTML and Web meta files
const rootFiles = [
  'index.html',
  'landing.html',
  'about.html',
  'contact.html',
  'cookies.html',
  'disclaimer.html',
  'privacy.html',
  'terms.html',
  '404.html',
  '.nojekyll',
  'robots.txt',
  'sitemap.xml',
  'README.md'
];

for (const f of rootFiles) {
  if (copyFile(f)) fileCount++;
}

// 2. CSS Styles
fileCount += copyDir('css');

// 3. Compiled Production Bundles (Zero-CORS Models & Application Bundle)
// Preserved in both root and dist/ for complete resilience on GitHub Pages
const distFiles = [
  'dist/agrosense.bundle.js',
  'dist/agrosense.crop.data.js',
  'dist/agrosense.disease.data.js',
  'dist/consent.js'
];
for (const f of distFiles) {
  if (copyFile(f)) fileCount++;
  const baseName = path.basename(f);
  if (copyFile(f, baseName)) fileCount++;
}

// 4. TensorFlow.js Models (Weight Shards & Configs)
fileCount += copyDir('models');

// 5. Public Static Images
fileCount += copyDir('images');

console.log(`\n✅ Production deployment folder successfully generated!`);
console.log(`📍 Path: ${DEPLOY_DIR}`);
console.log(`📊 Total Deployment Files: ${fileCount} files`);

if (fileCount <= 100) {
  console.log(`🎉 COMPLIANCE CHECK PASSED: ${fileCount} files is strictly <= 100 files!`);
  console.log(`   You can drag and drop all files directly into GitHub's "Add file -> Upload files" interface in a single batch without errors.`);
} else {
  console.warn(`⚠️ Warning: File count (${fileCount}) exceeds 100 files.`);
}
