require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');

const app = express();
const port = process.env.PORT || 3001;

// إعداد Google Sheets API
const auth = new google.auth.GoogleAuth({
    credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

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

app.post('/send-location', async (req, res) => {
    try {
        const { latitude, longitude, accuracy, timestamp, name, phone } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ 
                error: 'Location coordinates are required' 
            });
        }

        const locationData = [
            [
                name || 'Not provided',
                phone || 'Not provided',
                latitude,
                longitude,
                accuracy || 'Unknown',
                new Date(timestamp).toLocaleString('en-US')
            ]
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:F',
            valueInputOption: 'RAW',
            resource: {
                values: locationData
            }
        });

        res.json({ 
            success: true, 
            message: 'Location data successfully received' 
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Error processing data' 
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