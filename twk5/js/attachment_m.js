// =====================================================
// attachment_m.js (FULL FILE - UPDATED)
// - NO MutationObserver (avoid hang in Tawakkalna WebView)
// - Fetch attachments by service_id + permit_cat + lang
// - Renders OLD card UI
// - Uses IS_MANDATORY (Y/N) for required/optional + validation
// - Exposes window.validateAttachments()
// - Exposes window.__uploadedFiles for upload api fallback
// - Supports png + Office files coming as application/zip
// =====================================================

"use strict";

// ✅ RELATIVE URL (works with Nginx proxy in production)
const ATTACHMENT_API =
  "https://webservice.ncm.gov.sa/ncmapp/api_utility_sch/epermits/attachment_type";

const DEFAULT_SERVICE_ID = "6";

// UI texts
const UI = {
  required_ar: "إلزامي",
  optional_ar: "اختياري",
  required_en: "Mandatory",
  optional_en: "Optional",

  loading_ar: "جاري تحميل المرفقات...",
  loading_en: "Loading attachments...",

  noAttachments_ar: "لا توجد مرفقات مطلوبة لهذه الخدمة.",
  noAttachments_en: "No attachments are required for this service.",

  missingRequired_ar: "هذا المرفق إلزامي",
  missingRequired_en: "This attachment is mandatory",

  deleteConfirm_ar: "هل أنت متأكد من حذف هذا الملف؟",
  deleteConfirm_en: "Are you sure you want to delete this file?",

  uploadClick_ar: "اضغط لرفع الملف",
  uploadClick_en: "Click to upload",

  uploadHint_ar: "أو اسحب الملف وأفلته هنا",
  uploadHint_en: "or drag & drop here",

  uploadBtn_ar: "رفع",
  uploadBtn_en: "Upload",

  downloadBtn_ar: "تحميل",
  downloadBtn_en: "Download",

  loadFail_ar: "تعذر تحميل قائمة المرفقات. راجع Console لمعرفة السبب.",
  loadFail_en: "Failed to load attachments. Check console for details.",

  bytes_ar: "بايت",
  kb_ar: "كيلوبايت",
  mb_ar: "ميجابايت",
  gb_ar: "جيجابايت",
  bytes_en: "B",
  kb_en: "KB",
  mb_en: "MB",
  gb_en: "GB",
};

const uploadedFiles = {};
window.__uploadedFiles = uploadedFiles;

const ALLOWED_ATTACHMENT_EXTENSIONS = Object.freeze([
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "xlsx",
  "xls",
  "doc",
  "docx",
  "ppt",
  "pptx"
]);

const ALLOWED_ATTACHMENT_ACCEPT = ALLOWED_ATTACHMENT_EXTENSIONS
  .map((x) => `.${x}`)
  .join(",");

const ALLOWED_ATTACHMENT_MIME_TYPES = Object.freeze([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
]);

function getRequestIdentifier() {
  const read = (key) => {
    try {
      const v = new URLSearchParams(window.location.search).get(key);
      return v && String(v).trim() ? String(v).trim() : "";
    } catch (_) {
      return "";
    }
  };

  const fromUrl =
    read("ID") ||
    read("req_no") ||
    read("reqNo") ||
    read("request_id") ||
    read("requestId");

  if (fromUrl) return fromUrl;

  try {
    const fromStorage =
      sessionStorage.getItem("requestId") ||
      localStorage.getItem("requestId") ||
      sessionStorage.getItem("req_no") ||
      localStorage.getItem("req_no") ||
      "";
    return String(fromStorage || "").trim();
  } catch (_) {
    return "";
  }
}

window.goBack = function goBack() {
  const requestId = getRequestIdentifier();
  const qs = new URLSearchParams();

  if (requestId) {
    qs.set("ID", requestId);
    qs.set("req_no", requestId);
  }

  const target = `service06.html${qs.toString() ? `?${qs.toString()}` : ""}`;
  window.location.href = target;
};

// -----------------------------
// Context helpers
// -----------------------------
function getParam(name) {
  try {
    const v = new URLSearchParams(location.search).get(name);
    return v && String(v).trim() !== "" ? String(v).trim() : "";
  } catch (_) {
    return "";
  }
}

