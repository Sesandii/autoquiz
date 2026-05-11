import { useState } from "react";
import { parseMixedQuizText } from "../utils/quizParser";

function TeacherPage({ onQuizGenerated, onGoToStudent }) {
  const [quizText, setQuizText] = useState("");
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  const sampleText = `TITLE:
Distributed Systems Mixed Practice Quiz

---

TYPE:
MCQ

QUESTION:
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

TYPE:
STRUCTURED

SCENARIO:
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
The scenario focuses on continuing service despite server failure. A strong answer should mention fault tolerance, availability, replication, and consistency.

---

TYPE:
ESSAY

QUESTION:
Explain the difference between client-server architecture and peer-to-peer architecture.

ANSWER:
Client-server architecture has dedicated servers that provide services and clients that request those services. It is easier to manage centrally, but the server can become a bottleneck or single point of failure.

Peer-to-peer architecture allows peers to act as both clients and servers. Peers can share resources directly with each other. This improves scalability and load distribution, but resource discovery, security, and peer availability can become challenging.

Therefore, client-server architecture is suitable when centralized control is needed, while peer-to-peer architecture is suitable when distributed resource sharing and scalability are important.

EXPLANATION:
A strong essay should define both architectures, compare control, scalability, failure points, and give suitable use cases.`;

  function handleGenerateQuiz() {
    const quiz = parseMixedQuizText(quizText);

    if (quiz.questions.length === 0) {
      alert("Please paste valid quiz content first.");
      return;
    }

    const invalidQuestions = quiz.questions.filter(
      question => !question.type || question.type === "UNKNOWN" || !question.question
    );

    if (invalidQuestions.length > 0) {
      alert("Some questions have invalid format. Please check TYPE and QUESTION sections.");
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
    setQuizText(sampleText);
  }

  return (
    <div className="page">
      <h1>Teacher Quiz Generator</h1>

      <p className="description">
        Paste MCQs, structured questions, and essay questions in the required format.
        Then generate the quiz and export it as a JSON file for students.
      </p>

      <div className="format-box">
        <h3>Supported Question Types</h3>
        <p><strong>MCQ:</strong> Students select one or more answers.</p>
        <p><strong>STRUCTURED:</strong> Students type a short/medium answer and compare with the sample answer.</p>
        <p><strong>ESSAY:</strong> Students type a long answer and compare with the sample essay answer.</p>
      </div>

      <div className="format-box">
        <h3>Required Format</h3>
        <pre>{`TITLE:
Your Quiz Title

---

TYPE:
MCQ

QUESTION:
Your MCQ question here?

OPTIONS:
A. Option one
B. Option two
C. Option three
D. Option four
E. Option five

ANSWER:
A, C

EXPLANATION:
Explanation for the answer.

---

TYPE:
STRUCTURED

SCENARIO:
Optional scenario here.

QUESTION:
a) First sub question
b) Second sub question

ANSWER:
Sample structured answer here.

EXPLANATION:
Explanation or marking points here.

---

TYPE:
ESSAY

QUESTION:
Essay question here.

ANSWER:
Sample essay answer here.

EXPLANATION:
Explanation or key points here.`}</pre>
      </div>

      <div className="button-row">
        <button onClick={loadSample}>Load Sample</button>
        <button onClick={onGoToStudent}>Go to Student Quiz</button>
      </div>

      <label className="input-label">Quiz Content</label>
      <textarea
        value={quizText}
        onChange={(e) => setQuizText(e.target.value)}
        placeholder="Paste your full quiz content here..."
        rows="26"
      />

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