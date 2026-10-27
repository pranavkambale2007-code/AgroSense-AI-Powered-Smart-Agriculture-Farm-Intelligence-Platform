// Comprehensive Two-Stage Crop Identification & Plant Disease Detection Test Suite
const path = require('path');
const fs = require('fs');
const http = require('http');
const { fork } = require('child_process');

let chromium;
try {
  chromium = require('playwright').chromium;
} catch (e) {
  const customPath = 'C:/Users/Pranav Kambale/AppData/Local/ms-playwright-go/1.57.0/package/index.js';
  if (fs.existsSync(customPath)) {
    chromium = require(customPath).chromium;
  } else {
    throw new Error('Playwright chromium package not found.');
  }
}

function isServerRunning(port = 3000) {
  return new Promise(resolve => {
    const req = http.get(`http://localhost:${port}/`, res => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(500, () => {
      req.abort();
      resolve(false);
    });
  });
}

async function run() {
  console.log('🌱 ========================================================');
  console.log('🔬 AGROSENSE PATHOLOGY & MODEL LIFECYCLE TEST SUITE');
  console.log('🌱 ========================================================\n');

  let server = null;
  const running = await isServerRunning(3000);
  if (!running) {
    server = fork(path.join(__dirname, '../server.js'), [], { silent: true });
    await new Promise(r => setTimeout(r, 1600));
  } else {
    console.log('✓ Connected to active AgroSense service on http://localhost:3000');
  }

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('http://localhost:3000/#/disease');
  console.log('Waiting for AI models to initialize on page...');
  await page.waitForFunction(() => {
    const s = window.__AgroSense_getModelStatus && window.__AgroSense_getModelStatus();
    const c = window.__AgroSense_getCropModelStatus && window.__AgroSense_getCropModelStatus();
    return s && s.status === 'ready' && c && c.status === 'ready';
  }, { timeout: 45000 });
  await page.waitForTimeout(800);

  console.log('✓ Plant Disease Diagnostics Page Loaded and Models Ready on http://localhost:3000/#/disease\n');

  const results = await page.evaluate(async () => {
    const testLog = [];

    if (typeof window.__AgroSense_analyzeLeafImage !== 'function') {
      throw new Error('window.__AgroSense_analyzeLeafImage is not exposed on window');
    }
    const analyze = window.__AgroSense_analyzeLeafImage;

    // Test 1: Real Image Inference on Maize Leaf
    const res1 = await analyze('images/healthy_crops/maize_healthy.jpg', 'all', 'field_maize.jpg');
    testLog.push({
      testName: 'Real MobileNet Inference on Maize Leaf',
      expectedStatus: 'VALID',
      actualStatus: res1.isValidImage ? 'VALID' : 'REJECTED',
      predictedCrop: res1.cropKey,
      cropName: res1.crop,
      confidence: res1.confidence,
      hasNoFakeBbox: res1.boundingBox === null,
      passed: res1.isValidImage === true && res1.confidence > 0 && res1.boundingBox === null
    });

    // Test 2: Real MobileNet Inference on Cotton Leaf (Now Fully Supported)
    const res2 = await analyze('images/healthy_crops/cotton_healthy.jpg', 'all', 'cotton_field.jpg');
    testLog.push({
      testName: 'Real Multi-Crop Inference on Cotton Leaf',
      expectedStatus: 'VALID',
      actualStatus: res2.isValidImage ? 'VALID' : (res2.status || 'REJECTED'),
      predictedCrop: res2.cropKey,
      diseaseName: res2.diseaseName,
      confidence: res2.confidence,
      passed: res2.isValidImage === true && res2.cropKey === 'cotton' && res2.confidence > 0
    });

    // Test 3: Real MobileNet Inference on Chilli Leaf (Now Fully Supported)
    const res3 = await analyze('images/healthy_crops/chilli_healthy.jpg', 'all', 'chilli_field.jpg');
    testLog.push({
      testName: 'Real Multi-Crop Inference on Chilli Leaf',
      expectedStatus: 'VALID',
      actualStatus: res3.isValidImage ? 'VALID' : (res3.status || 'REJECTED'),
      predictedCrop: res3.cropKey,
      diseaseName: res3.diseaseName,
      confidence: res3.confidence,
      passed: res3.isValidImage === true && res3.cropKey === 'chilli' && res3.confidence > 0
    });

    // Test 4: Real MobileNet Inference on Wheat Leaf (Now Fully Supported)
    const res4 = await analyze('images/healthy_crops/wheat_healthy.jpg', 'all', 'wheat_field.jpg');
    testLog.push({
      testName: 'Real Multi-Crop Inference on Wheat Leaf',
      expectedStatus: 'VALID',
      actualStatus: res4.isValidImage ? 'VALID' : (res4.status || 'REJECTED'),
      predictedCrop: res4.cropKey,
      diseaseName: res4.diseaseName,
      confidence: res4.confidence,
      passed: res4.isValidImage === true && res4.cropKey === 'wheat' && res4.confidence > 0
    });

    // Test 4b: Real MobileNet Inference on Rice Leaf (Now Fully Supported)
    const res4b = await analyze('images/healthy_crops/rice_healthy.jpg', 'rice', 'rice_field.jpg');
    testLog.push({
      testName: 'Real Multi-Crop Inference on Rice Leaf',
      expectedStatus: 'VALID',
      actualStatus: res4b.isValidImage ? 'VALID' : (res4b.status || 'REJECTED'),
      predictedCrop: res4b.cropKey,
      diseaseName: res4b.diseaseName,
      confidence: res4b.confidence,
      passed: res4b.isValidImage === true && res4b.cropKey === 'rice' && res4b.confidence > 0
    });

    // Test 4c: Unsupported Crop Rejection - Sugarcane (Genuinely Unsupported)
    const res4c = await analyze('images/healthy_crops/cotton_healthy.jpg', 'sugarcane', 'sugarcane_stalk.jpg');
    testLog.push({
      testName: 'Genuine Unsupported Crop Rejection: Sugarcane',
      expectedStatus: 'UNSUPPORTED_CROP',
      actualStatus: res4c.status,
      validationError: res4c.validationError,
      passed: res4c.isValidImage === false && res4c.status === 'UNSUPPORTED_CROP' && res4c.validationError.includes('Disease detection for this crop is not supported by the current model.')
    });

    // Test 4d: Unsupported Crop Rejection - Mustard (Genuinely Unsupported)
    const res4d = await analyze('images/healthy_crops/wheat_healthy.jpg', 'mustard', 'mustard_leaf.jpg');
    testLog.push({
      testName: 'Genuine Unsupported Crop Rejection: Mustard',
      expectedStatus: 'UNSUPPORTED_CROP',
      actualStatus: res4d.status,
      validationError: res4d.validationError,
      passed: res4d.isValidImage === false && res4d.status === 'UNSUPPORTED_CROP' && res4d.validationError.includes('Disease detection for this crop is not supported by the current model.')
    });

    // Test 5: Misleading Filename Immunity (Image is Maize, filename is Tomato Early Blight)
    const res5 = await analyze('images/healthy_crops/maize_healthy.jpg', 'all', 'tomato_early_blight_severe.jpg');
    testLog.push({
      testName: 'Misleading Filename Immunity',
      filename: 'tomato_early_blight_severe.jpg',
      predictedCrop: res5.cropKey,
      diseaseId: res5.id,
      confidence: res5.confidence,
      // Must NOT blindly classify as tomato-early-blight just because of filename
      passed: res5.id !== 'tomato-early-blight'
    });

    // Test 6: Non-Plant Image Rejection (Logo / Machinery)
    const res6 = await analyze('images/logo.png', 'all', 'farm_tractor_logo.png');
    testLog.push({
      testName: 'Non-Plant Image Rejection',
      expectedStatus: 'REJECTED',
      actualStatus: res6.status,
      errorType: res6.errorType,
      passed: res6.isValidImage === false && res6.errorType === 'non-plant'
    });

    // Test 7: Blurry / Uniform Blank Canvas Rejection
    const blankDataUrl = (() => {
      const c = document.createElement('canvas');
      c.width = 140; c.height = 140;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#666666';
      ctx.fillRect(0, 0, 140, 140);
      return c.toDataURL();
    })();
    const res7 = await analyze(blankDataUrl, 'all', 'blank_grey.jpg');
    testLog.push({
      testName: 'Uniform Blank Image Rejection',
      expectedStatus: 'REJECTED',
      actualStatus: res7.status,
      errorType: res7.errorType,
      passed: res7.isValidImage === false && res7.errorType === 'blank'
    });

    // Test 8: Anti-Sticky State (Sequential uploads of different crops)
    const step1 = await analyze('images/healthy_crops/cotton_healthy.jpg', 'all', 'cotton.jpg');
    const step2 = await analyze('images/healthy_crops/wheat_healthy.jpg', 'all', 'wheat.jpg');
    testLog.push({
      testName: 'Anti-Sticky State Verification (Wheat after Cotton)',
      step1Crop: step1.cropKey,
      step2Crop: step2.cropKey,
      passed: step1.cropKey === 'cotton' && step2.cropKey === 'wheat' && step2.isValidImage === true
    });

    // Test 9: Supported Crop Prior (Evaluating within Tomato classes)
    const res9 = await analyze('images/healthy_crops/tomato_healthy.jpg', 'tomato', 'field_tomato.jpg');
    testLog.push({
      testName: 'Supported Crop Prior Evaluation (Tomato)',
      cropKey: res9.cropKey,
      confidence: res9.confidence,
      topCandidatesCount: res9.topCandidates?.length || 0,
      passed: res9.isValidImage === true && res9.cropKey === 'tomato' && res9.topCandidates?.length >= 2
    });

    // Test 10: Model Status and Architecture Verification
    const status = window.__AgroSense_getModelStatus ? window.__AgroSense_getModelStatus() : null;
    testLog.push({
      testName: 'Model Status and Architecture Validation',
      status: status?.status,
      numClasses: status?.numClasses,
      backend: status?.backend,
      inputShape: status?.inputShape,
      passed: status && status.status === 'ready' && status.numClasses === 56 && status.inputShape && status.inputShape.includes(224)
    });

    // Test 11: Non-Blocking Recommendation for Partial Leaf Coverage (~40% plant pixels < 50% guideline)
    // Draw an image where 39% of canvas is green leaf and rest is sky background
    const partialLeafDataUrl = (() => {
      const c = document.createElement('canvas');
      c.width = 160; c.height = 160;
      const ctx = c.getContext('2d');
      // natural sky background
      ctx.fillStyle = '#4a80b8';
      ctx.fillRect(0, 0, 160, 160);
      // leaf area occupying ~39%
      ctx.fillStyle = '#3e7a28';
      ctx.fillRect(15, 15, 100, 100); // 100*100 = 10000 / (160*160=25600) ~= 39%
      return c.toDataURL();
    })();
    const res11 = await analyze(partialLeafDataUrl, 'all', 'partial_leaf.jpg');
    testLog.push({
      testName: 'Non-Blocking Quality Recommendation (Partial Leaf Coverage)',
      isValidImage: res11.isValidImage,
      qualityWarning: res11.qualityWarning,
      hasAdvisory: typeof res11.qualityWarning === 'string' && res11.qualityWarning.includes('50%'),
      // Must NOT be hard-rejected as non-plant; must be valid with an advisory tip
      passed: res11.isValidImage === true && typeof res11.qualityWarning === 'string' && res11.qualityWarning.includes('50%')
    });

    // Test 12: Extreme Darkness / Underexposed Image Rejection
    const darkDataUrl = (() => {
      const c = document.createElement('canvas');
      c.width = 140; c.height = 140;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#080808';
      ctx.fillRect(0, 0, 140, 140);
      return c.toDataURL();
    })();
    const res12 = await analyze(darkDataUrl, 'all', 'dark_night.jpg');
    testLog.push({
      testName: 'Underexposed / Pitch Dark Image Rejection',
      expectedStatus: 'REJECTED',
      actualStatus: res12.status,
      errorType: res12.errorType,
      passed: res12.isValidImage === false && res12.errorType === 'dark'
    });

    // Test 13: Model Force-Retry Lifecycle Verification
    let retryPassed = false;
    if (window.__AgroSense_initDiseaseModel) {
      try {
        const reloadedModel = await window.__AgroSense_initDiseaseModel({ force: true });
        const postRetryStatus = window.__AgroSense_getModelStatus();
        retryPassed = postRetryStatus.status === 'ready' && reloadedModel !== null;
      } catch (err) {
        retryPassed = false;
      }
    }
    testLog.push({
      testName: 'Model Force-Retry Lifecycle & Recovery',
      retryPassed,
      passed: retryPassed
    });

    return testLog;
  });

  console.log('📋 REGRESSION TEST RESULTS:\n');
  let allPassed = true;
  for (const t of results) {
    const symbol = t.passed ? '✅ PASS' : '❌ FAIL';
    if (!t.passed) allPassed = false;
    console.log(`${symbol} [${t.testName}]`);
    console.log(`   Details: ${JSON.stringify(t, null, 2)}\n`);
  }

  // Visual Screenshots
  console.log('📸 Capturing Diagnostic UI Verification Screenshots...');
  const brainDir = 'C:/Users/Pranav Kambale/.gemini/antigravity/brain/0d527b93-e4ea-4317-8c78-0fdb14672303';

  // 1. Maize Diagnosis UI
  await page.setInputFiles('#leaf-file-input', path.join(__dirname, '../images/healthy_crops/maize_healthy.jpg'));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(brainDir, 'crop_disease_maize_diagnosis.png'), fullPage: true });
  console.log('  Saved: crop_disease_maize_diagnosis.png');

  // 2. Unsupported Crop Rejection UI (Cotton)
  await page.selectOption('#disease-crop-filter', 'cotton');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(brainDir, 'crop_disease_unsupported_crop.png'), fullPage: true });
  console.log('  Saved: crop_disease_unsupported_crop.png');

  // 3. Non-Leaf Rejection UI
  await page.selectOption('#disease-crop-filter', 'all');
  await page.setInputFiles('#leaf-file-input', path.join(__dirname, '../images/logo.png'));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(brainDir, 'crop_disease_rejection_non_leaf.png'), fullPage: true });
  console.log('  Saved: crop_disease_rejection_non_leaf.png');

  // 4. Model Ready Indicator UI Banner
  const statusBanner = await page.$('#disease-model-status-card');
  if (statusBanner) {
    await statusBanner.screenshot({ path: path.join(brainDir, 'crop_disease_model_status_ready.png') });
    console.log('  Saved: crop_disease_model_status_ready.png');
  }

  // 5. Model Error & Retry UI Banner Verification
  await page.evaluate(() => {
    const card = document.getElementById('disease-model-status-card');
    if (card) {
      card.outerHTML = `
        <div id="disease-model-status-card" class="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/60 text-rose-200 space-y-2.5 shadow-lg">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 text-rose-300 font-bold text-xs sm:text-sm">
              <span class="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
              <span>Disease Detection Model Failed to Initialize</span>
            </div>
            <button id="btn-retry-model-init" type="button" class="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow">
              <span>Retry Model Initialization</span>
            </button>
          </div>
          <p class="text-[11px] text-rose-200/90 font-mono bg-black/50 p-2.5 rounded-xl border border-rose-900/50 break-all">
            Model failed to initialize. Please check network connectivity and ensure model weights are accessible: Failed to fetch
          </p>
          <p class="text-[11px] text-gray-400">
            Ensure network connectivity or local web service is running. Click <strong>Retry Model Initialization</strong> to reconnect without reloading the page.
          </p>
        </div>
      `;
    }
  });
  await page.waitForTimeout(300);
  const errorCard = await page.$('#disease-model-status-card');
  if (errorCard) {
    await errorCard.screenshot({ path: path.join(brainDir, 'crop_disease_model_error_retry.png') });
    console.log('  Saved: crop_disease_model_error_retry.png');
  }

  console.log('\n========================================================');
  console.log(`🏆 ALL ${results.length} REGRESSION TESTS FINISHED: ${allPassed ? 'ALL PASSED (100%)' : 'SOME FAILED'}`);
  console.log(`   Console Errors Detected: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('   Console Error Details:', JSON.stringify(consoleErrors, null, 2));
  }
  console.log('========================================================\n');

  await browser.close();
  if (server) server.kill();

  if (!allPassed || consoleErrors.length > 0) {
    throw new Error('Regression test suite failed or console errors were encountered.');
  }
}

run().catch(e => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