function getStorage(name) {
  let v = "";
  try {
    v = sessionStorage.getItem(name) || "";
  } catch (_) {}

  if (v && String(v).trim() !== "") return String(v).trim();

  try {
    v = localStorage.getItem(name) || "";
  } catch (_) {}

  if (v && String(v).trim() !== "") return String(v).trim();

  return "";
}

function readCtx() {
  const ctx = {
    service_id: getParam("service_id") || getStorage("service_id") || DEFAULT_SERVICE_ID,
    permit_cat: getParam("permit_cat") || getStorage("permit_cat") || "",
    permit_cat_name: getParam("permit_cat_name") || getStorage("permit_cat_name") || "",
    lang: (
      getParam("lang") ||
      getStorage("lang") ||
      (document.documentElement.lang || "ar")
    ).toLowerCase(),
  };

  console.log("[CTX] resolved:", ctx);
  return ctx;
}

window.readCtx = readCtx;

function isAr(lang) {
  return String(lang || "").toLowerCase().startsWith("ar");
}

function txt(ctx, keyAr, keyEn) {
  return isAr(ctx.lang) ? UI[keyAr] : UI[keyEn];
}

// -----------------------------
// Safe title setter
// -----------------------------
function setServiceTypeTitleSafe(ctx) {
  let tries = 0;
  const max = 3;

  const apply = () => {
    const el = document.getElementById("serviceTypeName");
    if (!el) return;

    el.textContent = ctx.permit_cat_name || ctx.permit_cat || "-";

    tries++;
    if (tries < max) setTimeout(apply, 200);
  };

  apply();
}

// -----------------------------
// Helpers
// -----------------------------
function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeMandatoryFlag(x) {
  return String(x ?? "").toUpperCase().trim() === "Y";
}

function normalizeRow(r) {
  return {
    id: String(r?.ID ?? "").trim(),
    name: String(r?.NAME ?? "").trim(),
    required: normalizeMandatoryFlag(r?.IS_MANDATORY),
  };
}

function cacheAttachments(list) {
  try {
    sessionStorage.setItem("attachment_types", JSON.stringify(list));
  } catch (_) {}
}

function getCachedAttachments() {
  try {
    const s = sessionStorage.getItem("attachment_types");
    const a = s ? JSON.parse(s) : [];
    return Array.isArray(a) ? a : [];
  } catch (_) {
    return [];
  }
}

function formatFileSize(ctx, bytes) {
  const ar = isAr(ctx.lang);
  if (!bytes || bytes === 0) return ar ? `0 ${UI.bytes_ar}` : `0 ${UI.bytes_en}`;

  const k = 1024;
  const sizes = ar
    ? [UI.bytes_ar, UI.kb_ar, UI.mb_ar, UI.gb_ar]
    : [UI.bytes_en, UI.kb_en, UI.mb_en, UI.gb_en];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const v = Math.round((bytes / Math.pow(k, i)) * 100) / 100;
  return `${v} ${sizes[i]}`;
}

function getFileExtension(fileName) {
  const n = String(fileName || "").trim().toLowerCase();
  const i = n.lastIndexOf(".");
  if (i < 0 || i === n.length - 1) return "";
  return n.slice(i + 1);
}

function isValidMimeType(mime) {
  const v = String(mime || "").trim().toLowerCase();
  if (!v) return false;
  if (v === "file" || v === "blob" || v === "binary") return false;
  return v.includes("/");
}

function isGenericZipMimeType(mime) {
  const v = String(mime || "").trim().toLowerCase();
  return v === "application/zip" || v === "application/x-zip-compressed";
}

