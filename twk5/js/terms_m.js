// =====================================================
// Terms Page - TWK Theme + Language + Validation
// =====================================================
// Preferred source:
//   window.TWK.getDeviceInfo():
//     - app_language: 'ar' or 'en'
//     - appearance  : 1 light, 2 dark
//
// Fallbacks (only if TWK not available / failed):
//   - Theme: prefers-color-scheme (live updates)
//   - Language: handled by i18n.js (navigator/lang/localStorage/?lang=)
// =====================================================

const termsCheckbox = document.getElementById('termsCheckbox');
const continueBtn = document.getElementById('continueBtn');
const checkboxSection = document.getElementById('checkboxSection');
const checkboxError = document.getElementById('checkboxError');

// NOTE:
// Language + Theme are handled globally by js/app_context.js
// Do not duplicate TWK / theme / i18n logic here.

// ------------------------------
// UX: remove error styling when checkbox is checked
// ------------------------------
termsCheckbox.addEventListener('change', function () {
  if (this.checked) {
    checkboxSection.classList.remove('error');
    checkboxError.classList.remove('show');
  }
});

// ------------------------------
// Continue button click handler
// ------------------------------
continueBtn.addEventListener('click', function () {
  if (!termsCheckbox.checked) {
    checkboxSection.classList.add('error');
    checkboxError.classList.add('show');

    checkboxSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Store acceptance
  localStorage.setItem('termsAccepted', 'true');
  localStorage.setItem('termsAcceptedDate', new Date().toISOString());

  // Redirect
  window.location.href = 'service06.html';
});

// ------------------------------
// Check if terms were already accepted
// ------------------------------
window.addEventListener('load', function () {
  const termsAccepted = localStorage.getItem('termsAccepted');
  if (termsAccepted === 'true') {
    termsCheckbox.checked = true;
  }
});

// ------------------------------
// Keyboard support
// ------------------------------
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && document.activeElement === continueBtn) {
    continueBtn.click();
  }
});

// Previous Button
document.querySelector('.btn-prev').addEventListener('click', function() {
   // alert('الرجوع إلى صفحة اتفاقية الاستخدام...');
    window.location.href = 'index.html';
});
