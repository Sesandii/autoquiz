import { useEffect, useState } from "react";
import TeacherPage from "./components/TeacherPage";
import StudentPage from "./components/StudentPage";
import "./App.css";

function App() {
  const [quiz, setQuiz] = useState(null);
  const [currentPage, setCurrentPage] = useState("teacher");

  useEffect(() => {
    const savedQuiz = localStorage.getItem("generatedQuiz");

    if (savedQuiz) {
      setQuiz(JSON.parse(savedQuiz));
    }
  }, []);

  function handleQuizGenerated(newQuiz) {
    setQuiz(newQuiz);
    setCurrentPage("student");
  }

  function handleQuizImported(importedQuiz) {
    setQuiz(importedQuiz);
    setCurrentPage("student");
  }

  return (
    <div>
      {currentPage === "teacher" && (
        <TeacherPage
          onQuizGenerated={handleQuizGenerated}
          onGoToStudent={() => setCurrentPage("student")}
        />
      )}

      {currentPage === "student" && (
        <StudentPage
          quiz={quiz}
          onBackToTeacher={() => setCurrentPage("teacher")}
          onQuizImported={handleQuizImported}
        />
      )}
    </div>
  );
}

export default App;