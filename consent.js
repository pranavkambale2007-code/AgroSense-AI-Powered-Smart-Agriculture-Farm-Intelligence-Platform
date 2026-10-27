/**
 * AgroSense Autonomous Privacy & Local Storage Consent Controller
 * Transparently manages essential local browser storage and user preferences.
 * Adheres to privacy-by-design: No third-party trackers, no advertising pixels.
 */
(function initAgroSenseConsent() {
  const STORAGE_KEY = 'agrosense_cookie_consent';

  function getConsent() {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(consentObj) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consentObj));
    } catch (e) {
      console.warn('Storage unavailable:', e);
    }
  }

  function createUI() {
    if (document.getElementById('agrosense-consent-container')) return;

    const container = document.createElement('div');
    container.id = 'agrosense-consent-container';

    container.innerHTML = `
      <!-- Floating Cookie Notice Banner -->
      <aside id="cookie-banner" class="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-[9990] bg-[#12281e]/95 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-5 shadow-2xl text-slate-200 text-xs hidden transition-all duration-300 transform translate-y-4" role="region" aria-label="Privacy and Local Storage Notice">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <div class="space-y-2 flex-1">
            <h3 class="font-bold text-white text-sm tracking-tight">Privacy & Local Storage Notice</h3>
            <p class="text-slate-300 leading-relaxed text-[11px]">
              AgroSense uses <strong>strictly necessary local browser storage</strong> to save your farm zones, calculation presets, and offline queues on your device. We do not use advertising or tracking cookies.
            </p>
            <div class="flex flex-wrap items-center gap-2 pt-1">
              <button id="consent-accept-all" type="button" class="px-3 py-1.5 rounded-lg bg-[#16A36A] hover:bg-[#128a57] text-white font-bold text-[11px] transition shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                Accept All
              </button>
              <button id="consent-reject-optional" type="button" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold text-[11px] transition focus:outline-none focus:ring-2 focus:ring-slate-400">
                Essential Only
              </button>
              <button id="consent-manage" type="button" class="text-emerald-400 hover:text-emerald-300 text-[11px] underline underline-offset-2 transition px-1 py-1">
                Customize
              </button>
            </div>
            <div class="text-[10px] text-slate-400 pt-1">
              Read our <a href="./privacy.html" class="underline text-slate-300 hover:text-white">Privacy Policy</a> &amp; <a href="./cookies.html" class="underline text-slate-300 hover:text-white">Cookie Policy</a>.
            </div>
          </div>
        </div>
      </aside>

      <!-- Manage Preferences Modal Dialog -->
      <div id="cookie-modal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm hidden" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
        <div class="bg-[#0e2118] border border-emerald-500/30 rounded-2xl max-w-lg w-full p-6 text-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
          
          <div class="flex items-center justify-between border-b border-emerald-900/60 pb-3">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-md bg-emerald-900/60 text-emerald-400 flex items-center justify-center">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
              </div>
              <h2 id="cookie-modal-title" class="text-base font-bold text-white tracking-tight">Local Storage & Privacy Preferences</h2>
            </div>
            <button id="cookie-modal-close" type="button" class="text-slate-400 hover:text-white p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400" aria-label="Close dialog">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <p class="text-xs text-slate-300 leading-relaxed">
            AgroSense operates on a client-first static architecture. Choose which types of local device storage you wish to permit.
          </p>

          <div class="space-y-3 text-xs">
            <!-- 1. Necessary Storage -->
            <div class="p-3.5 rounded-xl bg-black/40 border border-emerald-900/50 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="font-bold text-white flex items-center gap-2">
                  <span>Strictly Necessary Storage</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">Always Active</span>
                </span>
                <input type="checkbox" checked disabled class="accent-emerald-500 h-4 w-4 rounded cursor-not-allowed" />
              </div>
              <p class="text-[11px] text-slate-400 leading-relaxed">
                Stores your farm boundaries, selected active farm ID, offline sync queues, and sensor calculation caches locally in your browser (<code class="text-emerald-300 font-mono text-[10px]">localStorage</code>). The application cannot function without this.
              </p>
            </div>

            <!-- 2. Functional & Presets -->
            <div class="p-3.5 rounded-xl bg-black/40 border border-emerald-900/50 space-y-1.5">
              <div class="flex items-center justify-between">
                <label for="consent-pref-functional" class="font-bold text-white cursor-pointer">
                  Agronomic Presets & UI Preferences
                </label>
                <input id="consent-pref-functional" type="checkbox" checked class="accent-emerald-500 h-4 w-4 rounded cursor-pointer" />
              </div>
              <p class="text-[11px] text-slate-400 leading-relaxed">
                Remembers customized calculation presets in the Profitability Calculator and farm notification alert thresholds across sessions.
              </p>
            </div>

            <!-- 3. Tracking & Advertising (None) -->
            <div class="p-3.5 rounded-xl bg-black/40 border border-emerald-900/50 space-y-1.5 opacity-60">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-400 flex items-center gap-2">
                  <span>Tracking & Advertising Pixels</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">None Used</span>
                </span>
                <input type="checkbox" disabled class="h-4 w-4 rounded cursor-not-allowed" />
              </div>
              <p class="text-[11px] text-slate-400 leading-relaxed">
                AgroSense has zero third-party advertising cookies, behavioral tracking scripts, or data-broker pixels.
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-emerald-900/60">
            <button id="cookie-modal-save" type="button" class="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#16A36A] hover:bg-[#128a57] text-white font-bold text-xs transition shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
              Save Preferences
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Bind event handlers
    const banner = document.getElementById('cookie-banner');
    const modal = document.getElementById('cookie-modal');
    const btnAcceptAll = document.getElementById('consent-accept-all');
    const btnRejectOptional = document.getElementById('consent-reject-optional');
    const btnManage = document.getElementById('consent-manage');
    const btnCloseModal = document.getElementById('cookie-modal-close');
    const btnSaveModal = document.getElementById('cookie-modal-save');
    const chkFunctional = document.getElementById('consent-pref-functional');

    function hideBanner() {
      if (banner) {
        banner.classList.add('translate-y-4', 'opacity-0');
        setTimeout(() => banner.classList.add('hidden'), 300);
      }
    }

    function showBanner() {
      if (banner) {
        banner.classList.remove('hidden');
        setTimeout(() => banner.classList.remove('translate-y-4', 'opacity-0'), 50);
      }
    }

    function openModal() {
      const consent = getConsent() || { preferences: true };
      if (chkFunctional) chkFunctional.checked = !!consent.preferences;
      if (modal) modal.classList.remove('hidden');
      if (btnCloseModal) btnCloseModal.focus();
    }

    function closeModal() {
      if (modal) modal.classList.add('hidden');
    }

    if (btnAcceptAll) {
      btnAcceptAll.addEventListener('click', () => {
        saveConsent({ necessary: true, preferences: true, analytics: false, timestamp: Date.now() });
        hideBanner();
      });
    }

    if (btnRejectOptional) {
      btnRejectOptional.addEventListener('click', () => {
        saveConsent({ necessary: true, preferences: false, analytics: false, timestamp: Date.now() });
        hideBanner();
      });
    }

    if (btnManage) {
      btnManage.addEventListener('click', openModal);
    }

    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', closeModal);
    }

    if (btnSaveModal) {
      btnSaveModal.addEventListener('click', () => {
        const prefVal = chkFunctional ? chkFunctional.checked : false;
        saveConsent({ necessary: true, preferences: prefVal, analytics: false, timestamp: Date.now() });
        closeModal();
        hideBanner();
      });
    }

    // Close on backdrop click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });

    // Check existing consent
    const existing = getConsent();
    if (!existing) {
      setTimeout(showBanner, 800);
    }

    // Attach to any element with data-open-cookie-settings or href="#cookie-settings"
    document.querySelectorAll('[data-open-cookie-settings], a[href="#cookie-settings"], a[href="#cookie-preferences"]').forEach((el) => {
      el.addEventListener('click', (ev) => {
        ev.preventDefault();
        openModal();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createUI);
  } else {
    createUI();
  }

  // Expose global method to open modal
  window.openAgroSenseCookieSettings = function() {
    const modal = document.getElementById('cookie-modal');
    if (modal) {
      modal.classList.remove('hidden');
    } else {
      createUI();
      const m = document.getElementById('cookie-modal');
      if (m) m.classList.remove('hidden');
    }
  };
})();
