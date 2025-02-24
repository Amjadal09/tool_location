# أداة تتبع الموقع مع إشعارات واتساب

هذه الأداة تقوم بتتبع الموقع وإرسال إشعارات عبر واتساب باستخدام خدمة Twilio.

## المتطلبات

- Node.js (الإصدار 14 أو أحدث)
- حساب Twilio (للحصول على إشعارات واتساب)
- متصفح حديث يدعم خدمات تحديد الموقع

## التثبيت

1. قم بتثبيت الاعتمادات:
```bash
npm install
```

2. قم بنسخ ملف `.env.example` إلى `.env` وتعديل المتغيرات:
```bash
cp .env.example .env
```

3. قم بتعديل المتغيرات في ملف `.env`:
- `TWILIO_ACCOUNT_SID`: معرف حساب Twilio
- `TWILIO_AUTH_TOKEN`: رمز المصادقة من Twilio
- `YOUR_WHATSAPP_NUMBER`: رقم الواتساب الخاص بك (مع البادئة whatsapp:+)

## التشغيل

1. تشغيل الخادم:
```bash
npm start
```

2. افتح المتصفح على العنوان:
```
http://localhost:3000
```

## الميزات

- تتبع الموقع بدقة عالية
- إرسال إشعارات واتساب فورية
- معالجة الأخطاء وحالات عدم الاتصال
- واجهة مستخدم سهلة الاستخدام

## الأمان

- يتم تخزين جميع المتغيرات الحساسة في ملف `.env`
- يتم التحقق من صحة البيانات قبل المعالجة
- حماية CORS مفعلة

## الدعم

إذا واجهت أي مشاكل أو لديك أسئلة، يرجى فتح issue في هذا المشروع.
