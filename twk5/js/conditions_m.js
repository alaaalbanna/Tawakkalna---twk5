// =====================================================
// Conditions Page - Page specific logic only
// =====================================================
// Language + Theme are handled globally by js/app_context.js
// =====================================================

(function () {
  function applyTitle() {
    try {
      if (window.I18N && typeof window.I18N.t === 'function') {
        var t = window.I18N.t('conditions.html_title');
        if (t) document.title = t;
      }
    } catch (e) {}
  }

  // Ensure title is updated after global context applies language.
  if (window.APP_CTX && typeof window.APP_CTX.onReady === 'function') {
    window.APP_CTX.onReady(function () {
      applyTitle();
    });
  } else {
    // Fallback if app_context.js is missing for any reason
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyTitle);
    } else {
      applyTitle();
    }
  }
})();
