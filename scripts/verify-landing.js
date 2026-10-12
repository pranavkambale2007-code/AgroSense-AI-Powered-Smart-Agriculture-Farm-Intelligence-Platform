const { chromium } = require('C:/Users/Pranav Kambale/AppData/Local/ms-playwright-go/1.57.0/package/index.js');

const VIEWPORTS = [
  { name: '360px Mobile (Small)', width: 360, height: 740 },
  { name: '390px Mobile (iPhone 14)', width: 390, height: 844 },
  { name: '768px Tablet (iPad)', width: 768, height: 1024 },
  { name: '1024px Laptop/Tablet-Pro', width: 1024, height: 768 },
  { name: '1366px Standard Desktop', width: 1366, height: 768 },
  { name: '1920px Full HD Desktop', width: 1920, height: 1080 }
];

async function verifyLanding() {
  console.log('🌱 Verifying redesigned landing.html across viewports...\n');

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });

  let totalBrokenImages = 0;
  let totalOverflows = 0;
  let consoleErrors = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        consoleErrors.push(`[${vp.name}] ${msg.text()}`);
      }
    });

    await page.goto('http://localhost:3000/landing.html', { waitUntil: 'networkidle' });

    // Check broken images
    const brokenImgs = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => img.src);
    });

    // Check horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 1;
    });

    // If mobile, test menu toggle
    let menuWorks = true;
    if (vp.width < 768) {
      const btn = await page.$('#mobile-menu-btn');
      const menu = await page.$('#mobile-menu');
      if (btn && menu) {
        const isHiddenBefore = await page.evaluate(el => el.classList.contains('hidden'), menu);
        await btn.click();
        const isHiddenAfter = await page.evaluate(el => el.classList.contains('hidden'), menu);
        menuWorks = isHiddenBefore && !isHiddenAfter;
      }
    }

    if (brokenImgs.length > 0) totalBrokenImages += brokenImgs.length;
    if (hasOverflow) totalOverflows++;

    console.log(`[${vp.name}] Broken Images: ${brokenImgs.length} | Horizontal Overflow: ${hasOverflow} | Mobile Menu: ${menuWorks ? 'OK' : 'N/A'}`);
    if (brokenImgs.length > 0) {
      console.log('   Broken src:', brokenImgs);
    }

    await context.close();
  }

  // Check CTA links and text
  const testContext = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const testPage = await testContext.newPage();
  await testPage.goto('http://localhost:3000/landing.html', { waitUntil: 'domcontentloaded' });

  const heroHeadline = await testPage.$eval('h1', el => el.textContent.trim());
  console.log('\nHero Headline:', heroHeadline);

  const links = await testPage.$$eval('a', els => els.map(a => ({ href: a.getAttribute('href'), text: a.textContent.trim().replace(/\s+/g, ' ') })));
  console.log(`Verified ${links.length} links on page.`);

  await testContext.close();
  await browser.close();

  console.log('\n==========================================');
  console.log('LANDING PAGE VERIFICATION SUMMARY');
  console.log('==========================================');
  console.log('Total Console Errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(e => console.log(' - ' + e));
  }
  console.log('Total Broken Images:', totalBrokenImages);
  console.log('Total Horizontal Overflows:', totalOverflows);
  console.log('All Viewports PASSED:', totalBrokenImages === 0 && totalOverflows === 0 && consoleErrors.length === 0);
}

verifyLanding().catch(err => {
  console.error('Landing verification failed:', err);
  process.exit(1);
});
