const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'content.json');

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Specific route for uploaded images if they are outside public (adjust if needed)
// Assuming images are inside 'public/images' now, if not we need to map it.
// Based on file structure, images seem to be in root 'images'.
// Let's map root directories to serve static files correctly.
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use(express.static(path.join(__dirname))); // Serve root files like style.css

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Initialize content.json if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
        journey: {
            title: "Our Journey",
            content: "Welcome to our story. This is placeholder text that you can edit from the Admin Panel."
        },
        episodes: [
            { id: 1, title: "Episode 01", description: "Description for episode 1", videoUrl: "https://www.youtube.com/embed/placeholder1" },
            { id: 2, title: "Episode 02", description: "Description for episode 2", videoUrl: "https://www.youtube.com/embed/placeholder2" },
            { id: 3, title: "Episode 03", description: "Description for episode 3", videoUrl: "https://www.youtube.com/embed/placeholder3" }
        ],
        blog: [
            { id: 1, date: "OCTOBER 24, 2024", title: "Finding Balance", summary: "Blog summary..." },
            { id: 2, date: "OCTOBER 10, 2024", title: "Community", summary: "Blog summary..." }
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

// Admin Route (Simple protection could be added here, currently open)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin panel at http://localhost:${PORT}/admin`);
});
