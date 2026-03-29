// =====================================================
// Requests Page - POST API + TWK ID_NO + Debug + Render Cards
// Endpoint: /epermits/request_twk (POST)
// Body: { "ID_NO":"...", "REQNO":optional, "SERVICE_ID":optional }
// =====================================================

// ✅ API endpoint
const API_URL =
  "https://webservice.ncm.gov.sa/ncmapp/api_utility_sch/epermits/request_twk";

// ✅ fallback ID
////////////const FALLBACK_ID_NO = "1000101111";

// i18n helper (works even if i18n.js is not loaded)
const t = (key, fallback) => {
  try {
    if (window.I18N && typeof window.I18N.t === "function") return window.I18N.t(key, fallback);
  } catch (e) {}
  return (fallback !== undefined ? fallback : key);
};

// Data state
let requestsData = [];
let filteredRequests = [];

// -----------------------------------------------------
// Debug helpers (no console needed)
// -----------------------------------------------------
function setDebug(msg) {
  const box = document.getElementById("debugLog");
  if (!box) return;
  box.textContent = msg;
}

function debugInfo(msg) {
  const box = document.getElementById("debugLog");
  if (!box) return;

  const now = new Date();
  const ts =
    `${String(now.getHours()).padStart(2, "0")}:` +
    `${String(now.getMinutes()).padStart(2, "0")}:` +
    `${String(now.getSeconds()).padStart(2, "0")}`;

  if (box.textContent === "Ready..." || box.textContent.trim() === "") {
    box.textContent = "";
  }
  box.textContent += `[${ts}] ${msg}\n`;
}

function getOriginSafe() {
  try {
    return window.location.origin || "(no-origin)";
  } catch (e) {
    return "(origin-error)";
  }
}

// -----------------------------------------------------
// TWK helpers
// -----------------------------------------------------
function extractValue(response) {
  // Expected: { success:true, result:{ user_id: "1000..." } }
  if (response && response.success && response.result && typeof response.result === "object") {
    const values = Object.values(response.result);
    return values.length > 0 ? String(values[0]) : "";
  }
  return "";
}

async function getIdNoFromTwkOrFallback() {
  try {
    debugInfo("🔐 Getting ID_NO from TWK...");

    if (!window.TWK || typeof window.TWK.getUserId !== "function") {
      debugInfo('⚠️ window.TWK.getUserId not found -> using fallback ID_NO');
      return FALLBACK_ID_NO;
    }

    const res = await window.TWK.getUserId();
    debugInfo("🧾 TWK raw: " + JSON.stringify(res));

    const idNo = extractValue(res);
    if (!idNo) {
      debugInfo("⚠️ TWK returned empty -> using fallback ID_NO");
      return FALLBACK_ID_NO;
    }

    debugInfo("✅ TWK ID_NO = " + idNo);
    return idNo;
  } catch (e) {
    debugInfo("❌ TWK getUserId failed -> using fallback. " + (e?.message || e));
    return FALLBACK_ID_NO;
  }
}

