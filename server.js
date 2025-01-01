const express = require('express');
const multer = require('multer');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const TITLE = process.env.TITLE || 'Title Goes HERE';
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const BASE_PATH = (process.env.BASE_PATH ?? 'gallery').replace(/^\/|\/$/g, ''); // Remove slashes
function basePath(path='') {
    const cleanPath = path.replace(/^\/|\/$/g, '');
    if (!BASE_PATH) {
        return `/${cleanPath}`;
    }
    return `/${BASE_PATH}/${cleanPath}`;
}

const app = express();

const UPLOADS_DIR = process.env.IMAGE_DIR || path.join(__dirname, 'uploads');
const ROOT_VIEW = 'index';

app.set('view engine', 'ejs'); // Uses ejs without needing a require('ejs')
app.set('views', path.join(__dirname, 'views'));

// setup automatic logging
app.use(morgan('combined'));

// statically serve any files in public/
app.use(basePath(), express.static(path.join(__dirname, 'public')));

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

app.use(basePath('images'), express.static(UPLOADS_DIR));

const upload = multer({ storage: storage });
app.post(basePath('upload'), upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.json({ message: 'Upload successful!' });
});

app.get(basePath('/'), (_req, res) => {
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

        res.render(ROOT_VIEW, { title: TITLE, imagePaths, basePath });
    });
});

app.get(basePath('healthz'), (_req, res) => {
    res.status(200).send('OK');
});

console.log('Registered routes:');
app._router.stack.forEach(layer => {
    if (layer.route) { // Routes registered directly
        console.log(`${Object.keys(layer.route.methods)} -> ${layer.route.path}`);
    } else if (layer.name === 'router') { // Nested routers
        layer.handle.stack.forEach(subLayer => {
            if (subLayer.route) {
                console.log(`${Object.keys(subLayer.route.methods)} -> ${subLayer.route.path}`);
            }
        });
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT} with BASE_PATH=${BASE_PATH}.`);
});
