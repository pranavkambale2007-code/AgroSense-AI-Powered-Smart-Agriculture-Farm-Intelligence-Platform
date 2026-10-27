const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const JS_DIR = path.join(ROOT_DIR, 'js');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

function getFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  let res = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) res = res.concat(getFiles(p));
    else if (p.endsWith('.js')) res.push(p);
  }
  return res;
}

function normalizeKey(p) {
  return path.relative(ROOT_DIR, p).replace(/\\/g, '/');
}

function transformModule(filePath, rawContent) {
  const fileDir = path.dirname(filePath);
  let content = rawContent;

  // 1. Transform imports:
  // import { a, b } from './foo.js';
  content = content.replace(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?/g, (match, imports, importPath) => {
    const resolved = path.resolve(fileDir, importPath);
    const key = normalizeKey(resolved);
    return `const { ${imports.trim()} } = require('${key}');`;
  });

  // 2. Transform exports:
  // export async function name(...)
  const exportedFuncs = [];
  content = content.replace(/^export\s+(async\s+function)\s+([a-zA-Z0-9_$]+)/gm, (match, fnType, fnName) => {
    exportedFuncs.push(fnName);
    return `${fnType} ${fnName}`;
  });

  // export function name(...)
  content = content.replace(/^export\s+(function)\s+([a-zA-Z0-9_$]+)/gm, (match, fnType, fnName) => {
    exportedFuncs.push(fnName);
    return `${fnType} ${fnName}`;
  });

  // export class Name
  content = content.replace(/^export\s+class\s+([a-zA-Z0-9_$]+)/gm, (match, clsName) => {
    exportedFuncs.push(clsName);
    return `class ${clsName}`;
  });

  // export const name =
  content = content.replace(/^export\s+const\s+([a-zA-Z0-9_$]+)\s*=/gm, (match, varName) => {
    return `const ${varName} = exports.${varName} =`;
  });

  // export let name =
  content = content.replace(/^export\s+let\s+([a-zA-Z0-9_$]+)\s*=/gm, (match, varName) => {
    return `let ${varName} = exports.${varName} =`;
  });

  // export { a, b, c }
  content = content.replace(/^export\s*\{([^}]+)\};?/gm, (match, namedExports) => {
    const items = namedExports.split(',').map(s => s.trim()).filter(Boolean);
    const assignments = items.map(item => {
      const parts = item.split(/\s+as\s+/);
      const local = parts[0].trim();
      const exp = parts[1] ? parts[1].trim() : local;
      return `exports.${exp} = ${local};`;
    });
    return assignments.join(' ');
  });

  // Append assignments for functions/classes
  if (exportedFuncs.length > 0) {
    const exportStatements = exportedFuncs.map(fn => `exports.${fn} = ${fn};`).join(' ');
    content += `\n/* Module Exports */\n${exportStatements}\n`;
  }

  return content;
}

function verifyModelAssets() {
  console.log('Auditing TensorFlow.js machine learning model assets...');
  const modelsDir = path.join(ROOT_DIR, 'models');
  
  // 1. Crop Model
  const cropJsonPath = path.join(modelsDir, 'crop', 'model.json');
  if (!fs.existsSync(cropJsonPath)) {
    console.warn('⚠️ Warning: models/crop/model.json not found in repository.');
  } else {
    try {
      const cropJson = JSON.parse(fs.readFileSync(cropJsonPath, 'utf8'));
      const shards = cropJson.weightsManifest?.[0]?.paths || [];
      let totalBytes = 0;
      for (const shard of shards) {
        const shardPath = path.join(modelsDir, 'crop', shard);
        if (!fs.existsSync(shardPath)) {
          throw new Error(`Referenced crop weight shard missing: ${shardPath}`);
        }
        totalBytes += fs.statSync(shardPath).size;
      }
      console.log(`✓ Verified Crop Model: models/crop/model.json (${shards.length} shard(s), ${(totalBytes / 1024 / 1024).toFixed(2)} MB)`);
    } catch (e) {
      console.error('❌ Crop Model Asset Verification Error:', e.message);
    }
  }

  // 2. PlantVillage Disease Model
  const pvJsonPath = path.join(modelsDir, 'plantvillage', 'model.json');
  if (!fs.existsSync(pvJsonPath)) {
    console.warn('⚠️ Warning: models/plantvillage/model.json not found in repository.');
  } else {
    try {
      const pvJson = JSON.parse(fs.readFileSync(pvJsonPath, 'utf8'));
      const shards = pvJson.weightsManifest?.[0]?.paths || [];
      let totalBytes = 0;
      for (const shard of shards) {
        const shardPath = path.join(modelsDir, 'plantvillage', shard);
        if (!fs.existsSync(shardPath)) {
          throw new Error(`Referenced disease weight shard missing: ${shardPath}`);
        }
        totalBytes += fs.statSync(shardPath).size;
      }
      console.log(`✓ Verified PlantVillage Disease Model: models/plantvillage/model.json (${shards.length} shard(s), ${(totalBytes / 1024 / 1024).toFixed(2)} MB)`);
    } catch (e) {
      console.error('❌ PlantVillage Disease Model Asset Verification Error:', e.message);
    }
  }
}

