// =====================================================
// attachment_api.js (FULL FILE)
// - Upload multiple files in ONE request
// - req_no as Query Parameter (?req_no=xxx)
// - Sends attachment type ID as the multipart FIELD NAME (e.g. "168")  ✅ NO att_
// - Works with TWK Blob/File fallback (accepts File OR Blob-with-name)
// =====================================================

"use strict";

// API URL
const UPLOAD_API_URL =
  "https://webservice.ncm.gov.sa/ncmapp/api_utility_sch/file/upload";

// Optional Debug box (exists in attachment.html but hidden by default)
const debugBox = document.getElementById("debugBox");

function logDebug(msg) {
  try {
    console.log(msg);
    if (debugBox) debugBox.textContent += msg + "\n";
  } catch (e) {}
}

/**
 * Get request id:
 * 1) from URL (?ID=xxx / ?req_no=xxx / ?reqNo=xxx)
 * 2) from session/local storage ('requestId')
 * 3) fallback from input#reqNo if exists
 */
function getRequestId() {
  try {
    const p = new URLSearchParams(window.location.search);
    const fromUrl = p.get("ID") || p.get("req_no") || p.get("reqNo");
    if (fromUrl && String(fromUrl).trim() !== "") return String(fromUrl).trim();
  } catch (e) {}

  let id = "";
  try {
    id = sessionStorage.getItem("requestId") || localStorage.getItem("requestId") || "";
  } catch (e) {}

  const reqNoInput = document.getElementById("reqNo");
  if ((!id || String(id).trim() === "") && reqNoInput && reqNoInput.value) {
    id = reqNoInput.value.trim();
  }

  return id ? String(id).trim() : "";
}

/**
 * Collect selected files from file inputs inside #attachmentsGrid
 * Returns: { "<attachmentTypeId>": FileOrBlob, ... }
 */
function collectSelectedFilesByAttachmentId() {
  const inputs = document.querySelectorAll(
    '#attachmentsGrid input[type="file"][data-attachment-id]'
  );

  const out = {};

  inputs.forEach((inp) => {
    const attId = inp.getAttribute("data-attachment-id");
    if (!attId) return;

    if (inp.files && inp.files.length > 0) {
      out[String(attId)] = inp.files[0];
    }
  });

  // Fallback: TWK bag (if WebView doesn't populate input.files)
  if (Object.keys(out).length === 0) {
    const bag = window.__uploadedFiles || window.uploadedFiles;
    if (bag && typeof bag === "object") {
      Object.keys(bag).forEach((k) => {
        const f = bag[k];
        // TWK may return Blob (with .name) or File
        if (f && (f instanceof File || f instanceof Blob)) {
          out[String(k)] = f;
        }
      });
    }
  }

  return out;
}

/**
 * Build FormData using keys = attachment type id only (e.g. "168")
 * ✅ NO att_
 */
function guessMimeFromName(name) {
  const ext = (name || "").toLowerCase().split(".").pop();
  const map = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
  };
  return map[ext] || "";
}

function isValidMimeType(mime) {
  const v = String(mime || "").trim().toLowerCase();
  if (!v) return false;
  // بعض بيئات WebView ترجع النوع كنص "file" وهذا غير صالح كـ MIME
  if (v === "file" || v === "blob" || v === "binary") return false;
  // شكل MIME الصحيح غالبًا "type/subtype"
  return v.includes("/");
}

function isGenericZipMimeType(mime) {
  const v = String(mime || "").trim().toLowerCase();
  return v === "application/zip" || v === "application/x-zip-compressed";
}

function normalizeToFile(f, filename) {
  const currentMime = isValidMimeType(f && f.type) ? String(f.type).trim() : "";
  const guessedMime = guessMimeFromName(filename);
  const mime =
    (isGenericZipMimeType(currentMime) && guessedMime ? guessedMime : currentMime) ||
    guessedMime ||
    "application/octet-stream";

  // لو هو File والنوع النهائي صحيح بالفعل استخدمه كما هو
  if (f instanceof File && mime === currentMime) return f;

  // حوّله إلى File (حتى يجبر المتصفح يرسل Content-Type مضبوط للـ part)
  return new File([f], filename, { type: mime });
} 


