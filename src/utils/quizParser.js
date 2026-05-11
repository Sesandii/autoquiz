export function parseMixedQuizText(inputText) {
  if (!inputText || inputText.trim() === "") {
    return {
      title: "Untitled Quiz",
      questions: []
    };
  }

  const normalizedText = inputText.replace(/\r\n/g, "\n");
  const title = extractTitle(normalizedText);

  const questionBlocks = normalizedText
    .split(/\n(?=TYPE:\s*\n)/i)
    .map(block => block.trim())
    .filter(block => /^TYPE:\s*\n/i.test(block));

  const questions = questionBlocks.map((block, index) => {
    const type = extractSectionBetween(block, "TYPE", [
      "SCENARIO",
      "QUESTION",
      "OPTIONS",
      "ANSWER",
      "EXPLANATION"
    ]).toUpperCase();

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

    const explanation = extractSectionBetween(block, "EXPLANATION", [
      "TYPE"
    ]);

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
        id: index + 1,
        type: "MCQ",
        scenario,
        question,
        options,
        correctAnswers,
        answer,
        explanation
      };
    }

    if (type === "STRUCTURED" || type === "ESSAY") {
      return {
        id: index + 1,
        type,
        scenario,
        question,
        options: {},
        correctAnswers: [],
        answer,
        explanation
      };
    }

    return {
      id: index + 1,
      type: "UNKNOWN",
      scenario,
      question,
      options: {},
      correctAnswers: [],
      answer,
      explanation
    };
  });

  return {
    title,
    questions
  };
}

function extractTitle(text) {
  const titleMatch = text.match(/TITLE:\s*([\s\S]*?)(?=\n---|\nTYPE:|$)/i);

  if (titleMatch && titleMatch[1].trim()) {
    return titleMatch[1].trim();
  }

  const firstNonEmptyLine = text
    .split("\n")
    .map(line => line.trim())
    .find(line => line !== "" && !line.startsWith("---"));

  if (!firstNonEmptyLine || /^TYPE:/i.test(firstNonEmptyLine)) {
    return "Untitled Quiz";
  }

  return firstNonEmptyLine;
}

function extractSectionBetween(block, sectionName, nextSectionNames) {
  const nextPattern = nextSectionNames.join("|");

  const regex = new RegExp(
    `${sectionName}:\\s*([\\s\\S]*?)(?=\\n(?:${nextPattern}):|$)`,
    "i"
  );

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