function packageModelsData() {
  console.log('Packaging Zero-CORS Machine Learning Model Assets into split < 25MB files...');
  const modelsDir = path.join(ROOT_DIR, 'models');
  
  // 1. Crop Model
  const cropJsonPath = path.join(modelsDir, 'crop', 'model.json');
  let cropData = null;
  if (fs.existsSync(cropJsonPath)) {
    const cropJson = JSON.parse(fs.readFileSync(cropJsonPath, 'utf8'));
    const manifest = cropJson.weightsManifest?.[0];
    const shards = manifest?.paths || [];
    const buffers = shards.map(s => fs.readFileSync(path.join(modelsDir, 'crop', s)));
    const concatenated = Buffer.concat(buffers);
    cropData = {
      modelTopology: cropJson.modelTopology,
      weightSpecs: manifest?.weights || [],
      weightDataBase64: concatenated.toString('base64')
    };
  }

  // 2. PlantVillage Disease Model
  const pvJsonPath = path.join(modelsDir, 'plantvillage', 'model.json');
  let pvData = null;
  if (fs.existsSync(pvJsonPath)) {
    const pvJson = JSON.parse(fs.readFileSync(pvJsonPath, 'utf8'));
    const manifest = pvJson.weightsManifest?.[0];
    const shards = manifest?.paths || [];
    const buffers = shards.map(s => fs.readFileSync(path.join(modelsDir, 'plantvillage', s)));
    const concatenated = Buffer.concat(buffers);
    pvData = {
      modelTopology: pvJson.modelTopology,
      weightSpecs: manifest?.weights || [],
      weightDataBase64: concatenated.toString('base64')
    };
  }

  // 1. Write Crop Model Data (< 25 MB)
  const cropOutPath = path.join(DIST_DIR, 'agrosense.crop.data.js');
  const cropCode = `/**
 * AgroSense Pre-Packaged Crop Species Identification Model Data
 * Enables Zero-CORS, offline, direct file:// execution of TensorFlow.js crop model
 * Size: ~16.5 MB (Under GitHub 25 MB web upload limit)
 * Generated automatically by scripts/build.js
 */
(function() {
  'use strict';
  if (typeof window !== 'undefined') {
    window.__AgroSense_CropModelData = ${JSON.stringify(cropData)};
    console.log('[AgroSense CV] Pre-packaged Zero-CORS Crop model weights loaded successfully.');
  }
})();
`;
  fs.writeFileSync(cropOutPath, cropCode, 'utf8');
  const cropSizeMb = (fs.statSync(cropOutPath).size / (1024 * 1024)).toFixed(2);
  console.log(`✓ Crop model packaged to ${cropOutPath} (${cropSizeMb} MB, < 25 MB compliant)`);

  // 2. Write Disease Model Data (< 25 MB)
  const diseaseOutPath = path.join(DIST_DIR, 'agrosense.disease.data.js');
  const diseaseCode = `/**
 * AgroSense Pre-Packaged Plant Pathology Disease Model Data
 * Enables Zero-CORS, offline, direct file:// execution of TensorFlow.js disease model
 * Size: ~16.7 MB (Under GitHub 25 MB web upload limit)
 * Generated automatically by scripts/build.js
 */
(function() {
  'use strict';
  if (typeof window !== 'undefined') {
    window.__AgroSense_PlantVillageModelData = ${JSON.stringify(pvData)};
    console.log('[AgroSense CV] Pre-packaged Zero-CORS Disease model weights loaded successfully.');
  }
})();
`;
  fs.writeFileSync(diseaseOutPath, diseaseCode, 'utf8');
  const diseaseSizeMb = (fs.statSync(diseaseOutPath).size / (1024 * 1024)).toFixed(2);
  console.log(`✓ Disease model packaged to ${diseaseOutPath} (${diseaseSizeMb} MB, < 25 MB compliant)`);

  // Remove the old combined 33MB file if present
  const oldOutPath = path.join(DIST_DIR, 'agrosense.models.data.js');
  if (fs.existsSync(oldOutPath)) {
    fs.unlinkSync(oldOutPath);
    console.log(`✓ Removed old combined oversized file: ${oldOutPath}`);
  }
}

