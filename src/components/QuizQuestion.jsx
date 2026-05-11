function QuizQuestion({
  question,
  questionNumber,
  selectedAnswers,
  isChecked,
  onToggleAnswer,
  onCheckAnswer
}) {
  const selected = selectedAnswers || [];

  const isCorrect = areArraysEqual(
    selected,
    question.correctAnswers
  );

  return (
    <div className="question-card">
      <h2>Question {questionNumber}</h2>

      <p className="question-text">{question.question}</p>

      <p className="small-note">
        Select all correct answers.
      </p>

      {Object.entries(question.options).map(([letter, optionText]) => (
        <label key={letter} className="option">
          <input
            type="checkbox"
            checked={selected.includes(letter)}
            onChange={() => onToggleAnswer(question.id, letter)}
          />
          {letter}. {optionText}
        </label>
      ))}

      <button onClick={() => onCheckAnswer(question.id)}>
        Check Answer
      </button>

      {isChecked && (
        <div className={isCorrect ? "correct-box" : "wrong-box"}>
          <h3>{isCorrect ? "Correct!" : "Wrong Answer"}</h3>

          <p>
            Your Answer:{" "}
            <strong>
              {selected.length > 0 ? selected.join(", ") : "No answer selected"}
            </strong>
          </p>

          <p>
            Correct Answer:{" "}
            <strong>{question.correctAnswers.join(", ")}</strong>
          </p>

          <p>
            <strong>Explanation:</strong> {question.explanation}
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

export default QuizQuestion;