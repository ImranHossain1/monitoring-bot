const emojiMap = {
  OK: "✅", // White heavy check mark
  WARN: "⚠️", // Warning sign
  CRIT: "🆘", // Squared SOS
  ROTATE: "🔄️", // rotated arrows
};

export function extractSummary(message) {
  const lines = message.split("\n");
  for (let line of lines) {
    for (let emoji in emojiMap) {
      if (
        line.includes(emojiMap[emoji]) ||
        line.includes("SERVICE") ||
        line.includes("HOST") ||
        line.includes("State changed")
      ) {
        return line.trim();
      }
    }
  }
  return null;
}

export function extractStateChange(message) {
  const lines = message.split("\n");
  let stateChangeLine = null;
  let additionalLine = null;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("State changed")) {
      stateChangeLine = lines[i].trim();
      if (i + 1 < lines.length && !lines[i + 1].includes("IPv4")) {
        additionalLine = lines[i + 1].trim();
      }
      break;
    }
  }

  if (stateChangeLine) {
    return additionalLine
      ? `${stateChangeLine}\n${additionalLine}`
      : stateChangeLine;
  }

  return null;
}
