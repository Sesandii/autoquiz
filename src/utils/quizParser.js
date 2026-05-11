export function parseQuizFromSeparateTexts(questionText, explanationText) {
  if (!questionText || questionText.trim() === "") {
    return {
      title: "Untitled Quiz",
      questions: []
    };
  }

  const title = extractTitle(questionText);
  const answerKey = extractAnswerKey(questionText);
  const questionsOnlyText = questionText.split(/Answer Key/i)[0];

  const questionBlocks = questionsOnlyText
    .split(/\n(?=\d+\.\s)/)
    .map(block => block.trim())
    .filter(block => /^\d+\.\s/.test(block));

  const explanations = extractExplanations(explanationText);

  const questions = questionBlocks.map((block, index) => {
    const questionNumber = index + 1;

    const questionMatch = block.match(/^\d+\.\s*([\s\S]*?)(?=\nA\.)/i);

    const optionAMatch = block.match(/\nA\.\s*([\s\S]*?)(?=\nB\.)/i);
    const optionBMatch = block.match(/\nB\.\s*([\s\S]*?)(?=\nC\.)/i);
    const optionCMatch = block.match(/\nC\.\s*([\s\S]*?)(?=\nD\.)/i);
    const optionDMatch = block.match(/\nD\.\s*([\s\S]*?)(?=\nE\.)/i);
    const optionEMatch = block.match(/\nE\.\s*([\s\S]*)/i);

    return {
      id: questionNumber,
      question: questionMatch ? questionMatch[1].trim() : "",
      options: {
        A: optionAMatch ? optionAMatch[1].trim() : "",
        B: optionBMatch ? optionBMatch[1].trim() : "",
        C: optionCMatch ? optionCMatch[1].trim() : "",
        D: optionDMatch ? optionDMatch[1].trim() : "",
        E: optionEMatch ? optionEMatch[1].trim() : ""
      },
      correctAnswers: answerKey[index] || [],
      explanation: explanations[questionNumber] || "No explanation provided."
    };
  });

  return {
    title,
    questions
  };
}

function extractTitle(text) {
  const firstLine = text.split("\n").find(line => line.trim() !== "");

  if (!firstLine) {
    return "Untitled Quiz";
  }

  return firstLine.trim();
}

function extractAnswerKey(text) {
  const answerKeySection = text.split(/Answer Key/i)[1];

  if (!answerKeySection) {
    return [];
  }

  return answerKeySection
    .split("\n")
    .map(line => line.trim())
    .filter(line => /^[A-E](,\s*[A-E])*$/.test(line))
    .map(line =>
      line
        .split(",")
        .map(answer => answer.trim().toUpperCase())
    );
}

function extractExplanations(text) {
  const explanations = {};

  if (!text || text.trim() === "") {
    return explanations;
  }

  const blocks = text
    .split(/\n(?=\d+\.\s*Answer:)/)
    .map(block => block.trim())
    .filter(block => /^\d+\.\s*Answer:/i.test(block));

  blocks.forEach(block => {
    const numberMatch = block.match(/^(\d+)\.\s*Answer:/i);
    const explanationMatch = block.match(/^(\d+)\.\s*Answer:\s*[A-E,\s]+\n\n([\s\S]*)/i);

    if (numberMatch) {
      const questionNumber = Number(numberMatch[1]);

      const explanation = explanationMatch
        ? explanationMatch[2].trim()
        : block.replace(/^(\d+)\.\s*Answer:\s*[A-E,\s]+/i, "").trim();

      explanations[questionNumber] = explanation;
    }
  });

  return explanations;
}