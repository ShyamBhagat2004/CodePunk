import express from 'express';
import { Database } from 'sqlite3';
import path from 'path';

const app = express();
const db = new Database('codepunk.db');

// Define a TypeScript interface for the questions
interface Question {
    id: number;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: string;
    difficulty: string;
    tags: string;
    created_at: string;
}

// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Endpoint to fetch all questions
app.get('/questions', (req, res) => {
    db.all('SELECT * FROM questions', (err, rows: Question[]) => {
        if (err) {
            console.error('Error fetching questions:', err.message);
            res.status(500).send('Internal Server Error');
        } else {
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
    db.all('SELECT * FROM questions', (err, rows: Question[]) => {
        if (err) {
            console.error('Error fetching questions:', err.message);
            res.status(500).send('Internal Server Error');
        } else {
            let correctCount = 0;

            // Validate each answer
            userAnswers.forEach((answer: { id: number; selectedOption: string; }) => {
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
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