// -----------------------------------------------------
// POST JSON helper
// -----------------------------------------------------
async function postJson(url, payload) {
  debugInfo("🌐 Page Origin: " + getOriginSafe());
  debugInfo("➡️ POST URL: " + url);
  debugInfo("📦 Payload: " + JSON.stringify(payload));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    credentials: "include" // مهم لبعض WebViews
  });

  // لو فشل (مثلا 403/500) نعرض النص
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${t}`);
  }

  // أحيانًا يرجع JSON array أو object
  const data = await res.json().catch(async () => {
    const txt = await res.text().catch(() => "");
    throw new Error("Invalid JSON response: " + txt);
  });

  return data;
}

// -----------------------------------------------------
// Mapping API row -> card model (حسب استجابتك الحقيقية)
// -----------------------------------------------------
function mapApiRowToCard(row) {
  // From your GET sample response fields:
  // ID, REQ_NO, SERVICE_NAME, PERMIT_CAT_NAME, PERMIT_VALI_PERIOD_NAME, PERMIT_STATUS_NAME, DOB ...
  const id = row.ID ?? row.id ?? "";
  const reqNo = row.REQ_NO ?? row.REQNO ?? row.request_no ?? id ?? "—";

  // تاريخ: إذا API ما يرجع تاريخ إنشاء، نستخدم DOB/اليوم (عدّل حسب حقولك)
  const rawDate = row.CREATED_DATE ?? row.CREATE_DATE ?? row.DOB ?? null;
  const date = rawDate ? String(rawDate).substring(0, 10) : new Date().toISOString().substring(0, 10);

  const serviceName = row.SERVICE_NAME ?? "—";
  const permitCat = row.PERMIT_CAT_NAME ?? ""; // مثل: تجديد / إصدار بدل فاقد
  const permitTypeName = row.PERMIT_TYPE_NAME ?? "—"; // تصريح/ترخيص
  const permitPeriod = row.PERMIT_VALI_PERIOD_NAME ?? "—"; // ستة أشهر / سنة...
  const permitStatusName = row.PERMIT_STATUS_NAME ?? ""; // غير مكتمل...

  // نوع الخدمة
  let serviceType = "إصدار";
  const combined = `${serviceName} ${permitCat}`.trim();
  if (combined.includes("تجديد")) serviceType = "تجديد";
  else if (combined.includes("بدل")) serviceType = "بدل فاقد";
  else if (combined.includes("إصدار")) serviceType = "إصدار";

  // نوع الوثيقة
  const documentType = permitTypeName || "—";

  // مدة الوثيقة
  const duration = permitPeriod || "—";

  // اكتمال
  const isComplete = !permitStatusName.includes("غير مكتمل");

  // حالة الطلب (تقريبية لأن API يعطينا اسم عربي)
  let status = "in-progress";
  if (permitStatusName.includes("مقبول")) status = "approved";
  else if (permitStatusName.includes("مرفوض")) status = "rejected";
  else status = "in-progress";

  return {
    id: Number(id) || id,
    requestNumber: String(reqNo),
    date,
    serviceType,
    documentType,
    duration,
    isComplete,
    status,
    completionPercentage: isComplete ? 100 : 60,
    _raw: row
  };
}

// -----------------------------------------------------
// UI helpers (unchanged CSS classes)
// -----------------------------------------------------
function formatDate(dateString) {
  const date = new Date(dateString);
  const months = [
    t("common.months.1","يناير"), t("common.months.2","فبراير"), t("common.months.3","مارس"), t("common.months.4","إبريل"),
    t("common.months.5","مايو"), t("common.months.6","يونيو"), t("common.months.7","يوليو"), t("common.months.8","أغسطس"),
    t("common.months.9","سبتمبر"), t("common.months.10","أكتوبر"), t("common.months.11","نوفمبر"), t("common.months.12","ديسمبر")
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getStatusInfo(status) {
  const statusMap = {
    "in-progress": {
      text: t("requests.opt.in_progress","تحت الإجراء"),
      class: "status-badge-in-progress",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="status-icon">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>`
    },
    approved: {
      text: t("requests.opt.approved","مقبول"),
      class: "status-badge-approved",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="status-icon">
        <polyline points="20 6 9 17 4 12"/>
      </svg>`
    },
    rejected: {
      text: t("requests.opt.rejected","مرفوض"),
      class: "status-badge-rejected",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="status-icon">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>`
    }
  };
  return statusMap[status] || statusMap["in-progress"];
}

