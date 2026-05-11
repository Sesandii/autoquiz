import { useState } from "react";
import { parseQuizFromSeparateTexts } from "../utils/quizParser";

function TeacherPage({ onQuizGenerated, onGoToStudent }) {
  const [questionText, setQuestionText] = useState("");
  const [explanationText, setExplanationText] = useState("");
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  function handleGenerateQuiz() {
    const quiz = parseQuizFromSeparateTexts(questionText, explanationText);

    if (quiz.questions.length === 0) {
      alert("Please paste valid questions first.");
      return;
    }

    localStorage.setItem("generatedQuiz", JSON.stringify(quiz));
    setGeneratedQuiz(quiz);
    onQuizGenerated(quiz);
  }

  function handleExportQuiz() {
    const quizToExport =
      generatedQuiz || JSON.parse(localStorage.getItem("generatedQuiz"));

    if (!quizToExport) {
      alert("Please generate a quiz before exporting.");
      return;
    }

    const fileData = JSON.stringify(quizToExport, null, 2);
    const blob = new Blob([fileData], { type: "application/json" });
    const fileUrl = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = fileUrl;
    downloadLink.download = `${makeSafeFileName(quizToExport.title)}.json`;
    downloadLink.click();

    URL.revokeObjectURL(fileUrl);
  }

  function makeSafeFileName(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "autoquiz";
  }

  return (
    <div className="page">
      <h1>Teacher Quiz Generator</h1>

      <p className="description">
        Paste the MCQ question paper with answer key in the first box.
        Paste the explanations in the second box. Then generate and export the quiz file.
      </p>

      <div className="format-box">
        <h3>Required Format</h3>
        <p>
          This version supports multiple-selection questions using options A to E.
          Students will answer using checkboxes.
        </p>
      </div>

      <label className="input-label">Questions + Answer Key</label>
      <textarea
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Paste the MCQs and Answer Key here..."
        rows="18"
      />

      <label className="input-label">Explanations</label>
      <textarea
        value={explanationText}
        onChange={(e) => setExplanationText(e.target.value)}
        placeholder="Paste the explanations here..."
        rows="18"
      />

      <div className="button-row">
        <button className="main-button" onClick={handleGenerateQuiz}>
          Generate Quiz
        </button>

        <button onClick={handleExportQuiz}>
          Export Quiz File
        </button>

        <button onClick={onGoToStudent}>
          Go to Student Quiz
        </button>
      </div>
    </div>
  );
}

export default TeacherPage;