function guessMimeFromName(name) {
  const n = String(name || "").toLowerCase();
  if (n.endsWith(".pdf")) return "application/pdf";
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  if (n.endsWith(".gif")) return "image/gif";
  if (n.endsWith(".doc")) return "application/msword";
  if (n.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (n.endsWith(".xls")) return "application/vnd.ms-excel";
  if (n.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (n.endsWith(".ppt")) return "application/vnd.ms-powerpoint";
  if (n.endsWith(".pptx")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  return "";
}

function guessExtFromMime(mime) {
  const m = String(mime || "").toLowerCase();
  if (m.includes("pdf")) return ".pdf";
  if (m.includes("png")) return ".png";
  if (m.includes("jpeg") || m.includes("jpg")) return ".jpg";
  if (m.includes("gif")) return ".gif";
  if (m.includes("wordprocessingml.document")) return ".docx";
  if (m.includes("msword")) return ".doc";
  if (m.includes("spreadsheetml.sheet")) return ".xlsx";
  if (m.includes("ms-excel") || m.includes("excel")) return ".xls";
  if (m.includes("presentationml.presentation")) return ".pptx";
  if (m.includes("powerpoint")) return ".ppt";
  return "";
}

function sniffMimeFromBase64(base64) {
  const head = String(base64 || "").slice(0, 64);
  if (head.startsWith("JVBERi0")) return "application/pdf";
  if (head.startsWith("iVBORw0KGgo")) return "image/png";
  if (head.startsWith("/9j/")) return "image/jpeg";
  if (head.startsWith("R0lGOD")) return "image/gif";
  if (head.startsWith("UEsDB")) return "application/zip";
  return "";
}

function sniffOoxmlMimeFromBase64(base64) {
  const s = String(base64 || "");
  if (!s) return "";

  let text = "";
  try {
    text = atob(s.slice(0, 8192));
  } catch (_) {
    return "";
  }

  if (text.includes("word/")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (text.includes("xl/")) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }
  if (text.includes("ppt/")) {
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  }

  return "";
}

function resolveAttachmentMimeType(fileName, mimeType, base64) {
  const guessedFromName = guessMimeFromName(fileName);
  const validMime = isValidMimeType(mimeType) ? String(mimeType).trim() : "";

  if (validMime && !isGenericZipMimeType(validMime)) {
    return validMime;
  }

  // 2) لو zip → حاول نحدد النوع الحقيقي من base64
  if (isGenericZipMimeType(validMime) || !validMime) {
    const ooxml = sniffOoxmlMimeFromBase64(base64);
    if (ooxml) return ooxml;
  }

  // 3) fallback من الاسم
  if (guessedFromName) return guessedFromName;

  // 4) fallback من base64 (pdf/png/jpg...)
  const sniffed = sniffMimeFromBase64(base64);
  if (sniffed) return sniffed;

  return "application/octet-stream";
}

function isAllowedAttachmentType(fileName, mimeType) {
  const ext = getFileExtension(fileName);
  if (ext && ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext)) return true;

  const mime = String(mimeType || "").trim().toLowerCase();
  if (mime && ALLOWED_ATTACHMENT_MIME_TYPES.includes(mime)) return true;

  // 🔥 مهم: اسمح للـ zip لو تم تحويله لاحقاً
  if (mime === "application/zip" || mime === "application/x-zip-compressed") {
    return true;
  }

  return false;
}

function normalizeBase64String(b64) {
  let s = String(b64 || "").trim();

  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }

  if (s.startsWith("data:")) {
    const m = s.match(/^data:([^;]+);base64,(.+)$/);
    if (m) s = m[2];
  }

  s = s.replace(/\s+/g, "");
  s = s.replace(/-/g, "+").replace(/_/g, "/");

  while (s.length % 4 !== 0) s += "=";
  return s;
}

function parseTwkFileResult(res) {
  let obj = res;

  if (typeof obj === "string") {
    const s = obj.trim();
    if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
      try {
        obj = JSON.parse(s);
      } catch (_) {}
    }
  }

  if (obj && typeof obj === "object") {
    obj = obj.result || obj.data || obj.payload || obj.value || obj;
  }

  let base64 = "";
  let fileName = "";
  let mimeType = "";

  if (typeof obj === "string") {
    base64 = obj;
  } else if (obj && typeof obj === "object") {
    base64 =
      obj.base64 ||
      obj.data ||
      obj.fileBase64 ||
      obj.file_base64 ||
      obj.content ||
      obj.file ||
      "";

    fileName =
      obj.fileName ||
      obj.filename ||
      obj.name ||
      obj.file_name ||
      obj.originalName ||
      "";

    mimeType =
      obj.mimeType ||
      obj.mimetype ||
      obj.type ||
      obj.contentType ||
      obj.mime ||
      "";
  }

  base64 = normalizeBase64String(base64);

  return { base64, fileName, mimeType, raw: res };
}

