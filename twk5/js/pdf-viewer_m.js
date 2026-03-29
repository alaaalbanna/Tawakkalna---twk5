// =====================================================
// PDF Viewer (PDF.js) - Tawakkalna Theme/Language + Zoom Controls
// =====================================================
// - Theme/Language source of truth: window.TWK.getDeviceInfo()
//     app_language: 'ar' | 'en'
//     appearance  : 1 (light) | 2 (dark)
// - Fallback theme: prefers-color-scheme
// - Zoom: + / - / Reset / Fit Width (re-render pages)
// =====================================================

// ------------------------------
// Theme helpers
// ------------------------------
let __useTwkTheme = false;

function applySystemTheme() {
  const isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
}

function applyThemeFromTWK(appearance) {
  const theme = Number(appearance) === 2 ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  __useTwkTheme = true;
}

function applyLanguageFromTWK(lang) {
  if (window.I18N && typeof window.I18N.setLang === "function") {
    window.I18N.setLang(lang);
    return;
  }
  // Safe fallback (if i18n.js not loaded or older version)
  const language = (String(lang || "").toLowerCase() === "ar") ? "ar" : "en";
  document.documentElement.lang = language;
  document.documentElement.dir = (language === "ar") ? "rtl" : "ltr";
  document.documentElement.setAttribute("data-lang", language);
}

// Prefer TWK if available
(function initFromTWK() {
  try {
    if (window.TWK && typeof window.TWK.getDeviceInfo === "function") {
      window.TWK.getDeviceInfo()
        .then((ret) => {
          if (ret && ret.success && ret.result) {
            applyLanguageFromTWK(ret.result.app_language);
            applyThemeFromTWK(ret.result.appearance);
          } else {
            if (!__useTwkTheme) applySystemTheme();
          }
        })
        .catch(() => {
          if (!__useTwkTheme) applySystemTheme();
        });
    } else {
      // No TWK -> fallback theme
      applySystemTheme();
      if (window.matchMedia) {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        if (mq.addEventListener) mq.addEventListener("change", applySystemTheme);
        else mq.addListener(applySystemTheme);
      }
    }
  } catch (e) {
    console.error("TWK error:", e);
    applySystemTheme();
  }
})();

// =====================================================
// PDF.js Rendering
// =====================================================

// ===== Settings =====
const pdfPath = "SERV06_CONDITIONS.pdf";

// Zoom settings
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 3.0;
const ZOOM_STEP = 0.15;

let currentScale = 1.0; // default (100%)
let pdfDoc = null;
let isRendering = false;
let pendingScale = null;

// Worker path (make sure it matches your folder)
if (window["pdfjsLib"]) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "js/pdfjs/pdf.worker.min.js";
}

function showLoading(isLoading) {
  const el = document.getElementById("loadingState");
  if (el) el.style.display = isLoading ? "flex" : "none";
}

function showError(show, msg) {
  const box = document.getElementById("errorState");
  const text = box ? box.querySelector(".error-text") : null;
  if (text && msg) text.textContent = msg;

  if (!box) return;
  if (show) box.classList.add("show");
  else box.classList.remove("show");
}

function ensureCanvasContainer() {
  const viewer = document.getElementById("pdfViewer");
  if (!viewer) return null;

  let container = document.getElementById("pdfCanvasContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "pdfCanvasContainer";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.overflow = "auto";
    container.style.padding = "10px";
    container.style.background = "var(--page-bg)";

    // add container after loading/error
    viewer.appendChild(container);
  }

  return container;
}

function clearCanvases() {
  const container = document.getElementById("pdfCanvasContainer");
  if (container) container.innerHTML = "";
}

function clampScale(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return currentScale;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, n));
}

function updateZoomLabel() {
  const el = document.getElementById("zoomLabel");
  if (!el) return;
  el.textContent = `${Math.round(currentScale * 100)}%`;
}

function setScale(nextScale) {
  const s = clampScale(nextScale);

  // If currently rendering, queue the request
  if (isRendering) {
    pendingScale = s;
    return;
  }

  currentScale = s;
  updateZoomLabel();
  renderAllPages();
}

