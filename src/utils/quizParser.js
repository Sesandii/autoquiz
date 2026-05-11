export function parseSeparatedQuizTexts({
  titleText,
  mcqText,
  structuredText,
  essayText
}) {
  const title = titleText && titleText.trim()
    ? titleText.trim()
    : "Untitled Quiz";

  const mcqQuestions = parseQuestionGroup(mcqText, "MCQ");
  const structuredQuestions = parseQuestionGroup(structuredText, "STRUCTURED");
  const essayQuestions = parseQuestionGroup(essayText, "ESSAY");

  const questions = [
    ...mcqQuestions,
    ...structuredQuestions,
    ...essayQuestions
  ].map((question, index) => ({
    ...question,
    id: index + 1
  }));

  return {
    title,
    questions
  };
}

function parseQuestionGroup(text, type) {
  if (!text || text.trim() === "") {
    return [];
  }

  const normalizedText = text.replace(/\r\n/g, "\n");

  const blocks = normalizedText
    .split(/\n-{3,}\n/)
    .map(block => block.trim())
    .filter(block => block.includes("QUESTION:"));

  return blocks.map(block => {
    const scenario = extractSectionBetween(block, "SCENARIO", [
      "QUESTION",
      "OPTIONS",
      "ANSWER",
      "EXPLANATION"
    ]);

    const question = extractSectionBetween(block, "QUESTION", [
      "OPTIONS",
      "ANSWER",
      "EXPLANATION"
    ]);

    const answer = extractSectionBetween(block, "ANSWER", [
      "EXPLANATION"
    ]);

    const explanation = extractSectionBetween(block, "EXPLANATION", []);

    if (type === "MCQ") {
      const optionsText = extractSectionBetween(block, "OPTIONS", [
        "ANSWER",
        "EXPLANATION"
      ]);

      const options = extractOptions(optionsText);

      const correctAnswers = answer
        .split(",")
        .map(item => item.trim().toUpperCase())
        .filter(item => /^[A-Z]$/.test(item));

      return {
        id: 0,
        type: "MCQ",
        scenario,
        question,
        options,
        correctAnswers,
        answer,
        explanation
      };
    }

    return {
      id: 0,
      type,
      scenario,
      question,
      options: {},
      correctAnswers: [],
      answer,
      explanation
    };
  });
}

function extractSectionBetween(block, sectionName, nextSectionNames) {
  let regex;

  if (nextSectionNames.length === 0) {
    regex = new RegExp(`${sectionName}:\\s*([\\s\\S]*)`, "i");
  } else {
    const nextPattern = nextSectionNames.join("|");

    regex = new RegExp(
      `${sectionName}:\\s*([\\s\\S]*?)(?=\\n(?:${nextPattern}):|$)`,
      "i"
    );
  }

  const match = block.match(regex);

  return match ? match[1].trim() : "";
}

function extractOptions(optionsText) {
  const options = {};

  if (!optionsText) {
    return options;
  }

  const optionMatches = optionsText.matchAll(
    /^([A-Z])\.\s*([\s\S]*?)(?=^\s*[A-Z]\.\s|\s*$)/gm
  );

  for (const match of optionMatches) {
    const letter = match[1].trim().toUpperCase();
    const text = match[2].trim();

    options[letter] = text;
  }

  return options;
}