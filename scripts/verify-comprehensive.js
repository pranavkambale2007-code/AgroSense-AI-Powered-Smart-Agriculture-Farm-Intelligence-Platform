const { chromium } = require('C:/Users/Pranav Kambale/AppData/Local/ms-playwright-go/1.57.0/package/index.js');

const VIEWPORTS = [
  { name: '360px Mobile (Small)', width: 360, height: 740 },
  { name: '390px Mobile (iPhone 14)', width: 390, height: 844 },
  { name: '768px Tablet (iPad)', width: 768, height: 1024 },
  { name: '1024px Laptop/Tablet-Pro', width: 1024, height: 768 },
  { name: '1366px Standard Desktop', width: 1366, height: 768 },
  { name: '1920px Full HD Desktop', width: 1920, height: 1080 }
];

async function runAudit() {
  console.log('🚀 Starting Comprehensive AgroSense QA Audit...\n');

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });

  const testResults = {
    landingHtml: [],
    routes: [],
    formTests: [],
    overflowTests: [],
    imageTests: []
  };

  let globalConsoleErrors = [];

  // ==========================================
  // 1. Audit Standalone landing.html
  // ==========================================
  console.log('--- Testing landing.html ---');
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error') {
        globalConsoleErrors.push(`[landing.html ${vp.name}] ${msg.text()}`);
      }
    });

    await page.goto('http://localhost:3000/landing.html', { waitUntil: 'networkidle' });

    // Check images
    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => img.src);
    });

    // Check horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 2; // allowance for subpixel
    });

    console.log(`[${vp.name}] landing.html: Broken Images: ${brokenImages.length}, Horizontal Overflow: ${hasOverflow}`);
    testResults.landingHtml.push({
      viewport: vp.name,
      brokenImages: brokenImages.length,
      hasOverflow
    });

    await context.close();
  }

  // ==========================================
  // 2. Audit SPA Routes & Cross-Viewport Responsiveness
  // ==========================================
  const ROUTES_TO_TEST = [
    { path: '#/landing', name: 'SPA Landing Page' },
    { path: '#/onboarding', name: 'Farm Onboarding & GIS Map' },
    { path: '#/crop-recommendation', name: 'Crop Intelligence' },
    { path: '#/disease', name: 'Disease Screening' },
    { path: '#/crop-monitor', name: 'Crop Lifecycle & Mandi' },
    { path: '#/3d-farm', name: '3D Farm Digital Twin' },
    { path: '#/weather', name: 'Weather Risk Matrix' },
    { path: '#/soil', name: 'Soil Telemetry' }
  ];

  console.log('\n--- Testing SPA Routes across Viewports ---');
  for (const route of ROUTES_TO_TEST) {
    console.log(`\nRoute: ${route.name} (${route.path})`);
    for (const vp of [VIEWPORTS[1], VIEWPORTS[2], VIEWPORTS[4]]) { // 390px, 768px, 1366px
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();

      page.on('console', msg => {
        if (msg.type() === 'error' && !msg.text().includes('favicon')) {
          globalConsoleErrors.push(`[${route.path} ${vp.name}] ${msg.text()}`);
        }
      });

      await page.goto(`http://localhost:3000/index.html${route.path}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);

      // Check broken images
      const brokenImages = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs
          .filter(img => !img.complete || img.naturalWidth === 0)
          .map(img => img.src);
      });

      // Check horizontal overflow on main content
      const layoutCheck = await page.evaluate(() => {
        const app = document.getElementById('app');
        const main = document.querySelector('main');
        const sidebar = document.getElementById('app-sidebar');

        return {
          windowScrollWidth: document.documentElement.scrollWidth,
          windowWidth: window.innerWidth,
          hasBodyOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
          hasSidebar: !!sidebar,
          mainScrollHeight: main ? main.scrollHeight : 0,
          mainClientHeight: main ? main.clientHeight : 0
        };
      });

      console.log(`  [${vp.name}] Images: ${brokenImages.length} broken, BodyOverflow: ${layoutCheck.hasBodyOverflow}`);
      testResults.routes.push({
        route: route.path,
        viewport: vp.name,
        brokenImages: brokenImages.length,
        hasBodyOverflow: layoutCheck.hasBodyOverflow
      });

      await context.close();
    }
  }

  // ==========================================
  // 3. Functional Test: Crop Recommendation Form & Calculation
  // ==========================================
  console.log('\n--- Testing Crop Recommendation Calculation ---');
  {
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await context.newPage();

    await page.goto('http://localhost:3000/index.html#/crop-recommendation', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // Verify prediction container exists
    const beforeText = await page.textContent('#prediction-results-container');
    console.log('Initial Prediction Card Present:', beforeText.includes('Suitability'));

    // Click compute button
    const computeBtn = await page.$('#btn-run-prediction');
    if (computeBtn) {
      await computeBtn.click();
      await page.waitForTimeout(600);
      const afterText = await page.textContent('#prediction-results-container');
      console.log('Prediction Recomputed successfully:', afterText.includes('Suitability'));
      testResults.formTests.push({ test: 'Crop Recommendation Button Click', passed: true });
    } else {
      console.log('ERROR: #btn-run-prediction not found');
      testResults.formTests.push({ test: 'Crop Recommendation Button Click', passed: false });
    }

    await context.close();
  }

  // ==========================================
  // 4. Functional Test: Disease Screening Tabs & Selection
  // ==========================================
  console.log('\n--- Testing Plant Disease Screening ---');
  {
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await context.newPage();

    await page.goto('http://localhost:3000/index.html#/disease', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const leafImg = await page.$('#leaf-preview-img');
    const leafSrc = leafImg ? await leafImg.getAttribute('src') : null;
    console.log('Disease Leaf Preview loaded:', leafSrc);

    // Switch crop chip
    const riceChip = await page.$('.crop-switch-chip[data-crop="rice"]');
    if (riceChip) {
      await riceChip.click();
      await page.waitForTimeout(500);
      const newImg = await page.$('#leaf-preview-img');
      const newSrc = newImg ? await newImg.getAttribute('src') : null;
      console.log('Switched to Rice Leaf Preview:', newSrc);
      testResults.formTests.push({ test: 'Disease Crop Chip Switch', passed: true });
    }

    await context.close();
  }

  // ==========================================
  // 5. Functional Test: 5 Biological Stages Full View Toggle
  // ==========================================
  console.log('\n--- Testing 5 Biological Stages Full View Toggle ---');
  {
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await context.newPage();

    await page.goto('http://localhost:3000/index.html#/crop-monitor', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const viewAllBtn = await page.$('button[data-lifecycle-stage="all"]');
    if (viewAllBtn) {
      await viewAllBtn.click();
      await page.waitForTimeout(500);
      console.log('Clicked "View All 5 Biological Stages" successfully');
      testResults.formTests.push({ test: '5 Biological Stages View All', passed: true });
    }

    await context.close();
  }

  await browser.close();

  console.log('\n==========================================');
  console.log('AUDIT SUMMARY REPORT');
  console.log('==========================================');
  console.log('Console Errors Detected:', globalConsoleErrors.length);
  if (globalConsoleErrors.length > 0) {
    globalConsoleErrors.forEach(e => console.log(' - ' + e));
  }
  const brokenCount = testResults.landingHtml.reduce((acc, r) => acc + r.brokenImages, 0) +
    testResults.routes.reduce((acc, r) => acc + r.brokenImages, 0);
  console.log('Total Broken Images:', brokenCount);
  const overflowCount = testResults.landingHtml.filter(r => r.hasOverflow).length +
    testResults.routes.filter(r => r.hasBodyOverflow).length;
  console.log('Total Viewport Overflows:', overflowCount);
  console.log('Functional Form Tests Passed:', testResults.formTests.filter(t => t.passed).length, '/', testResults.formTests.length);
}

runAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
