// =====================================================
// service05 Dynamic Dropdowns (epermits) - PROXY SAFE
// - Uses relative base (/ncmapp/api_utility_sch/...) to avoid CORS
// - Ensures service_id is always stored (immediate + before navigation)
// - Passes service_id + permit_cat + permit_cat_name + lang to attachment
// =====================================================

"use strict";

// ✅ Relative Base URL (No CORS) via Nginx proxy
// location /ncmapp/api_utility_sch/ { proxy_pass https://webservice.ncm.gov.sa/ncmapp/api_utility_sch/; }
const EPERMIT_BASE = "https://webservice.ncm.gov.sa/ncmapp/api_utility_sch/epermits";

// ثابت
const SERVICE_ID = 6;

// ------------------------------
// Ensure service_id exists early (IMPORTANT FIX)
// ------------------------------
(function __initServiceIdStorage() {
  try {
    sessionStorage.setItem("service_id", String(SERVICE_ID));
  } catch (_) {}
  try {
    localStorage.setItem("service_id", String(SERVICE_ID));
  } catch (_) {}
})();

// ------------------------------
// Get current language
// ------------------------------
function getLang() {
  if (window.APP_CTX && window.APP_CTX.lang) return String(window.APP_CTX.lang).toLowerCase();
  if (document.documentElement.lang) return String(document.documentElement.lang).toLowerCase();
  return "ar";
}

// ------------------------------
// Open popup + lazy load
// ------------------------------
document.querySelectorAll(".select-trigger").forEach((trigger) => {
  trigger.addEventListener("click", function () {
    const popupId = this.getAttribute("data-popup");
    if (!popupId) return;

    const pop = document.getElementById(popupId);
    if (pop) pop.classList.add("show");

    if (popupId === "serviceTypePopup") {
      loadServiceTypes();
      return;
    }

    if (popupId === "documentTypePopup") {
      const permitCat = document.getElementById("serviceTypeValue")?.value || "";
      if (!permitCat) return;
      loadDocumentTypes(permitCat);
      return;
    }

    if (popupId === "documentDurationPopup") {
      const permitCat = document.getElementById("serviceTypeValue")?.value || "";
      const permitType = document.getElementById("documentTypeValue")?.value || "";
      if (!permitCat || !permitType) return;
      loadDurationOptions(permitCat, permitType);
      return;
    }
  });
});

// ------------------------------
// Close popup
// ------------------------------
function closePopup(popupId) {
  const pop = document.getElementById(popupId);
  if (pop) pop.classList.remove("show");
}

document.querySelectorAll(".popup-overlay").forEach((overlay) => {
  overlay.addEventListener("click", function (e) {
    if (e.target === this) this.classList.remove("show");
  });
});

