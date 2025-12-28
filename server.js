const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'content.json');

// Middleware
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Also serve from root for files like style.css if they are not in public (though they should be)
app.use(express.static(path.join(__dirname)));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Initialize content.json if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
        journey: {
            title: "Our Journey",
            content: "<p>Welcome to our story. This is placeholder text that you can edit from the Admin Panel.</p>"
        },
        episodes: [
            { id: 1, title: "Episode 01", description: "Honest conversations about life, culture, and navigating the in-between.", videoUrl: "https://www.youtube.com/embed/placeholder1" }
        ],
        blog: [
            { id: 1, date: "OCTOBER 24, 2024", title: "Finding Balance", summary: "Reflections on walking the path between two worlds..." }
        ]
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// API Routes
app.get('/api/content', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read data' });
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/content', (req, res) => {
    const newData = req.body;
    fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.json({ message: 'Content saved successfully' });
    });
});

// Admin Route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Zampa Bridge CMS Running!`);
    console.log(`-----------------------------`);
    console.log(`Public Site: http://localhost:${PORT}`);
    console.log(`Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`-----------------------------\n`);
});