function createPageCanvasWrapper(pageNumber) {
  const wrap = document.createElement("div");
  wrap.className = "pdf-page";

  const label = document.createElement("div");
  label.className = "pdf-page-label";
  label.textContent = `${pageNumber}`;

  const canvas = document.createElement("canvas");
  canvas.className = "pdf-canvas";

  wrap.appendChild(label);
  wrap.appendChild(canvas);
  return { wrap, canvas };
}

async function renderAllPages() {
  if (!pdfDoc) return;

  const container = ensureCanvasContainer();
  if (!container) {
    showError(true, "عنصر العرض pdfViewer غير موجود في الصفحة.");
    return;
  }

  showError(false);
  showLoading(true);
  isRendering = true;

  try {
    clearCanvases();

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: currentScale });

      const { wrap, canvas } = createPageCanvasWrapper(pageNum);
      container.appendChild(wrap);

      const context = canvas.getContext("2d");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
    }

    showLoading(false);
  } catch (err) {
    console.error("❌ PDF.js render error:", err);
    showLoading(false);
    showError(true, "تم العثور على الملف لكن تعذر عرضه عبر PDF.js. تأكد من مسار PDF وملفات pdf.worker.");
  } finally {
    isRendering = false;

    // If user requested another scale during rendering, apply it now
    if (pendingScale !== null) {
      const s = pendingScale;
      pendingScale = null;
      setScale(s);
    }
  }
}

async function loadPDF() {
  showError(false);
  showLoading(true);

  if (!window.pdfjsLib) {
    showLoading(false);
    showError(true, "ملفات PDF.js غير موجودة. تأكد أنك أضفت: js/pdfjs/pdf.min.js و js/pdfjs/pdf.worker.min.js");
    return;
  }

  ensureCanvasContainer();

  try {
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    pdfDoc = await loadingTask.promise;

    console.log("✅ PDF loaded with PDF.js. pages:", pdfDoc.numPages);

    updateZoomLabel();
    await renderAllPages();
  } catch (err) {
    console.error("❌ PDF.js load error:", err);
    showLoading(false);
    showError(true, "عذراً، لم نتمكن من تحميل ملف PDF. يرجى التأكد من وجود الملف في المسار الصحيح.");
  }
}

// =====================================================
// Zoom controls
// =====================================================
function zoomIn()  { setScale(currentScale + ZOOM_STEP); }
function zoomOut() { setScale(currentScale - ZOOM_STEP); }
function zoomReset(){ setScale(1.0); }

async function zoomFitWidth() {
  if (!pdfDoc) return;

  const container = document.getElementById("pdfCanvasContainer") || ensureCanvasContainer();
  if (!container) return;

  // Use the visible width (remove padding)
  const containerWidth = container.clientWidth - 20; // padding approx
  const targetWidth = Math.min(containerWidth, 900); // your page wrapper max width

  try {
    const page = await pdfDoc.getPage(1);
    const viewport1 = page.getViewport({ scale: 1 });
    const fitScale = targetWidth / viewport1.width;
    setScale(fitScale);
  } catch (e) {
    console.error("Fit width error:", e);
  }
}

function bindZoomUI() {
  const btnPlus = document.getElementById("zoomInBtn");
  const btnMinus = document.getElementById("zoomOutBtn");
  const btnReset = document.getElementById("zoomResetBtn");
  const btnFit = document.getElementById("zoomFitBtn");

  if (btnPlus) btnPlus.addEventListener("click", zoomIn);
  if (btnMinus) btnMinus.addEventListener("click", zoomOut);
  if (btnReset) btnReset.addEventListener("click", zoomReset);
  if (btnFit) btnFit.addEventListener("click", zoomFitWidth);

  // Keyboard shortcuts: Ctrl/Cmd + (+/-/0)
  document.addEventListener("keydown", (e) => {
    const isMod = e.ctrlKey || e.metaKey;
    if (!isMod) return;

    if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      zoomIn();
    } else if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      zoomOut();
    } else if (e.key === "0") {
      e.preventDefault();
      zoomReset();
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  bindZoomUI();
  loadPDF();
});
