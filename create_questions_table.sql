-- create_questions_table.sql

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
);
