import { useState } from "react";
import QuizQuestion from "./QuizQuestion";

function StudentPage({ quiz, onBackToTeacher, onQuizImported }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [checkedQuestions, setCheckedQuestions] = useState({});
  const [showFinalScore, setShowFinalScore] = useState(false);

  function handleToggleAnswer(questionId, answer) {
    const currentAnswers = selectedAnswers[questionId] || [];

    let updatedAnswers;

    if (currentAnswers.includes(answer)) {
      updatedAnswers = currentAnswers.filter(item => item !== answer);
    } else {
      updatedAnswers = [...currentAnswers, answer];
    }

    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: updatedAnswers
    });
  }

  function handleCheckAnswer(questionId) {
    const answers = selectedAnswers[questionId] || [];

    if (answers.length === 0) {
      alert("Please select at least one answer first.");
      return;
    }

    setCheckedQuestions({
      ...checkedQuestions,
      [questionId]: true
    });
  }

  function calculateScore() {
    return quiz.questions.filter(question =>
      areArraysEqual(
        selectedAnswers[question.id] || [],
        question.correctAnswers
      )
    ).length;
  }

  function calculateAttemptedQuestions() {
    return Object.keys(selectedAnswers).filter(
      questionId => selectedAnswers[questionId].length > 0
    ).length;
  }

  function resetAttempt() {
    setSelectedAnswers({});
    setCheckedQuestions({});
    setShowFinalScore(false);
  }

  function handleImportQuiz(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = function () {
      try {
        const importedQuiz = JSON.parse(reader.result);

        if (!isValidQuiz(importedQuiz)) {
          alert("Invalid quiz file. Please import a valid AutoQuiz JSON file.");
          return;
        }

        localStorage.setItem("generatedQuiz", JSON.stringify(importedQuiz));
        onQuizImported(importedQuiz);
        resetAttempt();
        alert("Quiz imported successfully!");
      } catch (error) {
        alert("Could not read this file. Please select a valid JSON quiz file.");
      }
    };

    reader.readAsText(file);
  }

  if (!quiz) {
    return (
      <div className="page">
        <h1>No Quiz Loaded</h1>

        <p className="description">
          Import a quiz JSON file to start answering questions.
        </p>

        <label className="import-button">
          Import Quiz File
          <input
            type="file"
            accept="application/json"
            onChange={handleImportQuiz}
            hidden
          />
        </label>

        <button onClick={onBackToTeacher}>Back to Teacher Page</button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>{quiz.title}</h1>

      <p className="description">
        These are multiple-selection MCQs. Some questions may have more than one correct answer.
      </p>

      <div className="button-row">
        <button onClick={onBackToTeacher}>Back to Teacher Page</button>
        <button onClick={resetAttempt}>Reset Attempt</button>

        <label className="import-button">
          Import Another Quiz
          <input
            type="file"
            accept="application/json"
            onChange={handleImportQuiz}
            hidden
          />
        </label>
      </div>

      <div className="quiz-summary">
        <p>Total Questions: {quiz.questions.length}</p>
        <p>Attempted: {calculateAttemptedQuestions()}</p>
      </div>

      {quiz.questions.map((question, index) => (
        <QuizQuestion
          key={question.id}
          question={question}
          questionNumber={index + 1}
          selectedAnswers={selectedAnswers[question.id] || []}
          isChecked={checkedQuestions[question.id]}
          onToggleAnswer={handleToggleAnswer}
          onCheckAnswer={handleCheckAnswer}
        />
      ))}

      <button className="main-button" onClick={() => setShowFinalScore(true)}>
        Show Final Score
      </button>

      {showFinalScore && (
        <div className="score-box">
          <h2>
            Your Score: {calculateScore()} / {quiz.questions.length}
          </h2>

          <p>
            You answered {calculateScore()} questions fully correctly.
          </p>
        </div>
      )}
    </div>
  );
}

function areArraysEqual(firstArray, secondArray) {
  if (!firstArray || !secondArray) {
    return false;
  }

  const sortedFirst = [...firstArray].sort();
  const sortedSecond = [...secondArray].sort();

  if (sortedFirst.length !== sortedSecond.length) {
    return false;
  }

  return sortedFirst.every((value, index) => value === sortedSecond[index]);
}

function isValidQuiz(quiz) {
  return (
    quiz &&
    typeof quiz.title === "string" &&
    Array.isArray(quiz.questions) &&
    quiz.questions.length > 0 &&
    quiz.questions.every(question =>
      typeof question.id === "number" &&
      typeof question.question === "string" &&
      question.options &&
      Array.isArray(question.correctAnswers) &&
      typeof question.explanation === "string"
    )
  );
}

export default StudentPage;