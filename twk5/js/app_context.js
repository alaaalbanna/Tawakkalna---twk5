// =====================================================
// APP Context (Language + Theme) - One file for whole project
// =====================================================
// Priority:
// 1) TWK.getDeviceInfo()  -> app_language, appearance
// 2) localStorage         -> app_language/lang, appearance/theme
// 3) Browser fallback     -> prefers-color-scheme, default lang 'ar'
//
// Exposes:
// window.APP_CTX = {
//   ready: Promise,
//   lang, theme,
//   getLang(), getTheme(),
//   setLang(lang), setTheme(theme),
//   applyAll(), onReady(fn)
// }
// =====================================================

(function () {
  if (window.APP_CTX) return; // prevent double init

  const ctx = {
    lang: 'ar',
    theme: 'light',
    _readyDone: false,
    _readyCallbacks: [],
    ready: null,
  };

  function normalizeLang(v) {
    const s = String(v || '').toLowerCase();
    return s.startsWith('ar') ? 'ar' : 'en';
  }

  function normalizeTheme(v) {
    const s = String(v || '').toLowerCase();
    if (s === '2' || s === 'dark') return 'dark';
    if (s === '1' || s === 'light') return 'light';
    return 'light';
  }

  function systemTheme() {
    const isDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark ? 'dark' : 'light';
  }

  function persist() {
    try {
      // language
      localStorage.setItem('app_language', ctx.lang);
      localStorage.setItem('lang', ctx.lang);

      // theme
      localStorage.setItem('theme', ctx.theme);
      // compatibility with TWK appearance style
      localStorage.setItem('appearance', ctx.theme === 'dark' ? '2' : '1');
    } catch (e) {}
  }

  function applyLangToDOM() {
    document.documentElement.setAttribute('lang', ctx.lang);
    document.documentElement.setAttribute('dir', ctx.lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('data-lang', ctx.lang);

    // Delegate to i18n.js when available
    try {
      if (window.I18N && typeof window.I18N.setLang === 'function') {
        window.I18N.setLang(ctx.lang);
      }
      if (window.I18N && typeof window.I18N.translatePage === 'function') {
        window.I18N.translatePage();
      }
    } catch (e) {}
  }

  function applyThemeToDOM() {
    document.documentElement.setAttribute('data-theme', ctx.theme);
  }

  ctx.applyAll = function () {
    applyLangToDOM();
    applyThemeToDOM();
  };

  ctx.getLang = function () {
    return ctx.lang;
  };

  ctx.getTheme = function () {
    return ctx.theme;
  };

  ctx.setLang = function (lang) {
    ctx.lang = normalizeLang(lang);
    persist();
    applyLangToDOM();
  };

  ctx.setTheme = function (theme) {
    ctx.theme = normalizeTheme(theme);
    persist();
    applyThemeToDOM();
  };

  ctx.onReady = function (fn) {
    if (ctx._readyDone) {
      try {
        fn(ctx);
      } catch (e) {}
      return;
    }
    ctx._readyCallbacks.push(fn);
  };

  function resolveReady() {
    ctx._readyDone = true;
    ctx.applyAll();
    const list = ctx._readyCallbacks.splice(0);
    list.forEach((fn) => {
      try {
        fn(ctx);
      } catch (e) {}
    });
  }

  function readFromStorageFirst() {
    try {
      const storedLang =
        localStorage.getItem('app_language') ||
        localStorage.getItem('lang');
      const storedTheme =
        localStorage.getItem('theme') ||
        localStorage.getItem('appearance');

      if (storedLang) ctx.lang = normalizeLang(storedLang);
      if (storedTheme) ctx.theme = normalizeTheme(storedTheme);
    } catch (e) {}

    if (!ctx.theme) ctx.theme = systemTheme();
  }

  // ---- Init sequence ----
  readFromStorageFirst();

  // create ready promise
  ctx.ready = new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      persist();
      resolveReady();
      resolve(ctx);
    };

    // Try TWK (preferred) with a safe timeout
    try {
      if (window.TWK && typeof window.TWK.getDeviceInfo === 'function') {
        const t = setTimeout(finish, 1200);

        window.TWK
          .getDeviceInfo()
          .then((ret) => {
            clearTimeout(t);
            if (ret && ret.success && ret.result) {
              ctx.lang = normalizeLang(ret.result.app_language);
              ctx.theme = Number(ret.result.appearance) === 2 ? 'dark' : 'light';
            }
            finish();
          })
          .catch(() => {
            clearTimeout(t);
            if (!ctx.theme) ctx.theme = systemTheme();
            finish();
          });

        return;
      }
    } catch (e) {}

    // No TWK -> fallback immediately
    if (!ctx.theme) ctx.theme = systemTheme();
    finish();
  });

  // Expose globally
  window.APP_CTX = ctx;

  // Apply early to reduce any flash
  try {
    ctx.applyAll();
  } catch (e) {}
})();
