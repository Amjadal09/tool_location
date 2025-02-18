const SERVER_URL = window.location.origin;
const statusElement = document.getElementById('status');

function updateStatus(message, isError = false) {
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = isError ? 'error' : 'success';
    }
}

function checkOnline() {
    return navigator.onLine;
}

window.addEventListener('online', () => {
    updateStatus('تم استعادة الاتصال بالإنترنت');
    getAndSendLocation();
});

window.addEventListener('offline', () => {
    updateStatus('لا يوجد اتصال بالإنترنت', true);
});

async function sendLocation(position) {
    if (!checkOnline()) {
        updateStatus('لا يوجد اتصال بالإنترنت', true);
        return;
    }

    const data = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
    };

    try {
        updateStatus('جاري إرسال الموقع...');
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
}

function getAndSendLocation() {
    if (navigator.geolocation) {
        updateStatus('جاري تحديد الموقع...');
        navigator.geolocation.getCurrentPosition(sendLocation, handleError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    } else {
        updateStatus('المتصفح لا يدعم تحديد الموقع', true);
    }
}

document.addEventListener("DOMContentLoaded", getAndSendLocation);