/* ==========================================
    API Integration - No Navigation on Error
    ========================================== */

(function() {
    'use strict';

    // -----------------------------------------------------
    // Service Code (stable across languages)
    // ISSUE | RENEW | REPLACE_LOST
    // -----------------------------------------------------
    function mapPermitCatToServiceCode(permitCatValue) {
        const v = String(permitCatValue ?? '').trim();
        if (v === '49') return 'RENEW';
        if (v === '48') return 'ISSUE';
        return 'REPLACE_LOST';
    }

    function persistServiceContext(serviceCode, permitCatValue) {
        try {
            sessionStorage.setItem('serviceCode', serviceCode);
            localStorage.setItem('serviceCode', serviceCode);

            // backward-compat keys (old logic)
            const arText = serviceCode === 'ISSUE' ? 'اصدار' : (serviceCode === 'RENEW' ? 'تجديد' : 'بدل_فاقد');
            sessionStorage.setItem('serviceType', arText);
            localStorage.setItem('serviceType', arText);

            if (permitCatValue !== undefined && permitCatValue !== null) {
                sessionStorage.setItem('PERMIT_CAT', String(permitCatValue));
                localStorage.setItem('PERMIT_CAT', String(permitCatValue));
            }
        } catch (e) {
            console.warn('⚠️ Unable to persist service context:', e);
        }
    }

    function redirectToAttachments(serviceCode, requestId) {
        const qs = new URLSearchParams();
        if (serviceCode) qs.set('serviceCode', serviceCode);
        if (requestId) qs.set('ID', String(requestId));
        window.location.href = 'attachment.html?' + qs.toString();
        //window.location.href = "success.html";
    }

    
    const nextBtn = document.getElementById('nextBtn');
    if (!nextBtn) {
        console.error('❌ Next button not found');
        return;
    }
    
    const newNextBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    
    console.log('✅ API Integration initialized');
    
    newNextBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('🔘 Submit button clicked');
        
        if (!validateForm()) {
            console.log('⚠️ Validation failed');
            const firstError = document.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        console.log('✅ Validation passed');
        
        this.disabled = true;
        const originalText = this.textContent;
       // this.textContent = 'جاري الحفظ...';
       const savingText =
        (window.I18N && typeof window.I18N.t === 'function')
            ? window.I18N.t('service05.btn.next.saving')
            : 'جاري الحفظ...';

        this.textContent = savingText;
        
        const urlParams = new URLSearchParams(window.location.search);
        const reqNo = urlParams.get('ID') || urlParams.get('id');
        const isEditMode = !!reqNo;
        
        const apiUrl = 'https://webservice.ncm.gov.sa/ncmapp/api_utility_sch/epermits/request';
        
        try {
            if (isEditMode) {
                console.log('🔄 Update mode - ID:', reqNo);
                
                const updatePayload = {
                    ID: reqNo,
                    PRM_SERVICE_ID: 5,
                    APPLICANT_NAME: (document.getElementById('fullName')?.value || '').trim(),
                    PERMIT_TYPE: Number(document.getElementById('documentTypeValue')?.value || 0),
                    PERMIT_VALI_PERIOD: Number(document.getElementById('documentDurationValue')?.value || 0),
                    PERMIT_CAT: Number(document.getElementById('serviceTypeValue')?.value || 0),
                    ID_NO_1: (document.getElementById('nationalId')?.value || '').trim(),
                    DOB: document.getElementById('birthDate')?.value || '',
                    EMAIL: document.getElementById('email')?.value || '',
                    MOBILE_NO: document.getElementById('mobileNumber')?.value || '',
                    CITY: document.getElementById('cityDistrict')?.value || '',
                    SHORT_ADDRESS: document.getElementById('shortAddress')?.value || '',
                    POSTAL_CODE: document.getElementById('postalCode')?.value || '',
                    BUILDING_NO: document.getElementById('buildingNumber')?.value || '',
                    UNIT_NO: document.getElementById('unitNumber')?.value || '',
                    EXTRA_CODE: document.getElementById('additionalCode')?.value || ''
                };
                
                console.log('📦 Update Payload:', updatePayload);
                
                const res = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatePayload)
                });
                
                console.log('📡 Response Status:', res.status);
                
                const responseText = await res.text();
                console.log('📄 Response Text:', responseText);
                
                let data = null;
                try {
                    data = JSON.parse(responseText);
                    console.log('✅ Parsed JSON:', data);
                } catch (parseError) {
                    console.error('❌ JSON Parse Error:', parseError);
                    alert('خطأ في قراءة الاستجابة من الخادم');
                    this.disabled = false;
                    this.textContent = originalText;
                    return;
                }
                
                if (data && data.status === 'ok') {
                    console.log('✅ Success - Redirecting');
                    alert('✅ تم تحديث البيانات بنجاح!');
                    //window.location.href = 'attachment.html'; //?ID=' + encodeURIComponent(reqNo);
                    const permitCatValue = document.getElementById('serviceTypeValue')?.value;
                    const serviceCode = mapPermitCatToServiceCode(permitCatValue);
                    persistServiceContext(serviceCode, permitCatValue);
                    redirectToAttachments(serviceCode, requestId || reqNo);
                } else {
                    const errorMsg = data?.message || 'حدث خطأ في التحديث';
                    console.error('❌ API Error:', data);
                    alert('❌ فشل التحديث:\n\n' + errorMsg);
                    this.disabled = false;
                    this.textContent = originalText;
                    return;
                }
                
            } else {
                console.log('➕ Create mode');

                // ⭐ التحقق من القيم أولاً
                const serviceTypeValue = document.getElementById('serviceTypeValue')?.value;
                const documentTypeValue = document.getElementById('documentTypeValue')?.value;
                const documentDurationValue = document.getElementById('documentDurationValue')?.value;

                console.log('🔍 Values Check:');
                console.log('  serviceTypeValue:', serviceTypeValue);
                console.log('  documentTypeValue:', documentTypeValue);
                console.log('  documentDurationValue:', documentDurationValue);

                // ⭐ التحقق من أن القيم موجودة
                if (!serviceTypeValue || !documentTypeValue || !documentDurationValue) {
                    alert('❌ يرجى اختيار:\n- نوع الخدمة\n- نوع الوثيقة\n- مدة الوثيقة');
                    this.disabled = false;
                    this.textContent = originalText;
                    return;
                }
                
                const createPayload = {
                    PRM_SERVICE_ID: 5,
                    APPLICANT_NAME: (document.getElementById('fullName')?.value || '').trim(),
                    PERMIT_TYPE: Number(document.getElementById('documentTypeValue')?.value || 0),
                    PERMIT_VALI_PERIOD: Number(document.getElementById('documentDurationValue')?.value || 0),
                    PERMIT_CAT: Number(document.getElementById('serviceTypeValue')?.value || 0),
                    ID_NO_1: (document.getElementById('nationalId')?.value || '').trim(),
                    DOB: document.getElementById('birthDate')?.value || '',
                    EMAIL: document.getElementById('email')?.value || '',
                    MOBILE_NO: document.getElementById('mobileNumber')?.value || '',
                    CITY: document.getElementById('cityDistrict')?.value || '',
                    SHORT_ADDRESS: document.getElementById('shortAddress')?.value || '',
                    POSTAL_CODE: document.getElementById('postalCode')?.value || '',
                    BUILDING_NO: document.getElementById('buildingNumber')?.value || '',
                    UNIT_NO: document.getElementById('unitNumber')?.value || '',
                    EXTRA_CODE: document.getElementById('additionalCode')?.value || ''
                };

                console.log('📦 Create Payload:', createPayload);

                // ⭐ التحقق من NaN
                const hasNaN = Object.entries(createPayload).some(([key, value]) => {
                    if (typeof value === 'number' && isNaN(value)) {
                        console.error(`❌ NaN in ${key}:`, value);
                        return true;
                    }
                    return false;
                });

                if (hasNaN) {
                    alert('❌ خطأ في البيانات. يرجى التأكد من ملء جميع الحقول.');
                    this.disabled = false;
                    this.textContent = originalText;
                    return;
                }

                console.log('✅ Payload validated - ready to send');
                                    
                
                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(createPayload)
                });
                
                console.log('📡 Response Status:', res.status);
                
                const responseText = await res.text();
                console.log('📄 Response Text:', responseText);
                
                let data = null;
                try {
                    data = JSON.parse(responseText);
                    console.log('✅ Parsed JSON:', data);
                } catch (parseError) {
                    console.error('❌ JSON Parse Error:', parseError);
                    alert('خطأ في قراءة الاستجابة من الخادم');
                    this.disabled = false;
                    this.textContent = originalText;
                    return;
                }
                
                if (data && data.status === 'ok') {
                    console.log('✅ Success - Redirecting');
                    
                    const requestId = data.request_id || data.REQUEST_ID || data.id || data.ID;
                    const requestCode = data.request_code || data.REQUEST_CODE || '';
                    
                    console.log('🆔 Request ID:', requestId);
                    console.log('🔢 Request Code:', requestCode);
                    
                    const serviceTypeValue = document.getElementById('serviceTypeValue')?.value;
                    const serviceTypeText = 
                        serviceTypeValue === '48' ? 'اصدار' :
                        serviceTypeValue === '49' ? 'تجديد' : 'بدل_فاقد';
                    
                    localStorage.setItem('serviceType', serviceTypeText);
                    localStorage.setItem('formData', JSON.stringify(createPayload));
                    
                    if (requestId) {
                        localStorage.setItem('requestId', String(requestId));
                    }
                    if (requestCode) {
                        localStorage.setItem('requestCode', requestCode);
                    }
                    
                    let successMessage = '✅ تم حفظ البيانات بنجاح!';
                    if (requestId) successMessage += '\n\nرقم الطلب: ' + requestId;
                    if (requestCode) successMessage += '\nرمز الطلب: ' + requestCode;
                    
                    //alert(successMessage);
                    
                    if (requestId) {
                        /////window.location.href = 'attachment.html'; //?ID=' + encodeURIComponent(requestId);
                        const permitCatValue = document.getElementById('serviceTypeValue')?.value;
                    const serviceCode = mapPermitCatToServiceCode(permitCatValue);
                    persistServiceContext(serviceCode, permitCatValue);
                    redirectToAttachments(serviceCode, requestId || reqNo);
                    } else {
                        //////////window.location.href = 'attachment.html';
                        const permitCatValue = document.getElementById('serviceTypeValue')?.value;
                    const serviceCode = mapPermitCatToServiceCode(permitCatValue);
                    persistServiceContext(serviceCode, permitCatValue);
                    redirectToAttachments(serviceCode, requestId || reqNo);
                    }
                    
                } else {
                    const errorMsg = data?.message || 'حدث خطأ في حفظ البيانات';
                    console.error('❌ API Error:', data);
                    alert('❌ فشل حفظ البيانات:\n\n' + errorMsg);
                    this.disabled = false;
                    this.textContent = originalText;
                    return;
                }
            }
            
        } catch (err) {
            console.error('❌ Fetch Error:', err);
            
            let errorMessage = 'تعذر الاتصال بالخدمة';
            if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
                errorMessage = 'فشل الاتصال بالخادم. يرجى التحقق من:\n\n1. الاتصال بالإنترنت\n2. عنوان API صحيح\n3. السماح بالوصول للنطاق (CORS)';
            } else {
                errorMessage += '\n\n' + err.message;
            }
            
            alert(errorMessage);
            this.disabled = false;
            this.textContent = originalText;
            return;
        }
    }, true);
    
    console.log('✅ API code loaded successfully');

    
    
})();