"use strict";
// populate_db.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Paths
const dbPath = path_1.default.join(__dirname, 'codepunk.db');
const questionsPath = path_1.default.join(__dirname, 'questions.json');
// Read and Parse JSON File
let questions = [];
try {
    const rawData = fs_1.default.readFileSync(questionsPath, 'utf-8');
    questions = JSON.parse(rawData);
}
catch (error) {
    console.error('Error reading or parsing questions.json:', error);
    process.exit(1);
}
// Initialize SQLite Database
const db = new sqlite3_1.default.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});
// Insert Questions into Database
db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    const stmt = db.prepare(`
    INSERT INTO questions (
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      difficulty,
      tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
    questions.forEach((q, index) => {
        if (!q.question_text ||
            !q.options.A ||
            !q.options.B ||
            !q.options.C ||
            !q.options.D ||
            !['A', 'B', 'C', 'D'].includes(q.correct_option) ||
            !['easy', 'medium', 'hard'].includes(q.difficulty) ||
            !q.tags) {
            console.error(`Invalid question format at index ${index}. Skipping.`);
            return;
        }
        stmt.run(q.question_text, q.options.A, q.options.B, q.options.C, q.options.D, q.correct_option, q.difficulty, q.tags, (err) => {
            if (err) {
                console.error(`Error inserting question at index ${index}:`, err.message);
            }
        });
    });
    stmt.finalize((err) => {
        if (err) {
            console.error('Error finalizing statement:', err.message);
            db.run('ROLLBACK');
            process.exit(1);
        }
        else {
            db.run('COMMIT', (err) => {
                if (err) {
                    console.error('Error committing transaction:', err.message);
                    process.exit(1);
                }
                else {
                    console.log('All questions have been inserted successfully.');
                    db.close();
                }
            });
        }
    });
});
