import { useState } from "react";
import { parseSeparatedQuizTexts } from "../utils/quizParser";

function TeacherPage({ onQuizGenerated, onGoToStudent }) {
  const [titleText, setTitleText] = useState("");
  const [mcqText, setMcqText] = useState("");
  const [structuredText, setStructuredText] = useState("");
  const [essayText, setEssayText] = useState("");
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  const mcqSample = `QUESTION:
Which statements correctly describe TCP sockets?

OPTIONS:
A. Reliable delivery
B. In-order delivery
C. Connection-oriented communication
D. No connection is required
E. Bidirectional communication

ANSWER:
A, B, C, E

EXPLANATION:
TCP provides reliable, ordered, connection-oriented, and bidirectional communication. The statement “no connection is required” describes UDP, not TCP.

---

QUESTION:
Which statements correctly describe UDP sockets?

OPTIONS:
A. Connectionless communication
B. No guaranteed ordering
C. Reliable delivery by default
D. Destination is included with each packet
E. Useful for streaming or broadcasting

ANSWER:
A, B, D, E

EXPLANATION:
UDP is connectionless and does not guarantee reliability or ordering. It is useful when speed is more important than guaranteed delivery.`;

  const structuredSample = `SCENARIO:
An online banking system uses multiple servers. If one server fails, users should still be able to check balances and make payments.

QUESTION:
a) Identify the dependability attribute shown in this scenario.
b) Explain why replication may be useful.
c) State one risk that still needs to be handled.

ANSWER:
a) Availability and fault tolerance are shown.
b) Replication is useful because backup servers can continue service if one server fails.
c) Data consistency is a risk because replicated servers must maintain correct and updated account data.

EXPLANATION:
The scenario focuses on continuing service despite server failure. A strong answer should mention fault tolerance, availability, replication, and consistency.`;

  const essaySample = `QUESTION:
Explain the difference between client-server architecture and peer-to-peer architecture.

ANSWER:
Client-server architecture has dedicated servers that provide services and clients that request those services. It is easier to manage centrally, but the server can become a bottleneck or single point of failure.

Peer-to-peer architecture allows peers to act as both clients and servers. Peers can share resources directly with each other. This improves scalability and load distribution, but resource discovery, security, and peer availability can become challenging.

Therefore, client-server architecture is suitable when centralized control is needed, while peer-to-peer architecture is suitable when distributed resource sharing and scalability are important.

EXPLANATION:
A strong essay should define both architectures, compare control, scalability, failure points, and give suitable use cases.`;

  function handleGenerateQuiz() {
    const quiz = parseSeparatedQuizTexts({
      titleText,
      mcqText,
      structuredText,
      essayText
    });

    if (quiz.questions.length === 0) {
      alert("Please add at least one MCQ, structured question, or essay question.");
      return;
    }

    const invalidQuestions = quiz.questions.filter(question => {
      if (!question.question || !question.answer || !question.explanation) {
        return true;
      }

      if (question.type === "MCQ") {
        return (
          Object.keys(question.options).length === 0 ||
          question.correctAnswers.length === 0
        );
      }

      return false;
    });

    if (invalidQuestions.length > 0) {
      alert(
        "Some questions have invalid format. Please check that every question has QUESTION, ANSWER, and EXPLANATION. MCQs also need OPTIONS."
      );
      return;
    }

    localStorage.setItem("generatedQuiz", JSON.stringify(quiz));
    setGeneratedQuiz(quiz);
    onQuizGenerated(quiz);
  }

  function handleExportQuiz() {
    const savedQuiz = localStorage.getItem("generatedQuiz");
    const quizToExport = generatedQuiz || (savedQuiz ? JSON.parse(savedQuiz) : null);

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
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "autoquiz"
    );
  }

  function loadSample() {
    setTitleText("Distributed Systems Mixed Practice Quiz");
    setMcqText(mcqSample);
    setStructuredText(structuredSample);
    setEssayText(essaySample);
  }

  function clearAll() {
    const shouldClear = window.confirm("Are you sure you want to clear all inputs?");

    if (!shouldClear) {
      return;
    }

    setTitleText("");
    setMcqText("");
    setStructuredText("");
    setEssayText("");
    setGeneratedQuiz(null);
  }

  return (
    <div className="page">
      <h1>Teacher Quiz Generator</h1>

      <p className="description">
        Add MCQs, structured questions, and essay questions in separate sections.
        This makes it easier to manage large question sets.
      </p>

      <div className="format-box">
        <h3>How to Use</h3>
        <p><strong>MCQs:</strong> Add options and correct letters.</p>
        <p><strong>Structured:</strong> Add scenario if needed, question, sample answer, and explanation.</p>
        <p><strong>Essay:</strong> Add essay question, sample answer, and key points.</p>
        <p>Use <strong>---</strong> between questions inside each section.</p>
      </div>

      <div className="button-row">
        <button onClick={loadSample}>Load Sample</button>
        <button onClick={clearAll}>Clear All</button>
        <button onClick={onGoToStudent}>Go to Student Quiz</button>
      </div>

      <label className="input-label">Quiz Title</label>
      <input
        className="title-input"
        type="text"
        value={titleText}
        onChange={(e) => setTitleText(e.target.value)}
        placeholder="Enter quiz title..."
      />

      <div className="section-card">
        <h2>MCQ Questions</h2>
        <p className="small-note">
          Format: QUESTION, OPTIONS, ANSWER, EXPLANATION. Use --- between MCQs.
        </p>

        <textarea
          value={mcqText}
          onChange={(e) => setMcqText(e.target.value)}
          placeholder="Paste MCQ questions here..."
          rows="18"
        />
      </div>

      <div className="section-card">
        <h2>Structured Questions</h2>
        <p className="small-note">
          Format: optional SCENARIO, QUESTION, ANSWER, EXPLANATION. Use --- between questions.
        </p>

        <textarea
          value={structuredText}
          onChange={(e) => setStructuredText(e.target.value)}
          placeholder="Paste structured questions here..."
          rows="18"
        />
      </div>

      <div className="section-card">
        <h2>Essay Questions</h2>
        <p className="small-note">
          Format: QUESTION, ANSWER, EXPLANATION. Use --- between essays.
        </p>

        <textarea
          value={essayText}
          onChange={(e) => setEssayText(e.target.value)}
          placeholder="Paste essay questions here..."
          rows="18"
        />
      </div>

      <div className="button-row">
        <button className="main-button" onClick={handleGenerateQuiz}>
          Generate Quiz
        </button>

        <button onClick={handleExportQuiz}>
          Export Quiz File
        </button>
      </div>
    </div>
  );
}

export default TeacherPage;