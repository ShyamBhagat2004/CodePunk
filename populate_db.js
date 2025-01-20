// populate_db.js

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Path to the SQLite database
const DB_PATH = path.join(__dirname, 'codepunk.db');

// Path to the questions.json file
const QUESTIONS_JSON_PATH = path.join(__dirname, 'questions.json');

// Read and parse the JSON file
let rawData;
try {
    rawData = fs.readFileSync(QUESTIONS_JSON_PATH, 'utf-8');
} catch (err) {
    console.error(`Error reading ${QUESTIONS_JSON_PATH}:`, err.message);
    process.exit(1);
}

let questions;
try {
    questions = JSON.parse(rawData);
} catch (err) {
    console.error(`Error parsing JSON data from ${QUESTIONS_JSON_PATH}:`, err.message);
    process.exit(1);
}

if (!Array.isArray(questions)) {
    console.error('Invalid JSON format: Expected an array of questions.');
    process.exit(1);
}

// Initialize the SQLite database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error(`Error connecting to SQLite database at ${DB_PATH}:`, err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

// Function to insert questions into the database
function insertQuestions(db, questions) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Begin Transaction
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

            questions.forEach((question, index) => {
                const {
                    question_text,
                    options,
                    correct_option,
                    difficulty,
                    tags
                } = question;

                // Validate fields
                if (
                    !question_text ||
                    !options ||
                    !options.A ||
                    !options.B ||
                    !options.C ||
                    !options.D ||
                    !['A', 'B', 'C', 'D'].includes(correct_option) ||
                    !['easy', 'medium', 'hard'].includes(difficulty) ||
                    !tags
                ) {
                    console.error(`Invalid data format for question at index ${index}. Skipping.`);
                    return; // Skip invalid entries
                }

                stmt.run(
                    question_text,
                    options.A,
                    options.B,
                    options.C,
                    options.D,
                    correct_option,
                    difficulty,
                    tags,
                    (err) => {
                        if (err) {
                            console.error(`Error inserting question at index ${index}:`, err.message);
                        }
                    }
                );
            });

            stmt.finalize((err) => {
                if (err) {
                    console.error('Error finalizing statement:', err.message);
                    db.run('ROLLBACK');
                    reject(err);
                } else {
                    // Commit Transaction
                    db.run('COMMIT', (err) => {
                        if (err) {
                            console.error('Error committing transaction:', err.message);
                            reject(err);
                        } else {
                            console.log('All questions have been inserted successfully.');
                            resolve();
                        }
                    });
                }
            });
        });
    });
}

// Execute the insertion
insertQuestions(db, questions)
    .then(() => {
        db.close((err) => {
            if (err) {
                console.error('Error closing the database connection:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    })
    .catch((err) => {
        console.error('An error occurred during the insertion process:', err.message);
        db.close();
    });

