require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');

const app = express();
const port = process.env.PORT || 3001;

// تأكد من وجود SPREADSHEET_ID
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
if (!SPREADSHEET_ID) {
    console.error('SPREADSHEET_ID is not set in environment variables');
    process.exit(1);
}

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

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.post('/send-location', async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('SPREADSHEET_ID:', SPREADSHEET_ID);

        const { latitude, longitude, accuracy, timestamp, name, phone } = req.body;

        if (!latitude || !longitude) {
            console.log('Missing coordinates');
            return res.status(400).json({ 
                success: false,
                error: 'Location coordinates are required' 
            });
        }

        const locationData = [
            [
                name || 'Not provided',
                phone || 'Not provided',
                String(latitude),
                String(longitude),
                String(accuracy || 'Unknown'),
                new Date(timestamp || Date.now()).toLocaleString('en-US')
            ]
        ];

        console.log('Attempting to write to sheet:', locationData);

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:F',
            valueInputOption: 'RAW',
            requestBody: {
                values: locationData
            }
        });

        console.log('Sheets API Response:', response.data);

        res.json({ 
            success: true, 
            message: 'Location data successfully received' 
        });

    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error processing data',
            details: error.message 
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        spreadsheetId: !!SPREADSHEET_ID,
        env: process.env.NODE_ENV
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('SPREADSHEET_ID is set:', !!SPREADSHEET_ID);
});