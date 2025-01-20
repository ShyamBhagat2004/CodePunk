const sqlite3 = require('sqlite3');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    const userAnswers = JSON.parse(event.body);
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

            let correctCount = 0;
            userAnswers.forEach(answer => {
                const question = rows.find(q => q.id === answer.id);
                if (question && question.correct_option === answer.selectedOption) {
                    correctCount++;
                }
            });

            resolve({
                statusCode: 200,
                body: JSON.stringify({ correctCount, totalCount: rows.length }),
            });
        });
    });
};

