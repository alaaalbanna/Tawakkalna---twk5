// =====================================================
// Simple i18n for static sites (auto-detect once + remember)
// - Default: Arabic
// - Detect: navigator.language startsWith("ar") -> ar else en
// - Remember: localStorage "lang"
// - Optional override for testing: ?lang=ar|en
// =====================================================
(function () {
  const STORAGE_KEY = "lang";

  function normalizeLang(v) {
    if (!v) return null;
    v = String(v).toLowerCase();
    if (v.startsWith("ar")) return "ar";
    if (v.startsWith("en")) return "en";
    return null;
  }

  function getQueryLang() {
    try {
      const p = new URLSearchParams(window.location.search);
      return normalizeLang(p.get("lang"));
    } catch (e) {
      return null;
    }
  }

  function getSavedLang() {
    try {
      return normalizeLang(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return null;
    }
  }

  function saveLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  function detectDeviceLang() {
    const navLang = normalizeLang(navigator.language || navigator.userLanguage);
    return navLang || "ar"; // default Arabic
  }

  const forced = getQueryLang();
  const saved = getSavedLang();
  let lang = forced || saved || detectDeviceLang();
  saveLang(lang);

  // apply direction ASAP
  const html = document.documentElement;
  html.setAttribute("lang", lang);
  let dir = lang === "ar" ? "rtl" : "ltr";
  html.setAttribute("dir", dir);
  html.classList.remove("rtl", "ltr");
  html.classList.add(dir === "rtl" ? "rtl" : "ltr");

  // dictionary storage
  let DICT = {};

  async function loadDict() {
    try {
      const res = await fetch(`lang/${lang}.json`, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      DICT = await res.json();
    } catch (e) {
      DICT = {};
    }
  }

  function t(key, fallback) {
    const v = key && Object.prototype.hasOwnProperty.call(DICT, key) ? DICT[key] : undefined;
    if (v === undefined || v === null || v === "") return (fallback !== undefined ? fallback : key);
    return v;
  }

  function applyTranslations() {
    // textContent
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key, el.textContent);
    });

    // innerHTML (when markup is needed)
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      el.innerHTML = t(key, el.innerHTML);
    });

    // placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const current = el.getAttribute("placeholder") || "";
      el.setAttribute("placeholder", t(key, current));
    });

    // simple titles by pathname (optional)
    try {
      const p = (location.pathname || "").split("/").pop() || "";
      const titleKey = ({
        "index.html": "index.title",
        "terms.html": "terms.title",
        "pdf-viewer.html": "pdf.title",
        "service06.html": "service06.title",
        "requests.html": "requests.title",
        "attachment.html": "attachment.title",
        "success.html": "success.title"
      })[p];
      if (titleKey) document.title = t(titleKey, document.title);
    } catch (e) {}
  }

  // expose helper for other JS files
  window.I18N = {
    getLang: () => lang,
    isRTL: () => dir === "rtl",
    t,
    // Change language dynamically (used by Tawakkalna integration)
    setLang: async (newLang) => {
      newLang = normalizeLang(newLang);
      if (!newLang || newLang === lang) return;

      lang = newLang;
      saveLang(lang);

      // Apply direction/lang immediately
      const html = document.documentElement;
      html.setAttribute("lang", lang);
      dir = lang === "ar" ? "rtl" : "ltr";
      html.setAttribute("dir", dir);
      html.classList.remove("rtl", "ltr");
      html.classList.add(dir === "rtl" ? "rtl" : "ltr");

      // Reload dictionary then re-apply translations
      await loadDict();
      applyTranslations();
    }
  };

  // init
  (async function init() {
    await loadDict();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", applyTranslations);
    } else {
      applyTranslations();
    }
  })();
})();
