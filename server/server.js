const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const twilio = require('twilio');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// تقديم الملفات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// بيانات Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = new twilio(accountSid, authToken);
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const yourWhatsAppNumber = process.env.YOUR_WHATSAPP_NUMBER;

// التأكد من وجود ملف المواقع
const locationsPath = path.join(__dirname, 'data', 'locations.json');
const locationsDir = path.join(__dirname, 'data');

// إنشاء مجلد data إذا لم يكن موجوداً
if (!fs.existsSync(locationsDir)) {
    fs.mkdirSync(locationsDir);
}

// إنشاء ملف locations.json إذا لم يكن موجوداً
if (!fs.existsSync(locationsPath)) {
    fs.writeFileSync(locationsPath, '[]');
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/submit-location', async (req, res) => {
    try {
        const locationData = req.body;
        
        if (!locationData.latitude || !locationData.longitude) {
            return res.status(400).json({ error: 'بيانات الموقع غير مكتملة' });
        }

        // حفظ الموقع
        const locations = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
        locations.push(locationData);
        fs.writeFileSync(locationsPath, JSON.stringify(locations, null, 2));

        // إرسال إشعار واتساب
        const message = `📍 موقع جديد:\n🌍 https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}\n🎯 الدقة: ${locationData.accuracy} متر`;
        
        const whatsappMsg = await twilioClient.messages.create({
            from: twilioWhatsAppNumber,
            to: yourWhatsAppNumber,
            body: message
        });

        console.log('تم إرسال الإشعار:', whatsappMsg.sid);
        res.json({ success: true, message: 'تم استلام الموقع وإرسال الإشعار بنجاح' });

    } catch (error) {
        console.error('خطأ:', error);
        res.status(500).json({ 
            error: 'حدث خطأ أثناء معالجة الطلب',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`الخادم يعمل على البورت ${PORT}`);
});