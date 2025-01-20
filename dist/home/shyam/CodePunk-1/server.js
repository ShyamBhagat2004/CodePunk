"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sqlite3_1 = require("sqlite3");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const db = new sqlite3_1.Database('codepunk.db');
// Middleware to parse JSON and serve static files
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '/public')));
// Endpoint to fetch all questions
app.get('/questions', (req, res) => {
    db.all('SELECT * FROM questions', (err, rows) => {
        if (err) {
            console.error('Error fetching questions:', err.message);
            res.status(500).send('Internal Server Error');
        }
        else {
            const questions = rows.map((row) => ({
                id: row.id,
                question_text: row.question_text,
                options: {
                    A: row.option_a,
                    B: row.option_b,
                    C: row.option_c,
                    D: row.option_d,
                },
                difficulty: row.difficulty,
                tags: row.tags,
            }));
            res.json(questions);
        }
    });
});
// Endpoint to check answers
app.post('/submit', (req, res) => {
    const userAnswers = req.body; // Expecting an array: [{ id, selectedOption }]
    db.all('SELECT * FROM questions', (err, rows) => {
        if (err) {
            console.error('Error fetching questions:', err.message);
            res.status(500).send('Internal Server Error');
        }
        else {
            let correctCount = 0;
            // Validate each answer
            userAnswers.forEach((answer) => {
                const question = rows.find((q) => q.id === answer.id);
                if (question && question.correct_option === answer.selectedOption) {
                    correctCount++;
                }
            });
            // Send response back to the client
            res.json({ correctCount, totalCount: rows.length });
        }
    });
});
// Serve index.html as a fallback for any unmatched routes
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '/public/index.html'));
});
// Start the server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