function base64ToBlob(base64, mimeType) {
  const byteChars = atob(base64);
  const sliceSize = 1024;
  const byteArrays = [];

  for (let offset = 0; offset < byteChars.length; offset += sliceSize) {
    const slice = byteChars.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: mimeType || "application/octet-stream" });
}

function blobToFile(blob, fileName) {
  try {
    return new File([blob], fileName, { type: blob.type });
  } catch (_) {
    blob.name = fileName;
    return blob;
  }
}

// -----------------------------
// Fetch
// -----------------------------
async function fetchAttachments(ctx) {
  const url =
    `${ATTACHMENT_API}` +
    `?service_id=${encodeURIComponent(ctx.service_id)}` +
    `&lang=${encodeURIComponent(ctx.lang)}` +
    `&permit_cat=${encodeURIComponent(ctx.permit_cat)}`;

  console.log("[ATT] Fetch:", url);

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error("[ATT] HTTP", res.status, t.slice(0, 200));
    throw new Error("HTTP " + res.status);
  }

  const data = await res.json();
  console.log("[ATT] Data:", data);

  const rows = Array.isArray(data) ? data.map(normalizeRow) : [];
  return rows.filter((x) => x.id && x.name);
}

// -----------------------------
// Rendering
// -----------------------------
function renderAttachments(ctx, list) {
  const grid = document.getElementById("attachmentsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (!list || list.length === 0) {
    grid.innerHTML = `<div style="padding:16px;text-align:center;opacity:.75;">${escapeHtml(
      txt(ctx, "noAttachments_ar", "noAttachments_en")
    )}</div>`;
    return;
  }

  list.forEach((att) => {
    const badgeText = att.required
      ? txt(ctx, "required_ar", "required_en")
      : txt(ctx, "optional_ar", "optional_en");

    const badgeClass = att.required ? "required-badge" : "optional-badge";

    const card = document.createElement("div");
    card.className = `attachment-card ${att.required ? "required" : "optional"}`;
    card.id = `card-${att.id}`;

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${escapeHtml(att.name)}</div>
        <span class="${badgeClass}">${escapeHtml(badgeText)}</span>
      </div>

      <div class="card-body">
        <div class="file-info" id="file-info-${att.id}">
          <div class="file-details">
            <div class="file-name" id="file-name-${att.id}"></div>
            <div class="file-size" id="file-size-${att.id}"></div>
          </div>
        </div>

        <div class="upload-area" id="upload-area-${att.id}">
          <div class="upload-text">${escapeHtml(txt(ctx, "uploadClick_ar", "uploadClick_en"))}</div>
          <div class="upload-hint">${escapeHtml(txt(ctx, "uploadHint_ar", "uploadHint_en"))}</div>
        </div>

        <input
          type="file"
          class="file-input"
          id="file-input-${att.id}"
          data-attachment-id="${escapeHtml(att.id)}"
          accept="${escapeHtml(ALLOWED_ATTACHMENT_ACCEPT)}"
        />
      </div>

      <div class="card-actions">
        <button class="btn btn-upload" type="button" data-id="${escapeHtml(att.id)}">
          ${escapeHtml(txt(ctx, "uploadBtn_ar", "uploadBtn_en"))}
        </button>

        <button class="btn btn-download" type="button" id="btn-download-${att.id}">
          ${escapeHtml(txt(ctx, "downloadBtn_ar", "downloadBtn_en"))}
        </button>

        <button class="btn btn-delete" type="button" id="btn-delete-${att.id}">✖</button>
      </div>

      <div class="error-message" id="err-${att.id}">
        ${escapeHtml(txt(ctx, "missingRequired_ar", "missingRequired_en"))}
      </div>
    `;

    const fileInput = card.querySelector(`#file-input-${CSS.escape(att.id)}`);
    const uploadArea = card.querySelector(`#upload-area-${CSS.escape(att.id)}`);
    const uploadBtn = card.querySelector(`.btn-upload[data-id="${CSS.escape(att.id)}"]`);
    const downloadBtn = card.querySelector(`#btn-download-${CSS.escape(att.id)}`);
    const deleteBtn = card.querySelector(`#btn-delete-${CSS.escape(att.id)}`);

    function openPicker() {
      if (fileInput) fileInput.click();
    }

    if (uploadArea) {
      uploadArea.addEventListener("click", () => pickFileViaTWK(ctx, att.id));
    }

    if (uploadBtn) {
      uploadBtn.addEventListener("click", () => pickFileViaTWK(ctx, att.id));
    }

    if (fileInput) {
      fileInput.addEventListener("change", () => {
        const f = fileInput.files && fileInput.files[0];
        if (!f) return;
        handleFileSelect(ctx, att.id, f);
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => downloadFile(att.id));
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => deleteFile(ctx, att.id));
    }

    grid.appendChild(card);
  });
}

