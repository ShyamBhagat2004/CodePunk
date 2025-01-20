"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = require("sqlite3");
const fs = __importStar(require("fs"));
const db = new sqlite3_1.Database('codepunk.db');
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
    questions.forEach((q) => {
        stmt.run(q.question_text, q.options.A, q.options.B, q.options.C, q.options.D, q.correct_option, q.difficulty, q.tags);
    });
    stmt.finalize();
});
db.close(() => {
    console.log('Database populated successfully!');
});
