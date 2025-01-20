import { Database } from 'sqlite3';
import * as fs from 'fs';

const db = new Database('codepunk.db');
const questions = JSON.parse(fs.readFileSync('questions.json', 'utf-8'));

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_text TEXT NOT NULL,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            option_c TEXT NOT NULL,
            option_d TEXT NOT NULL,
            correct_option CHAR(1) NOT NULL,
            difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')) NOT NULL,
            tags TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    const stmt = db.prepare(`
        INSERT INTO questions (
            question_text, option_a, option_b, option_c, option_d,
            correct_option, difficulty, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    questions.forEach((q: any) => {
        stmt.run(
            q.question_text,
            q.options.A,
            q.options.B,
            q.options.C,
            q.options.D,
            q.correct_option,
            q.difficulty,
            q.tags
        );
    });

    stmt.finalize();
});

db.close(() => {
    console.log('Database populated successfully!');
});
