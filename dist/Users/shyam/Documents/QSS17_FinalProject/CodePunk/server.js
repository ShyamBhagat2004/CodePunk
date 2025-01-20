"use strict";
// src/server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file if present
dotenv_1.default.config();
// Initialize Express App
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Serve static files from the 'public' directory
app.use(express_1.default.static(path_1.default.join(__dirname, '/public')));
// Explicit route for '/'
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '/public/index.html'), (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});
// Initialize SQLite Database
const dbPath = path_1.default.join(__dirname, 'codepunk.db');
const db = new sqlite3_1.default.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});
// API Endpoint: Get a Random Question with Optional Difficulty Filter
app.get('/api/questions/random', (req, res) => {
    const { difficulty } = req.query;
    let query = `SELECT * FROM questions`;
    const params = [];
    if (difficulty &&
        (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard')) {
        query += ` WHERE difficulty = ?`;
        params.push(difficulty);
    }
    query += ` ORDER BY RANDOM() LIMIT 1`;
    db.get(query, params, (err, row) => {
        if (err) {
            console.error('Error fetching random question:', err.message);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        if (!row) {
            return res.status(404).json({ message: 'No questions found.' });
        }
        res.json(row);
    });
});
// API Endpoint: Submit an Answer
app.post('/api/questions/:id/answer', (req, res) => {
    const { id } = req.params;
    const { selected_option } = req.body;
    // Validate the selected_option
    if (!selected_option || !['A', 'B', 'C', 'D'].includes(selected_option.toUpperCase())) {
        return res.status(400).json({ message: 'Invalid selected_option.' });
    }
    const query = `SELECT correct_option FROM questions WHERE id = ?`;
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('Error fetching correct option:', err.message);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        if (!row) {
            return res.status(404).json({ message: 'Question not found.' });
        }
        const isCorrect = selected_option.toUpperCase() === row.correct_option;
        res.json({ isCorrect, correct_option: row.correct_option });
    });
});
// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
