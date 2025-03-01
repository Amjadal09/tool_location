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
    keyFile: path.join(__dirname, '../credentials.json'), // مسار ملف بيانات الاعتماد
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID; // معرف Google Sheets

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

        // التحقق من صحة قيمة timestamp
        const validTimestamp = isNaN(new Date(timestamp)) ? new Date() : new Date(timestamp);

        // تخزين البيانات في Google Sheets
        const locationData = [
            `Name: ${name || 'Not provided'}`,
            `Phone: ${phone || 'Not provided'}`,
            `Coordinates: ${latitude}, ${longitude}`,
            `Accuracy: ${accuracy || 'Unknown'}`,
            `Timestamp: ${validTimestamp.toLocaleString('en-US')}`
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:A', // النطاق الذي سيتم إضافة البيانات إليه
            valueInputOption: 'RAW',
            resource: {
                values: locationData.map(item => [item])
            }
        });

        console.log('Data successfully stored in Google Sheets');
        res.json({ 
            success: true, 
            message: 'Location data successfully received' 
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'An error occurred while processing the data' 
        });
    }
});

// للتأكد من أن الخادم يعمل
app.get('/health', (req, res) => {
    res.json({ status: 'ok', env: 'development' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});