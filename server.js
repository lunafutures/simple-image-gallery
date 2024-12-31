const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const TITLE = process.env.TITLE || 'Title Goes HERE';
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();

const UPLOADS_DIR = process.env.IMAGE_DIR || path.join(__dirname, 'uploads');
const TEMPLATE_PATH = path.join(__dirname, 'views', 'index.html');

// statically serve any files in public/
app.use(express.static(path.join(__dirname, 'public')));

// create upload directory if not exist
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

app.use('/images', express.static(UPLOADS_DIR));

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.json({ message: 'Upload successful!' });
});

app.get('/', (_req, res) => {
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

app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