// ------------------------------
// Fetch JSON safely
// ------------------------------
async function fetchJson(url) {
  try {
    console.log("Fetching:", url);
    const res = await fetch(url, { method: "GET", credentials: "include" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Fetch failed:", err);
    return [];
  }
}

// ------------------------------
// Render options in popup body
// ------------------------------
function renderOptions(containerId, items, onClickFn) {
  const body = document.getElementById(containerId);
  if (!body) return;

  body.innerHTML = "";

  if (!items || items.length === 0) {
    body.innerHTML = `
      <div style="padding:12px;text-align:center;color:#999;" data-i18n="service05.nodata">
        لا توجد بيانات
      </div>
    `;
    return;
  }

  body.innerHTML = items
    .map((it) => {
      return `
        <label class="option" onclick="${onClickFn(it.ID, it.NAME)}">
          <input type="radio">
          <div class="option-content">
            <span class="radio-circle"></span>
            <span>${it.NAME}</span>
          </div>
        </label>
      `;
    })
    .join("");
}

// =====================================================
// Loaders
// =====================================================
async function loadServiceTypes() {
  const lang = getLang();
  const url = `${EPERMIT_BASE}/permit_cat?service_id=${SERVICE_ID}&lang=${lang}`;
  const data = await fetchJson(url);

  renderOptions("serviceTypeBody", data, (id, name) => {
    return `selectServiceType('${id}','${name}')`;
  });
}

async function loadDocumentTypes(permitCat) {
  const lang = getLang();
  const url = `${EPERMIT_BASE}/permit_type?service_id=${SERVICE_ID}&lang=${lang}&permit_cat=${permitCat}`;
  const data = await fetchJson(url);

  renderOptions("documentTypeBody", data, (id, name) => {
    return `selectDocumentType('${permitCat}','${id}','${name}')`;
  });
}

async function loadDurationOptions(permitCat, permitType) {
  const lang = getLang();
  const url = `${EPERMIT_BASE}/permit_vali_period?service_id=${SERVICE_ID}&lang=${lang}&permit_cat=${permitCat}&permit_type=${permitType}`;
  const data = await fetchJson(url);

  renderOptions("durationPopupBody", data, (id, name) => {
    return `selectDuration('${id}','${name}')`;
  });
}


function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toggleOtherTechSpecField(showField) {
  const fieldGroup = document.getElementById("otherTechSpecGroup");
  const fieldInput = document.getElementById("otherTechSpecText");
  if (!fieldGroup || !fieldInput) return;

  fieldGroup.classList.toggle("show", showField);
  if (!showField) {
    fieldInput.value = "";
  }
}

function isOtherSpecialization(checkbox) {
  if (!checkbox) return false;
  if (checkbox.dataset.isOther === "true") return true;

  const labelText = checkbox.closest("label")?.innerText || "";
  const normalized = labelText.trim().toLowerCase();
  return normalized.includes("أخرى") || normalized.includes("other");
}

function syncTechSpecSelection() {
  const checkedInputs = document.querySelectorAll('input[name="techSpec"]:checked');
  const ids = Array.from(checkedInputs).map((input) => input.value);
  const hiddenField = document.getElementById("techSpecValues");
  if (hiddenField) hiddenField.value = ids.join(",");

  const hasOtherSelected = Array.from(checkedInputs).some((input) => isOtherSpecialization(input));
  toggleOtherTechSpecField(hasOtherSelected);
}

async function loadTechSpecs() {
  const container = document.getElementById("techSpecContainer");
  if (!container) return;

  const lang = getLang();
  const url = `${EPERMIT_BASE}/tech_spec?lang=${lang}`;
  const data = await fetchJson(url);

  if (!data.length) {
    container.innerHTML = `
      <div class="helper-text" data-i18n="service05.nodata">لا توجد بيانات</div>
    `;
    return;
  }

  container.innerHTML = data
    .map((item) => {
      const id = escapeHtml(item.ID);
      const name = escapeHtml(item.NAME);
      const isOther = /أخرى|other/i.test(String(item.NAME ?? ""));
      return `
        <label class="checkbox-option" for="techSpec_${id}">
          <input id="techSpec_${id}" name="techSpec" type="checkbox" value="${id}" data-is-other="${isOther}" />
          <span class="checkbox-indicator"></span>
          <span>${name}</span>
        </label>
      `;
    })
    .join("");

  container.querySelectorAll('input[name="techSpec"]').forEach((checkbox) => {
    checkbox.addEventListener("change", syncTechSpecSelection);
  });

  syncTechSpecSelection();
}

function selectServiceType(id, name) {
  // set value
  document.getElementById("serviceTypeValue").value = id;

  // selected value (dynamic → no i18n)
  document.querySelector('[data-popup="serviceTypePopup"] span').innerText = name;

  try {
    sessionStorage.setItem("permit_cat", String(id));
    sessionStorage.setItem("permit_cat_name", String(name));
    localStorage.setItem("permit_cat", String(id));
    localStorage.setItem("permit_cat_name", String(name));
  } catch (_) {}

  closePopup("serviceTypePopup");

  // reset document type
  document.getElementById("documentTypeValue").value = "";
  const docTypeSpan = document.querySelector('[data-popup="documentTypePopup"] span');
  if (docTypeSpan) {
    docTypeSpan.setAttribute('data-i18n', 'service05.choose_doc_type');
  }

  // reset duration
  document.getElementById("documentDurationValue").value = "";
  const durationTrigger = document.getElementById("durationTrigger");
  if (durationTrigger) {
    durationTrigger.setAttribute('data-i18n', 'service05.choose_doc_duration');
  }

  // apply translation
  if (window.I18N && typeof window.I18N.apply === 'function') {
    window.I18N.apply();
  }
}

function selectDocumentType(permitCat, permitType, name) {
  // set value
  document.getElementById("documentTypeValue").value = permitType;

  // selected value (dynamic → no i18n)
  document.querySelector('[data-popup="documentTypePopup"] span').innerText = name;

  closePopup("documentTypePopup");

  // reset duration
  document.getElementById("documentDurationValue").value = "";
  const durationTrigger = document.getElementById("durationTrigger");
  if (durationTrigger) {
    durationTrigger.setAttribute('data-i18n', 'service05.choose_doc_duration');
  }

  // apply translation
  if (window.I18N && typeof window.I18N.apply === 'function') {
    window.I18N.apply();
  }
}




function selectDuration(id, name) {
  document.getElementById("documentDurationValue").value = id;
  document.getElementById("durationTrigger").innerText = name;
  closePopup("documentDurationPopup");
}

// =====================================================
// Minimal Validation (keep your full validation if you want)
// =====================================================
function __isEmpty(v) {
  return v === null || v === undefined || String(v).trim() === "";
}

function validateForm() {
  const serviceTypeVal = document.getElementById("serviceTypeValue")?.value;
  if (__isEmpty(serviceTypeVal)) {
    alert("الرجاء اختيار نوع الخدمة");
    return false;
  }
  return true;
}

// =====================================================
// Hook Next button (CRITICAL PASS CONTEXT)
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  loadTechSpecs();

  const nextBtn = document.getElementById("nextBtn");
  if (!nextBtn) return;

  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const permitCat = document.getElementById("serviceTypeValue")?.value || "";
    const permitCatName =
      document.querySelector('[data-popup="serviceTypePopup"] span')?.innerText || "";
    const lang = getLang();

    if (!permitCat) {
      alert("الرجاء اختيار نوع الخدمة");
      return;
    }

    // ✅ ALWAYS STORE service_id + permit_cat + lang
    try {
      sessionStorage.setItem("service_id", String(SERVICE_ID));
      sessionStorage.setItem("permit_cat", String(permitCat));
      sessionStorage.setItem("permit_cat_name", String(permitCatName));
      sessionStorage.setItem("lang", String(lang));
    } catch (_) {}

    try {
      localStorage.setItem("service_id", String(SERVICE_ID));
      localStorage.setItem("permit_cat", String(permitCat));
      localStorage.setItem("permit_cat_name", String(permitCatName));
      localStorage.setItem("lang", String(lang));
    } catch (_) {}

    // ✅ Navigate with QueryString (strongest)
    window.location.href =
      `attachment.html?service_id=${encodeURIComponent(SERVICE_ID)}` +
      `&permit_cat=${encodeURIComponent(permitCat)}` +
      `&permit_cat_name=${encodeURIComponent(permitCatName)}` +
      `&lang=${encodeURIComponent(lang)}`;
  });
});
