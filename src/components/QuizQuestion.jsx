function QuizQuestion({
  question,
  questionNumber,
  selectedAnswers,
  writtenAnswer,
  isChecked,
  onToggleAnswer,
  onWrittenAnswerChange,
  onCheckAnswer
}) {
  if (question.type === "MCQ") {
    return (
      <MCQQuestion
        question={question}
        questionNumber={questionNumber}
        selectedAnswers={selectedAnswers || []}
        isChecked={isChecked}
        onToggleAnswer={onToggleAnswer}
        onCheckAnswer={onCheckAnswer}
      />
    );
  }

  if (question.type === "STRUCTURED") {
    return (
      <WrittenQuestion
        question={question}
        questionNumber={questionNumber}
        writtenAnswer={writtenAnswer || ""}
        isChecked={isChecked}
        onWrittenAnswerChange={onWrittenAnswerChange}
        onCheckAnswer={onCheckAnswer}
        answerBoxRows={8}
        headingLabel="Structured Question"
        buttonLabel="Show Sample Answer"
      />
    );
  }

  if (question.type === "ESSAY") {
    return (
      <WrittenQuestion
        question={question}
        questionNumber={questionNumber}
        writtenAnswer={writtenAnswer || ""}
        isChecked={isChecked}
        onWrittenAnswerChange={onWrittenAnswerChange}
        onCheckAnswer={onCheckAnswer}
        answerBoxRows={14}
        headingLabel="Essay Question"
        buttonLabel="Show Sample Essay Answer"
      />
    );
  }

  return (
    <div className="question-card">
      <h2>Question {questionNumber}</h2>
      <p>Unsupported question type.</p>
    </div>
  );
}

function MCQQuestion({
  question,
  questionNumber,
  selectedAnswers,
  isChecked,
  onToggleAnswer,
  onCheckAnswer
}) {
  const isCorrect = areArraysEqual(selectedAnswers, question.correctAnswers);

  return (
    <div className="question-card">
      <div className="question-header">
        <h2>Question {questionNumber}</h2>
        <span className="question-type-badge">MCQ</span>
      </div>

      {question.scenario && (
        <div className="scenario-box">
          <strong>Scenario:</strong>
          <p>{question.scenario}</p>
        </div>
      )}

      <p className="question-text">{question.question}</p>

      <p className="small-note">Select all correct answers.</p>

      {Object.entries(question.options).map(([letter, optionText]) => (
        <label key={letter} className="option">
          <input
            type="checkbox"
            checked={selectedAnswers.includes(letter)}
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
              {selectedAnswers.length > 0
                ? selectedAnswers.join(", ")
                : "No answer selected"}
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

function WrittenQuestion({
  question,
  questionNumber,
  writtenAnswer,
  isChecked,
  onWrittenAnswerChange,
  onCheckAnswer,
  answerBoxRows,
  headingLabel,
  buttonLabel
}) {
  return (
    <div className="question-card">
      <div className="question-header">
        <h2>Question {questionNumber}</h2>
        <span className="question-type-badge">{headingLabel}</span>
      </div>

      {question.scenario && (
        <div className="scenario-box">
          <strong>Scenario:</strong>
          <p>{question.scenario}</p>
        </div>
      )}

      <p className="question-text">{question.question}</p>

      <textarea
        className="answer-textarea"
        value={writtenAnswer}
        onChange={(e) => onWrittenAnswerChange(question.id, e.target.value)}
        placeholder="Write your answer here..."
        rows={answerBoxRows}
      />

      <button onClick={() => onCheckAnswer(question.id)}>
        {buttonLabel}
      </button>

      {isChecked && (
        <div className="sample-answer-box">
          <h3>Sample Answer</h3>
          <p className="preserve-lines">{question.answer}</p>

          <h3>Explanation / Key Points</h3>
          <p className="preserve-lines">{question.explanation}</p>
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