// -----------------------------
// Tawakkalna
// -----------------------------
function hasTWK() {
  return typeof window.TWK !== "undefined" && typeof window.TWK.getFileBase64 === "function";
}

async function pickFileViaTWK(ctx, attId) {
  try {
    if (!hasTWK()) {
      const fileInput = document.getElementById(`file-input-${attId}`);
      if (fileInput) fileInput.click();
      return;
    }

    const res = await window.TWK.getFileBase64();
    const parsed = parseTwkFileResult(res);

    console.log("[TWK] raw:", res);
    console.log("[TWK] parsed:", {
      base64_len: parsed.base64 ? parsed.base64.length : 0,
      fileName: parsed.fileName,
      mimeType: parsed.mimeType
    });

    if (!parsed.base64 || parsed.base64.length < 20) {
          alert(isAr(ctx.lang) ? "لم يتم اختيار ملف." : "No file selected.");
          return;
        }

        let finalMime = resolveAttachmentMimeType(
      parsed.fileName,
      parsed.mimeType,
      parsed.base64
    );

    // 🔥 أهم خطوة: فرض الامتداد حتى لو TWK ما رجعه
    let finalName = parsed.fileName || `attachment_${attId}`;

    if (!/\.[a-z0-9]+$/i.test(finalName)) {
      const ext = guessExtFromMime(finalMime);
      finalName += ext || ".bin";
    }

    if (!isAllowedAttachmentType(finalName, finalMime)) {
      const allowed = ALLOWED_ATTACHMENT_EXTENSIONS.join(", ");
      alert(
        isAr(ctx.lang)
          ? `صيغة الملف غير مدعومة. الصيغ المسموح بها: ${allowed}`
          : `Unsupported file type. Allowed types: ${allowed}`
      );
      return;
    }

    const blob = base64ToBlob(parsed.base64, finalMime);
    const fileLike = blobToFile(blob, finalName);

    console.log("[TWK] final:", {
      finalName,
      finalMime,
      blobType: blob.type,
      fileType: fileLike.type || "(no-type)"
    });

    handleFileSelect(ctx, attId, fileLike);
  } catch (e) {
    console.error("[TWK] getFileBase64 failed:", e);
    alert(isAr(ctx.lang) ? "تعذر فتح اختيار الملفات." : "Failed to open file picker.");
  }
}

// -----------------------------
// File handling
// -----------------------------
function handleFileSelect(ctx, id, file) {
  if (!isAllowedAttachmentType(file && file.name, file && file.type)) {
    const allowed = ALLOWED_ATTACHMENT_EXTENSIONS.join(", ");
    alert(
      isAr(ctx.lang)
        ? `صيغة الملف غير مدعومة. الصيغ المسموح بها: ${allowed}`
        : `Unsupported file type. Allowed types: ${allowed}`
    );

    const fileInput = document.getElementById(`file-input-${id}`);
    if (fileInput) fileInput.value = "";
    return;
  }

  uploadedFiles[String(id)] = file;

  const fileName = document.getElementById(`file-name-${id}`);
  const fileSize = document.getElementById(`file-size-${id}`);
  const fileInfo = document.getElementById(`file-info-${id}`);
  const uploadArea = document.getElementById(`upload-area-${id}`);
  const downloadBtn = document.getElementById(`btn-download-${id}`);
  const deleteBtn = document.getElementById(`btn-delete-${id}`);
  const card = document.getElementById(`card-${id}`);
  const err = document.getElementById(`err-${id}`);

  if (fileName) fileName.textContent = file.name;
  if (fileSize) fileSize.textContent = formatFileSize(ctx, file.size);

  if (fileInfo) fileInfo.classList.add("show");
  if (uploadArea) uploadArea.style.display = "none";
  if (downloadBtn) downloadBtn.classList.add("show");
  if (deleteBtn) deleteBtn.classList.add("show");
  if (card) card.classList.remove("error");
  if (err) err.classList.remove("show");
}

