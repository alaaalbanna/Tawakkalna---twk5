// =====================================================
// Success Page - Language + Theme handled by js/app_context.js
// =====================================================

/*
 * ***********************************
 * ***********************************
 */
// Format Arabic date
function formatArabicDate(date) {
    const months = [
        'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

// Get service type from localStorage
function getServiceTypeName() {
  // اقرأ التخزين كما هو (بدون تعديل service06)
  const codeRaw =
    localStorage.getItem('serviceCode') ||
    sessionStorage.getItem('serviceCode') ||
    '';

  const typeRaw =
    localStorage.getItem('serviceType') ||
    sessionStorage.getItem('serviceType') ||
    '';

  const code = String(codeRaw).trim().toUpperCase().replace(/[\s-]+/g, '_');
  const type = String(typeRaw).trim().replace(/_/g, ' ');

  // حدد المفتاح من code أولاً (الأكثر ثباتاً)، وإلا من النص العربي
  let i18nKey = 'success.servicetype.issue';

  if (code.includes('REPLACE')) i18nKey = 'success.servicetype.replace';      // REPLACE_LOST etc.
  else if (code.includes('RENEW')) i18nKey = 'success.servicetype.renew';
  else if (code.includes('ISSUE')) i18nKey = 'success.servicetype.issue';
  else {
    // fallback by Arabic words
    if (type.includes('بدل') || type.includes('فاقد')) i18nKey = 'success.servicetype.replace';
    else if (type.includes('تجديد')) i18nKey = 'success.servicetype.renew';
    else i18nKey = 'success.servicetype.issue';
  }

  // ✅ fallback حسب اللغة الحالية (مش عربي ثابت)
  const lang = (window.I18N?.getLang ? window.I18N.getLang() : (document.documentElement.lang || 'ar')).toLowerCase();

  const fallbackAR =
    i18nKey.endsWith('.renew') ? 'طلب تجديد ترخيص' :
    i18nKey.endsWith('.replace') ? 'طلب بدل فاقد' :
    'طلب إصدار ترخيص';

  const fallbackEN =
    i18nKey.endsWith('.renew') ? 'License Renewal Request' :
    i18nKey.endsWith('.replace') ? 'Lost Replacement Request' :
    'License Issuance Request';

  const fallback = (lang === 'en') ? fallbackEN : fallbackAR;

  // ارجع الترجمة إن وجدت، وإلا fallback حسب اللغة
  return window.I18N?.t ? window.I18N.t(i18nKey, fallback) : fallback;
}



/*********************************
function getServiceTypeName() {
  const serviceType = localStorage.getItem('serviceType') || 'ISSUE';

  const keyMap = {
    ISSUE: 'success.servicetype.issue',
    RENEW: 'success.servicetype.renew',
    REPLACE: 'success.servicetype.replace',
    'اصدار': 'success.servicetype.issue',
    'تجديد': 'success.servicetype.renew',
    'بدل_فاقد': 'success.servicetype.replace'
  };

  const i18nKey = keyMap[serviceType] || 'service_issue';

  if (window.I18N && typeof window.I18N.t === 'function') {
    return window.I18N.t(i18nKey);
  }

  // fallback عربي آمن
  return 'طلب إصدار ترخيص';
}
/***************************
function getServiceTypeName() {
    const serviceType = localStorage.getItem('serviceType') || 'اصدار';
    const types = {
        'اصدار': 'طلب إصدار ترخيص',
        'تجديد': 'طلب تجديد ترخيص',
        'بدل_فاقد': 'طلب بدل فاقد'
    };
    return types[serviceType] || 'طلب إصدار ترخيص';
}
************************/
// Get request code from localStorage
function getRequestCode() {
    // Get requestCode from localStorage (saved in service06_api.js)
    const requestCode = localStorage.getItem('requestCode');
    
    if (requestCode) {
        console.log('✅ Request Code from localStorage:', requestCode);
        return requestCode;
    }
    
    // Fallback: try requestId if requestCode not found
    const requestId = localStorage.getItem('requestId');
    if (requestId) {
        console.log('⚠️ Request Code not found, using Request ID:', requestId);
        return `REQ-${requestId}`;
    }
    
    // Last fallback: generate random number
    console.warn('⚠️ No Request Code or ID found in localStorage');
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 99999) + 1;
    return `NCM-${year}-${String(randomNum).padStart(5, '0')}`;
}

// Initialize page
function initializePage() {
    console.log('🎉 Initializing success page...');
    
    // Get and set request code from localStorage
    const requestCode = getRequestCode();
    const requestNumberElement = document.getElementById('requestNumber');
    
    if (requestNumberElement) {
        requestNumberElement.textContent = requestCode;
        console.log('✅ Request Number displayed:', requestCode);
    } else {
        console.error('❌ requestNumber element not found');
    }

    // Set submit date
    function getLang() {
    if (window.APP_CTX && window.APP_CTX.lang) return String(window.APP_CTX.lang).toLowerCase();
    if (document.documentElement.lang) return String(document.documentElement.lang).toLowerCase();
    return "ar";
    }
    function formatEnglishDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date); 
    }

    const today = new Date();
    const submitDateElement = document.getElementById('submitDate');

    if (submitDateElement) {
    const lang = getLang();

    if (lang === 'ar') {
        submitDateElement.textContent = formatArabicDate(today);
    } else {
        submitDateElement.textContent = formatEnglishDate(today);
    }
    }


    /*************************************
    const today = new Date();
    const submitDateElement = document.getElementById('submitDate');
    if (submitDateElement) {
        submitDateElement.textContent = formatArabicDate(today);
        console.log('✅ Submit Date displayed:', formatArabicDate(today));
    }
    ***************************************/
    // Set service type
    const serviceTypeElement = document.getElementById('serviceType');
    if (serviceTypeElement) {
        serviceTypeElement.textContent = getServiceTypeName();
        console.log('✅ Service Type displayed:', getServiceTypeName());
    }

    // Create confetti effect
    createConfetti();
    
    // Log localStorage data for debugging
    console.log('📊 localStorage data:');
    console.log('  requestCode:', localStorage.getItem('requestCode'));
    console.log('  requestId:', localStorage.getItem('requestId'));
    console.log('  serviceType:', localStorage.getItem('serviceType'));
}

// Create confetti animation
function createConfetti() {
    const colors = ['#02712d', '#04a843', '#ffc107', '#2c5aa0'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.opacity = Math.random();
            document.body.appendChild(confetti);

            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 30);
    }
}

// Print confirmation (optional feature)
function printConfirmation() {
    window.print();
}

// Initialize on load
window.addEventListener('load', initializePage);

// Prevent going back to form
window.history.pushState(null, null, window.location.href);
window.onpopstate = function() {
    window.history.pushState(null, null, window.location.href);
};