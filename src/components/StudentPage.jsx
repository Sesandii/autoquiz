import { useState } from "react";
import QuizQuestion from "./QuizQuestion";

function StudentPage({ quiz, onBackToTeacher, onQuizImported }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [writtenAnswers, setWrittenAnswers] = useState({});
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

  function handleWrittenAnswerChange(questionId, answerText) {
    setWrittenAnswers({
      ...writtenAnswers,
      [questionId]: answerText
    });
  }

  function handleCheckAnswer(questionId) {
    const question = quiz.questions.find(item => item.id === questionId);

    if (!question) {
      return;
    }

    if (question.type === "MCQ") {
      const answers = selectedAnswers[questionId] || [];

      if (answers.length === 0) {
        alert("Please select at least one answer first.");
        return;
      }
    }

    if (question.type === "STRUCTURED" || question.type === "ESSAY") {
      const answerText = writtenAnswers[questionId] || "";

      if (answerText.trim() === "") {
        const shouldContinue = window.confirm(
          "You have not written an answer yet. Do you still want to view the sample answer?"
        );

        if (!shouldContinue) {
          return;
        }
      }
    }

    setCheckedQuestions({
      ...checkedQuestions,
      [questionId]: true
    });
  }

  function calculateMCQScore() {
    return quiz.questions.filter(question => {
      if (question.type !== "MCQ") {
        return false;
      }

      return areArraysEqual(
        selectedAnswers[question.id] || [],
        question.correctAnswers
      );
    }).length;
  }

  function calculateTotalMCQs() {
    return quiz.questions.filter(question => question.type === "MCQ").length;
  }

  function calculateAttemptedQuestions() {
    return quiz.questions.filter(question => {
      if (question.type === "MCQ") {
        return (selectedAnswers[question.id] || []).length > 0;
      }

      return (writtenAnswers[question.id] || "").trim() !== "";
    }).length;
  }

  function calculateStructuredCount() {
    return quiz.questions.filter(question => question.type === "STRUCTURED").length;
  }

  function calculateEssayCount() {
    return quiz.questions.filter(question => question.type === "ESSAY").length;
  }

  function resetAttempt() {
    setSelectedAnswers({});
    setWrittenAnswers({});
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
        This quiz may include MCQs, structured questions, and essay questions.
        MCQs are automatically checked. Structured and essay answers are for self-review using the sample answer.
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
        <p>MCQs: {calculateTotalMCQs()}</p>
        <p>Structured: {calculateStructuredCount()}</p>
        <p>Essay: {calculateEssayCount()}</p>
        <p>Attempted: {calculateAttemptedQuestions()}</p>
      </div>

      {quiz.questions.map((question, index) => (
        <QuizQuestion
          key={question.id}
          question={question}
          questionNumber={index + 1}
          selectedAnswers={selectedAnswers[question.id] || []}
          writtenAnswer={writtenAnswers[question.id] || ""}
          isChecked={checkedQuestions[question.id]}
          onToggleAnswer={handleToggleAnswer}
          onWrittenAnswerChange={handleWrittenAnswerChange}
          onCheckAnswer={handleCheckAnswer}
        />
      ))}

      <button className="main-button" onClick={() => setShowFinalScore(true)}>
        Show Summary
      </button>

      {showFinalScore && (
        <div className="score-box">
          <h2>
            MCQ Score: {calculateMCQScore()} / {calculateTotalMCQs()}
          </h2>

          <p>
            Structured and essay questions are not automatically marked.
            Compare your answer with the sample answer and explanation.
          </p>

          <p>
            Total Attempted Questions: {calculateAttemptedQuestions()} / {quiz.questions.length}
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
      typeof question.type === "string" &&
      typeof question.question === "string" &&
      typeof question.scenario === "string" &&
      question.options &&
      Array.isArray(question.correctAnswers) &&
      typeof question.answer === "string" &&
      typeof question.explanation === "string"
    )
  );
}

export default StudentPage;