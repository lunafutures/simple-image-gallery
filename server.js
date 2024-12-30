const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configurable title
const TITLE = process.env.TITLE || 'Title Goes HERE';

const app = express();
const PORT = process.env.PORT || 3000;

// Set up upload directory
const UPLOADS_DIR = process.env.IMAGE_DIR || path.join(__dirname, 'uploads');
const TEMPLATE_PATH = path.join(__dirname, 'views', 'index.html');

// Serve static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

// Serve static files (uploaded images)
app.use('/images', express.static(UPLOADS_DIR));

// Upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.json({ message: 'Upload successful!' });
});

// Display the gallery
app.get('/', (req, res) => {
    fs.readFile(TEMPLATE_PATH, 'utf8', (err, template) => {
        if (err) {
            console.error('Failed to load HTML template:', err);
            return res.status(500).send('Internal Server Error');
        }

        fs.readdir(UPLOADS_DIR, (err, files) => {
            if (err) {
                console.error('Failed to read uploads directory:', err);
                return res.status(500).send('Internal Server Error');
            }

            const imageFiles = files.filter(file =>
                /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
            );

            const gallery = imageFiles
                .map(file => `<a href="/images/${file}" target="_blank"><img src="/images/${file}" alt="${file}"></a>`)
                .join('');

            let html = template
                .replace(/{{title}}/g, TITLE)
                .replace('{{gallery}}', gallery);

            res.send(html);
        });
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
