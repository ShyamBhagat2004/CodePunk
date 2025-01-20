// public/script.js

document.addEventListener('DOMContentLoaded', () => {
    const questionText = document.getElementById('question-text');
    const optionA = document.getElementById('option-A');
    const optionB = document.getElementById('option-B');
    const optionC = document.getElementById('option-C');
    const optionD = document.getElementById('option-D');
    const optionsForm = document.getElementById('options-form');
    const resultDiv = document.getElementById('result');
    const nextButton = document.getElementById('next-question');
    const difficultySelect = document.getElementById('difficulty');
    const startQuizButton = document.getElementById('start-quiz');
  
    let currentQuestionId = null;
    let score = 0;
    let totalQuestions = 0;
    const MAX_QUESTIONS = 10; // Set desired number of questions per quiz
  
    // Function to fetch a random question from the backend
    const fetchQuestion = async (difficulty = '') => {
      try {
        let url = '/api/questions/random';
        if (difficulty) {
          url += `?difficulty=${difficulty}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch question.');
        }
        const data = await response.json();
        displayQuestion(data);
      } catch (error) {
        questionText.textContent = 'Error loading question.';
        console.error(error);
      }
    };
  
    // Function to display the question and options
    const displayQuestion = (question) => {
      currentQuestionId = question.id;
      questionText.textContent = question.question_text;
      optionA.textContent = question.option_a;
      optionB.textContent = question.option_b;
      optionC.textContent = question.option_c;
      optionD.textContent = question.option_d;
      resultDiv.textContent = '';
      optionsForm.reset();
      nextButton.style.display = 'none';
      optionsForm.style.display = 'block';
    };
  
    // Function to handle form submission
    optionsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(optionsForm);
      const selectedOption = formData.get('option');
  
      try {
        const response = await fetch(`/api/questions/${currentQuestionId}/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ selected_option: selectedOption })
        });
  
        if (!response.ok) {
          throw new Error('Failed to submit answer.');
        }
  
        const result = await response.json();
        displayResult(result, selectedOption);
      } catch (error) {
        resultDiv.textContent = 'Error submitting answer.';
        console.error(error);
      }
    });
  
    // Function to display the result
    const displayResult = (result, selectedOption) => {
      totalQuestions++;
      if (result.isCorrect) {
        score++;
        resultDiv.textContent = `Correct! Score: ${score}/${totalQuestions}`;
        resultDiv.classList.remove('incorrect');
        resultDiv.classList.add('correct');
      } else {
        resultDiv.textContent = `Incorrect. The correct answer was option ${result.correct_option}. Score: ${score}/${totalQuestions}`;
        resultDiv.classList.remove('correct');
        resultDiv.classList.add('incorrect');
      }
  
      optionsForm.style.display = 'none';
  
      if (totalQuestions >= MAX_QUESTIONS) {
        resultDiv.textContent += `\n\nQuiz Completed! Final Score: ${score}/${MAX_QUESTIONS}`;
        nextButton.style.display = 'none';
        return;
      }
  
      nextButton.style.display = 'inline-block';
    };
  
    // Handle clicking the next question button
    nextButton.addEventListener('click', () => {
      fetchQuestion(difficultySelect.value);
    });
  
    // Handle starting the quiz with selected difficulty
    startQuizButton.addEventListener('click', () => {
      score = 0;
      totalQuestions = 0;
      fetchQuestion(difficultySelect.value);
      startQuizButton.disabled = true;
      difficultySelect.disabled = true;
    });
  
    // Initial state
    optionsForm.style.display = 'none';
  });
  