function buildFormDataNumericKeys(filesById) {
  const formData = new FormData();

  Object.keys(filesById).forEach((id) => {
    const f = filesById[id];
    if (!f) return;

    const key = String(id); // ✅ multipart field name = "168"

    // File preferred. If Blob, try to send with filename.
    const filename =
      (f instanceof File && f.name) ||
      (typeof f.name === "string" && f.name) ||
      `attachment_${id}`;

    //formData.append(key, f, filename);
    const safeFile = normalizeToFile(f, filename);
    formData.append(key, safeFile, filename);
  });

  return formData;
}

/**
 * Upload all files in one request
 * req_no is query param
 */
async function uploadFilesOnce(filesById, requestId) {
  const url = `${UPLOAD_API_URL}?req_no=${encodeURIComponent(requestId)}`;
  const formData = buildFormDataNumericKeys(filesById);

  logDebug("==================================");
  logDebug("Upload URL: " + url);
  logDebug("Page Origin: " + (location.origin || "null"));
  logDebug("Files count: " + Object.keys(filesById).length);

  Object.keys(filesById).forEach((id, idx) => {
    const f = filesById[id];
    const name =
      (f instanceof File && f.name) || (typeof f.name === "string" && f.name) || "(no-name)";
    const size = typeof f.size === "number" ? Math.round(f.size / 1024) : "?";
    logDebug(`- ${idx + 1}) partName=${id} => ${name} (${size} KB)`);
  });

  logDebug("==================================");

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    credentials: "include",
    mode: "cors",
  });

  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();

  logDebug("Status: " + response.status);
  logDebug("Content-Type: " + contentType);
  logDebug("Response Body:\n" + bodyText);

  if (!response.ok) {
    throw new Error(`Upload failed. Status=${response.status}. Body=${bodyText}`);
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(bodyText);
    } catch (e) {}
  }

  return bodyText;
}

/**
 * MAIN: attach click event to submit button
 */
document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submitBtn");

  if (!submitBtn) {
    console.error("❌ submitBtn not found. تأكد أن الزر فيه id='submitBtn'");
    return;
  }

  submitBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (debugBox) debugBox.textContent = "";

    // 0) Validate required attachments if function exists
    if (typeof window.validateAttachments === "function") {
      const ok = window.validateAttachments();
      if (!ok) {
        //alert("⚠️ يُرجى رفع جميع المرفقات الإلزامية");
        return;
      }
    }

    // 1) Request Id
    const requestId = getRequestId();
    if (!requestId) {
      alert("⚠️ لم يتم العثور على رقم الطلب");
      logDebug("ERROR: requestId not found in URL or storage");
      return;
    }

    // 2) Collect files
    const filesById = collectSelectedFilesByAttachmentId();
    const ids = Object.keys(filesById);

    if (ids.length === 0) {
      alert("⚠️ يرجى اختيار ملف واحد على الأقل");
      logDebug("ERROR: No files selected");
      return;
    }

    // UI lock
    this.disabled = true;
    const oldText = this.textContent;
    const uploadText =
      (window.I18N && typeof window.I18N.t === 'function')
        ? window.I18N.t('attachment.btn.submit.upload')
        : 'جاري الرفع...';

    this.textContent = uploadText;
    
    //this.textContent = "جاري الرفع...";

    try {
      await uploadFilesOnce(filesById, requestId);
      window.location.href = "success.html";
    } catch (err) {
      console.error(err);
      logDebug("ERROR: " + err.message);
      alert("❌ حدث خطأ: " + err.message);
    } finally {
      this.disabled = false;
      this.textContent = oldText;
    }
  });
});