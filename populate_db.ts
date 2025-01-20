// populate_db.ts

import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

// Define Question Interface
interface Question {
  question_text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_option: 'A' | 'B' | 'C' | 'D';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string;
}

// Paths
const dbPath = path.join(__dirname, 'codepunk.db');
const questionsPath = path.join(__dirname, 'questions.json');

// Read and Parse JSON File
let questions: Question[] = [];

try {
  const rawData = fs.readFileSync(questionsPath, 'utf-8');
  questions = JSON.parse(rawData);
} catch (error) {
  console.error('Error reading or parsing questions.json:', error);
  process.exit(1);
}

// Initialize SQLite Database
const db = new sqlite3.Database(dbPath, (err: Error | null) => {
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
    if (
      !q.question_text ||
      !q.options.A ||
      !q.options.B ||
      !q.options.C ||
      !q.options.D ||
      !['A', 'B', 'C', 'D'].includes(q.correct_option) ||
      !['easy', 'medium', 'hard'].includes(q.difficulty) ||
      !q.tags
    ) {
      console.error(`Invalid question format at index ${index}. Skipping.`);
      return;
    }

    stmt.run(
      q.question_text,
      q.options.A,
      q.options.B,
      q.options.C,
      q.options.D,
      q.correct_option,
      q.difficulty,
      q.tags,
      (err: Error | null) => {
        if (err) {
          console.error(`Error inserting question at index ${index}:`, err.message);
        }
      }
    );
  });

  stmt.finalize((err: Error | null) => {
    if (err) {
      console.error('Error finalizing statement:', err.message);
      db.run('ROLLBACK');
      process.exit(1);
    } else {
      db.run('COMMIT', (err: Error | null) => {
        if (err) {
          console.error('Error committing transaction:', err.message);
          process.exit(1);
        } else {
          console.log('All questions have been inserted successfully.');
          db.close();
        }
      });
    }
  });
});