// -----------------------------------------------------
// Render requests cards
// -----------------------------------------------------
function renderRequests() {
  const container = document.getElementById("requestsList");
  if (!container) return;

  if (!filteredRequests || filteredRequests.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-title">${t("requests.empty.title","لا توجد طلبات")}</div>
        <div class="empty-message">${t("requests.empty.msg","لم يتم العثور على طلبات")}</div>
        <a href="service06.html" class="btn btn-primary"><span>${t("requests.empty.new","تقديم طلب جديد")}</span></a>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredRequests.map((request) => {
    const statusInfo = getStatusInfo(request.status);

    return `
      <div class="request-card status-${request.status}">
        <div class="card-header">
          <div>
            <div class="request-number">${request.requestNumber}</div>
            <div class="request-date">${formatDate(request.date)}</div>
          </div>
        </div>

        <div class="card-body">
          <div class="info-item">
            <span class="info-label">${t("requests.card.service_type","نوع الخدمة")}</span>
            <span class="info-value">${request.serviceType}</span>
          </div>

          <div class="info-item">
            <span class="info-label">${t("requests.card.doc_type","نوع الوثيقة")}</span>
            <span class="info-value">${request.documentType}</span>
          </div>

          <div class="info-item">
            <span class="info-label">${t("requests.card.duration","مدة الوثيقة")}</span>
            <span class="info-value">${request.duration}</span>
          </div>

          <div class="info-item">
            <span class="info-label">${t("requests.card.completion","حالة الاكتمال")}</span>
            <span class="completion-badge ${
              request.isComplete ? "completion-badge-complete" : "completion-badge-incomplete"
            }">
              <span>${request.isComplete ? t("requests.badge.complete","مكتمل") : t("requests.badge.incomplete","غير مكتمل")}</span>
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">${t("requests.card.status","حالة الطلب")}</span>
            <span class="status-badge ${statusInfo.class}">
              ${statusInfo.icon}
              <span>${statusInfo.text}</span>
            </span>
          </div>
        </div>

        <div class="card-footer">
          <button class="btn btn-secondary" onclick="viewDetails(${JSON.stringify(request.id)})">
            <span>${t("requests.action.details","عرض التفاصيل")}</span>
          </button>

          ${
            request.status === "approved"
              ? `<button class="btn btn-primary" onclick="downloadCertificate(${JSON.stringify(request.id)})">
                   <span>${t("requests.action.download","تحميل الوثيقة")}</span>
                 </button>`
              : ""
          }
        </div>
      </div>
    `;
  }).join("");
}

// -----------------------------------------------------
// Filtering
// -----------------------------------------------------
function filterRequests() {
  const statusFilter = document.getElementById("filterStatus")?.value || "all";
  const completionFilter = document.getElementById("filterCompletion")?.value || "all";
  const serviceFilter = document.getElementById("filterService")?.value || "all";

  filteredRequests = requestsData.filter((request) => {
    const statusMatch = statusFilter === "all" || request.status === statusFilter;

    const completionMatch =
      completionFilter === "all" ||
      (completionFilter === "complete" && request.isComplete) ||
      (completionFilter === "incomplete" && !request.isComplete);

    const serviceMatch =
      serviceFilter === "all" ||
      request.serviceType.includes(
        serviceFilter === "issuance" ? "إصدار" :
        serviceFilter === "renewal" ? "تجديد" : "بدل فاقد"
      );

    return statusMatch && completionMatch && serviceMatch;
  });

  renderRequests();
}

// -----------------------------------------------------
// Actions
// -----------------------------------------------------
window.viewDetails = function (id) {
  alert(`${t("requests.action.details","عرض التفاصيل")}: ${id}`);
};

window.downloadCertificate = function (id) {
  alert(`${t("requests.action.download","تحميل الوثيقة")}: ${id}`);
};

// -----------------------------------------------------
// Load from API (POST with JSON body)
// -----------------------------------------------------
async function loadRequestsFromApi() {
  setDebug("Loading...");

  const idNo = await getIdNoFromTwkOrFallback();
  debugInfo("✅ Using ID_NO = " + idNo);

  const payload = { ID_NO: String(idNo) };
  // optional:
  // payload.REQNO = 272;
  // payload.SERVICE_ID = 6;

  const apiData = await postJson(API_URL, payload);

  const rows = Array.isArray(apiData)
    ? apiData
    : (apiData && typeof apiData === "object" ? [apiData] : []);

  requestsData = rows.map(mapApiRowToCard);
  filteredRequests = [...requestsData];

  debugInfo("📦 Rows loaded = " + rows.length);
  renderRequests();
}

// -----------------------------------------------------
// Init + bindings
// -----------------------------------------------------
async function init() {
  try {
    debugInfo("=== INIT ===");
    await loadRequestsFromApi();

    document.getElementById("filterStatus")?.addEventListener("change", filterRequests);
    document.getElementById("filterCompletion")?.addEventListener("change", filterRequests);
    document.getElementById("filterService")?.addEventListener("change", filterRequests);

    document.getElementById("btnRefresh")?.addEventListener("click", async () => {
      try {
        debugInfo("🔄 Refresh clicked");
        await loadRequestsFromApi();
      } catch (e) {
        debugInfo("❌ Refresh failed: " + (e?.message || e));
        alert("تعذر التحديث داخل Tawakkalna. راجع Debug Log.");
      }
    });

    document.getElementById("btnClearFilters")?.addEventListener("click", () => {
      if (document.getElementById("filterStatus")) document.getElementById("filterStatus").value = "all";
      if (document.getElementById("filterCompletion")) document.getElementById("filterCompletion").value = "all";
      if (document.getElementById("filterService")) document.getElementById("filterService").value = "all";
      filteredRequests = [...requestsData];
      renderRequests();
      debugInfo("🧹 Filters cleared");
    });

    debugInfo("=== READY ===");
  } catch (e) {
    requestsData = [];
    filteredRequests = [];
    renderRequests();
    debugInfo("🚫 FINAL ERROR: " + (e?.message || e));
    alert("تعذر تحميل الطلبات. راجع Debug Log داخل الصفحة.");
  }
}

document.addEventListener("DOMContentLoaded", init);
