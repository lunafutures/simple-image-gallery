const express = require('express');
const multer = require('multer');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const TITLE = process.env.TITLE || 'Title Goes HERE';
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();

const UPLOADS_DIR = process.env.IMAGE_DIR || path.join(__dirname, 'uploads');
const ROOT_VIEW = 'index';

app.set('view engine', 'ejs'); // Uses ejs without needing a require('ejs')
app.set('views', path.join(__dirname, 'views'));

// setup automatic logging
app.use(morgan('combined'));

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
    fs.readdir(UPLOADS_DIR, (err, files) => {
        if (err) {
            console.error('Failed to read uploads directory:', err);
            return res.status(500).send('Internal Server Error');
        }

        const imagePaths = files
            .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
            .map(file => ({
                name: file,
                time: fs.statSync(path.join(UPLOADS_DIR, file)).ctime
            }))
            .sort((a, b) => b.time - a.time) // Sort newest first
            .map(file => file.name);

        res.render(ROOT_VIEW, { title: TITLE, imagePaths });
    });
});

app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
