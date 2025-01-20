// src/server.ts

import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file if present
dotenv.config();

// Initialize Express App
const app = express();
const PORT: number = Number(process.env.PORT) || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '/public')));

// Explicit route for '/'
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '/public/index.html'), (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'codepunk.db');
const db = new sqlite3.Database(dbPath, (err: Error | null) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
});

// Define Question Interface
interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string;
  created_at: string;
}

// API Endpoint: Get a Random Question with Optional Difficulty Filter
app.get('/api/questions/random', (req: Request, res: Response) => {
  const { difficulty } = req.query;
  let query = `SELECT * FROM questions`;
  const params: string[] = [];

  if (
    difficulty &&
    (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard')
  ) {
    query += ` WHERE difficulty = ?`;
    params.push(difficulty as string);
  }

  query += ` ORDER BY RANDOM() LIMIT 1`;

  db.get(query, params, (err: Error | null, row: Question | undefined) => {
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
app.post('/api/questions/:id/answer', (req: Request, res: Response) => {
  const { id } = req.params;
  const { selected_option } = req.body;

  // Validate the selected_option
  if (!selected_option || !['A', 'B', 'C', 'D'].includes(selected_option.toUpperCase())) {
    return res.status(400).json({ message: 'Invalid selected_option.' });
  }

  const query = `SELECT correct_option FROM questions WHERE id = ?`;
  db.get(query, [id], (err: Error | null, row: { correct_option: string } | undefined) => {
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