function downloadFile(id) {
  const file = uploadedFiles[String(id)];
  if (!file) return;

  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name || "attachment";
  a.click();
  URL.revokeObjectURL(url);
}

function deleteFile(ctx, id) {
  if (typeof Swal !== "undefined" && Swal.fire) {
    Swal.fire({
      icon: "warning",
      title: isAr(ctx.lang) ? "تأكيد الحذف" : "Confirm Delete",
      text: isAr(ctx.lang)
        ? "هل أنت متأكد من حذف هذا الملف؟"
        : "Are you sure you want to delete this file?",
      showCancelButton: true,
      confirmButtonText: isAr(ctx.lang) ? "موافق" : "Confirm",
      cancelButtonText: isAr(ctx.lang) ? "إلغاء" : "Cancel",
      reverseButtons: isAr(ctx.lang),
      focusCancel: true
    }).then((result) => {
      if (!result.isConfirmed) return;
      doDeleteFile(id);
    });
    return;
  }

  const msg = txt(ctx, "deleteConfirm_ar", "deleteConfirm_en");
  if (!confirm(msg)) return;
  doDeleteFile(id);
}

function doDeleteFile(id) {
  delete uploadedFiles[String(id)];

  const fileInfo = document.getElementById(`file-info-${id}`);
  const uploadArea = document.getElementById(`upload-area-${id}`);
  const downloadBtn = document.getElementById(`btn-download-${id}`);
  const deleteBtn = document.getElementById(`btn-delete-${id}`);
  const fileInput = document.getElementById(`file-input-${id}`);

  if (fileInfo) fileInfo.classList.remove("show");
  if (uploadArea) uploadArea.style.display = "block";
  if (downloadBtn) downloadBtn.classList.remove("show");
  if (deleteBtn) deleteBtn.classList.remove("show");
  if (fileInput) fileInput.value = "";
}

// -----------------------------
// Validation
// -----------------------------
function validateAttachments() {
  const list = getCachedAttachments();
  let ok = true;
  let firstErr = null;

  list.forEach((att) => {
    if (att.required && !uploadedFiles[String(att.id)]) {
      const card = document.getElementById(`card-${att.id}`);
      const err = document.getElementById(`err-${att.id}`);
      if (card) card.classList.add("error");
      if (err) err.classList.add("show");
      ok = false;
      if (!firstErr && card) firstErr = card;
    }
  });

  if (firstErr) {
    firstErr.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  return ok;
}

window.validateAttachments = validateAttachments;

// -----------------------------
// INIT
// -----------------------------
document.addEventListener("DOMContentLoaded", async () => {
  const ctx = readCtx();

  if (!ctx.permit_cat) {
    alert(isAr(ctx.lang)
      ? "تعذر تحديد نوع الخدمة (permit_cat). الرجاء الرجوع للصفحة السابقة."
      : "Cannot determine service type (permit_cat). Please go back.");
    return;
  }

  setServiceTypeTitleSafe(ctx);

  const grid = document.getElementById("attachmentsGrid");
  if (grid) {
    grid.innerHTML = `<div style="padding:12px;text-align:center;opacity:.75;">${escapeHtml(
      txt(ctx, "loading_ar", "loading_en")
    )}</div>`;
  }

  try {
    const list = await fetchAttachments(ctx);
    cacheAttachments(list);
    renderAttachments(ctx, list);
  } catch (e) {
    console.error(e);
    alert(txt(ctx, "loadFail_ar", "loadFail_en"));
  }
});