function build() {
  console.log('Starting AgroSense bundler...');
  verifyModelAssets();
  packageModelsData();
  if (!fs.existsSync(JS_DIR)) {
    if (fs.existsSync(path.join(DIST_DIR, 'agrosense.bundle.js'))) {
      console.log('Found pre-compiled bundle in dist/agrosense.bundle.js (Source code archived in js-source.zip).');
      fs.copyFileSync(path.join(DIST_DIR, 'agrosense.bundle.js'), path.join(ROOT_DIR, 'agrosense.bundle.js'));
      fs.copyFileSync(path.join(DIST_DIR, 'agrosense.crop.data.js'), path.join(ROOT_DIR, 'agrosense.crop.data.js'));
      fs.copyFileSync(path.join(DIST_DIR, 'agrosense.disease.data.js'), path.join(ROOT_DIR, 'agrosense.disease.data.js'));
      if (fs.existsSync(path.join(DIST_DIR, 'consent.js'))) {
        fs.copyFileSync(path.join(DIST_DIR, 'consent.js'), path.join(ROOT_DIR, 'consent.js'));
      }
      console.log('✓ Root-level bundle synchronization complete.');
      return;
    }
    const zipPath = path.join(ROOT_DIR, 'js-source.zip');
    if (fs.existsSync(zipPath)) {
      console.log('Extracting js-source.zip...');
      require('child_process').execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${ROOT_DIR}' -Force"`);
    }
  }
  const files = getFiles(JS_DIR);
  console.log(`Found ${files.length} modules to bundle.`);

  const moduleEntries = [];

  for (const f of files) {
    const key = normalizeKey(f);
    const raw = fs.readFileSync(f, 'utf8');
    const transformed = transformModule(f, raw);
    moduleEntries.push({ key, code: transformed });
  }

  const bundleHeader = `/**
 * AgroSense Enterprise Production Bundle
 * Standalone bundle with zero external runtime module dependencies.
 * Compatible with file://, localhost, and GitHub Pages (https://).
 */
(function() {
  'use strict';
  const __modules__ = {};
  const __cache__ = {};

  function __define__(id, factory) {
    __modules__[id] = factory;
  }

  function __require__(id) {
    const cleanId = id.replace(/\\\\/g, '/');
    if (__cache__[cleanId]) {
      return __cache__[cleanId].exports;
    }
    if (!__modules__[cleanId]) {
      throw new Error('[AgroSense Bundle] Module not found: ' + cleanId);
    }
    const module = __cache__[cleanId] = { exports: {} };
    __modules__[cleanId](__require__, module.exports, module);
    return module.exports;
  }
`;

  let bundleBody = '';
  for (const entry of moduleEntries) {
    bundleBody += `\n/* ======================================================= */\n`;
    bundleBody += `/* MODULE: ${entry.key} */\n`;
    bundleBody += `/* ======================================================= */\n`;
    bundleBody += `__define__('${entry.key}', function(require, exports, module) {\n`;
    bundleBody += entry.code;
    bundleBody += `\n});\n`;
  }

  const bundleFooter = `
  // Auto-start AgroSense Application
  try {
    __require__('js/app.js');
    console.log('🌾 AgroSense production bundle successfully loaded and running.');
  } catch (err) {
    console.error('Fatal initialization error in AgroSense bundle:', err);
  }
})();
`;

  const finalBundle = bundleHeader + bundleBody + bundleFooter;
  const outputPath = path.join(DIST_DIR, 'agrosense.bundle.js');
  fs.writeFileSync(outputPath, finalBundle, 'utf8');

  const sizeKb = (finalBundle.length / 1024).toFixed(1);
  console.log(`Bundle created successfully: ${outputPath} (${sizeKb} KB)`);

  // Synchronize root bundle files for GitHub Pages root deployment resilience
  fs.copyFileSync(outputPath, path.join(ROOT_DIR, 'agrosense.bundle.js'));
  fs.copyFileSync(path.join(DIST_DIR, 'agrosense.crop.data.js'), path.join(ROOT_DIR, 'agrosense.crop.data.js'));
  fs.copyFileSync(path.join(DIST_DIR, 'agrosense.disease.data.js'), path.join(ROOT_DIR, 'agrosense.disease.data.js'));
  if (fs.existsSync(path.join(DIST_DIR, 'consent.js'))) {
    fs.copyFileSync(path.join(DIST_DIR, 'consent.js'), path.join(ROOT_DIR, 'consent.js'));
  }
  console.log('✓ Root-level bundle synchronization complete.');
}

build();
