# أداة تتبع الموقع وإرسال إشعار واتساب

## مقدمة
هذه الأداة تتيح لك تتبع موقع المستخدم وإرسال إشعار عبر واتساب. يتم تخزين بيانات الموقع في Google Sheets.

## المتطلبات
- Node.js
- npm
- حساب Google Cloud مفعّل عليه Google Sheets API

## الإعداد

### 1. استنساخ المستودع
```bash
git clone <repository-url>
cd Tool
```

### 2. تثبيت التبعيات
```bash
npm install
```

### 3. إعداد Google Sheets API
- انتقل إلى [Google Cloud Console](https://console.cloud.google.com/).
- أنشئ مشروعًا جديدًا أو استخدم مشروعًا موجودًا.
- فعّل Google Sheets API.
- أنشئ بيانات اعتماد OAuth 2.0 (OAuth 2.0 Client ID) واحفظ ملف JSON الذي يحتوي على بيانات الاعتماد.
- قم بتنزيل ملف JSON الذي يحتوي على بيانات الاعتماد واحفظه باسم `credentials.json` في جذر المشروع.

### الخطوات لتفعيل Google Sheets API

1. **فتح Google Cloud Console**:
   - انتقل إلى [Google Cloud Console](https://console.cloud.google.com/).

2. **اختيار المشروع**:
   - اختر المشروع الذي تستخدمه في تطبيقك.

3. **تفعيل Google Sheets API**:
   - انتقل إلى [Google Sheets API](https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=320916103643).
   - اضغط على زر "Enable" لتفعيل Google Sheets API.

4. **الانتظار لبضع دقائق**:
   - انتظر لبضع دقائق حتى يتم تفعيل Google Sheets API بشكل كامل.

### 4. استخراج معرف Google Sheets
- افتح Google Sheets الذي تريد استخدامه.
- انسخ الرابط من شريط العنوان.
- استخرج معرف Google Sheets من الرابط. معرف Google Sheets هو الجزء الموجود بين `/d/` و `/edit` في الرابط.

### 5. إعداد متغيرات البيئة
قم بإنشاء ملف `.env` في جذر المشروع وأضف الإعدادات التالية:
```properties
# Server Configuration
PORT=3001
NODE_ENV=development

# Google Sheets Configuration
SPREADSHEET_ID=1y-xQf_k-UOnA6bIkgIy9cWjWJX4wIHGK82nlQukBC1E
```

### 6. تشغيل الخادم
```bash
npm start
```

## الاستخدام

### 1. فتح الصفحة الرئيسية
افتح متصفح الويب وانتقل إلى `http://localhost:3001`.

### 2. إدخال البيانات
- أدخل اسمك ورقم هاتفك.
- اضغط على زر "تأكيد استلام الجائزة".

### 3. تتبع الموقع
سيتم طلب إذن الوصول إلى الموقع. بعد الموافقة، سيتم إرسال بيانات الموقع إلى الخادم وتخزينها في Google Sheets.

## الملفات

### /server/server.js
هذا الملف يحتوي على كود الخادم الذي يستقبل بيانات الموقع ويخزنها في Google Sheets.

### /public/index.html
هذا الملف يحتوي على الواجهة الأمامية التي تتيح للمستخدم إدخال بياناته وإرسالها إلى الخادم.

### /credentials.json
هذا الملف يحتوي على بيانات الاعتماد للوصول إلى Google Sheets API.

## الترخيص
هذا المشروع مرخص تحت [MIT License](LICENSE).
