/* *****************************************************
    * *****************************************************
    * ****************** Tawaklna Functions ***************
    * *****************************************************
    * *****************************************************
    * *****************************************************
    */
(function() {
    // Extract clean value from TWK API response
    function extractValue(response) {
        console.log('Raw response:', response);
        
        // Response structure: { success: true, result: { user_id: "123" } }
        if (response && response.success && response.result) {
        // Get the first value from the result object
        const values = Object.values(response.result);
        return values.length > 0 ? values[0] : 'N/A';
        }
        
        return 'Error loading data';
    }

/**************New National Address
 * *********************************************
 * ********************************************* */

//**************National Address ***********************/
async function loadNationalAddress() {
  const fields = {
    buildingNumber: "building_no",
    streetName: "street_name",
    shortAddress: "short_address",
    cityDistrict: "city",
    postalCode: "zip_code",
    districtName: "district_name",
    additionalCode: "additional_no",
    unitNumber: "section_type", // قد لا تكون موجودة في details
  };

  try {
    // Mark all fields as loading
    Object.keys(fields).forEach((inputId) => {
      const input = document.getElementById(inputId);
      if (input) input.classList.add("loading");
    });

    const response = await window.TWK.getUserNationalAddress();
    console.log("National Address Response:", response);

    // 1) تأكد من وجود القائمة
    const addresses = response?.result?.national_addresses;
    if (!response?.success || !Array.isArray(addresses) || addresses.length === 0) {
      throw new Error("No national addresses found");
    }

    // 2) اختر العنوان الأساسي إن وجد، وإلا خذ أول عنصر
    const primary = addresses.find((a) => a?.is_primary_address === true) || addresses[0];

    // 3) التفاصيل المطلوبة
    const details = primary?.details || {};

    // 4) تعبئة الحقول
    Object.entries(fields).forEach(([inputId, apiKey]) => {
      const input = document.getElementById(inputId);
      if (!input) return;

      const value = details[apiKey];  // <-- هنا التغيير المهم
      input.value = value ?? "";      // اتركه فاضي لو ما موجود
      input.classList.remove("loading");
    });
  } catch (error) {
    console.error("Error loading national address:", error);

    Object.keys(fields).forEach((inputId) => {
      const input = document.getElementById(inputId);
      if (input) {
        input.value = "Error loading data";
        input.classList.remove("loading");
      }
    });
  }
}

/**************National Address **********************
    // Load national address and populate individual fields
    async function loadNationalAddress() {
        const fields = {
        'buildingNumber': 'building_no',
        'streetName': 'street_name',
        'shortAddress': 'district_name',
        'cityDistrict': 'city',
        'postalCode': 'zip_code',
        'additionalCode': 'additional_no',
        'unitNumber': 'section_type'
        };

    try {
        // Mark all fields as loading
        Object.keys(fields).forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) input.classList.add('loading');
        });

        // Call the TWK function
        const response = await window.TWK.getUserNationalAddress();
        
        console.log('National Address Response:', response);
        
        var i = 0

        if (response && response.success && response.result.details) {
            // Populate each field
            Object.entries(fields).forEach(([inputId, apiKey]) => {
            const input = document.getElementById(inputId);
            if (input) {
                const value = response.result[apiKey];
                input.value = value || apiKey;
                input.classList.remove('loading');
            }
            });
        } else {
            // Error handling
            Object.keys(fields).forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.value = 'Error loading data';
                input.classList.remove('loading');
            }
            });
        }
        
        } catch (error) {
        console.error('Error loading national address:', error);
        Object.keys(fields).forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
            input.value = 'Error loading data';
            input.classList.remove('loading');
            }
        });
        }
    }
*****************************************/
    // Load user data into input field
    async function loadUserData(inputId, twkFunction) {
        const input = document.getElementById(inputId);
        
        if (!twkFunction || typeof twkFunction !== 'function') {
        input.value = 'Function not available';
        input.classList.remove('loading');
        return;
        }
        
        try {
        input.classList.add('loading');
        
        // Call the TWK function
        const response = await twkFunction();
        
        // Extract and display the value
        const value = extractValue(response);
        input.value = value;
        input.classList.remove('loading');
        
        console.log(`Loaded ${inputId}:`, value);
        
        } catch (error) {
        console.error(`Error loading ${inputId}:`, error);
        input.value = 'Error loading data';
        input.classList.remove('loading');
        }
    }

    // Auto-load all user data when page loads
    window.addEventListener('DOMContentLoaded', function() {
        console.log('Loading user information...');
        
        // Check if TWK is available
        if (typeof window.TWK === 'undefined') {
        console.error('TWK helper not loaded!');
        document.querySelectorAll('input').forEach(input => {
            input.value = 'TWK library not loaded';
        });
        return;
        }
        
        // Load each field
        loadUserData('nationalId', window.TWK.getUserId);
        loadUserData('fullName', window.TWK.getUserFullName);
        loadUserData('birthDate', window.TWK.getUserBirthDate);
        loadUserData('email', window.TWK.getUserEmail);
        loadUserData('mobileNumber', window.TWK.getUserMobileNumber);



        
        // Load national address fields
        loadNationalAddress();
    });
    })();

    /* *****************************************************
        * *****************************************************
        * ************** End Tawaklna Functions ***************
        * *****************************************************
        * *****************************************************
        * *****************************************************
        */      