const sqlite3 = require('sqlite3');

exports.handler = async (event, context) => {
    const db = new sqlite3.Database('./codepunk.db');

    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM questions', (err, rows) => {
            db.close();

            if (err) {
                console.error('Error fetching questions:', err.message);
                return reject({
                    statusCode: 500,
                    body: JSON.stringify({ error: 'Internal Server Error' }),
                });
            }

            const questions = rows.map(row => ({
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

            resolve({
                statusCode: 200,
                body: JSON.stringify(questions),
            });
        });
    });
};

