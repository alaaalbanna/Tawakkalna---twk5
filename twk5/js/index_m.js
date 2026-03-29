// =====================================================
// Index Page - Language + Theme handled by js/app_context.js
// =====================================================
// app_context.js applies language + theme globally once.
// If you need current settings:
//   window.APP_CTX.getLang(), window.APP_CTX.getTheme()
// To change:
//   window.APP_CTX.setLang('ar'|'en')
//   window.APP_CTX.setTheme('light'|'dark')
// =====================================================

(function () {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      document.documentElement.classList.add("app-ready");
    });
  } else {
    // fallback
    document.documentElement.classList.add("app-ready");
  }
})();


/*************************************
 * Navigation
 *************************************/
function goToServiceRequest() {
  window.location.href = "terms.html";
}

function goToTracking() {
  window.location.href = "requests.html";
}

// Add keyboard navigation
document.addEventListener("keydown", function (e) {
  if (e.key === "1") {
    goToServiceRequest();
  } else if (e.key === "2") {
    goToTracking();
  }
});

// Add touch feedback for mobile (after DOM ready)
document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".service-card");
  cards.forEach((card) => {
    card.addEventListener("touchstart", function () {
      this.style.transform = "scale(0.98)";
    });
    card.addEventListener("touchend", function () {
      this.style.transform = "";
    });
  });
});

// -----------------------------------------------------
// Prevent flash: show page only after init scripts loaded
// -----------------------------------------------------
(function () {
  function showApp() {
    document.documentElement.classList.add("app-ready");
  }

  async function waitForCairo(maxMs) {
    const start = Date.now();

    // لو Font Loading API غير مدعوم
    if (!document.fonts || !document.fonts.load) return true;

    // حاول تحميل Cairo (حتى لو رابط Google Fonts موجود، لازم ننتظر فعلياً)
    while (Date.now() - start < maxMs) {
      try {
        await document.fonts.load('16px "Cairo"');
        // إذا صار متاح
        if (document.fonts.check('16px "Cairo"')) return true;
      } catch (e) {}

      // انتظر قليل وكرر
      await new Promise((r) => setTimeout(r, 50));
    }
    return false;
  }

  document.addEventListener("DOMContentLoaded", async function () {
    // انتظر الخط حتى 3 ثواني (تقدر تزودها)
    await waitForCairo(3000);

    // بعدها اعرض الصفحة
    showApp();
  });
})();
