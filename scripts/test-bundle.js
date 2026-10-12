// Test runtime execution of the AgroSense bundle
const fs = require('fs');

// Create mock browser environment
global.window = {
  location: { hash: '#/3d-farm' },
  addEventListener: () => {},
  innerWidth: 1920,
  innerHeight: 1080
};
global.document = {
  getElementById: () => ({ innerHTML: '', addEventListener: () => {} }),
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: () => {}
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
global.lucide = { createIcons: () => {} };
global.navigator = { userAgent: 'test' };

console.log('Loading dist/agrosense.bundle.js in mock environment...');
try {
  require('../dist/agrosense.bundle.js');
  console.log('Test PASSED: AgroSense bundle initialized without runtime error!');
} catch (e) {
  console.error('Test FAILED:', e);
  process.exit(1);
}
