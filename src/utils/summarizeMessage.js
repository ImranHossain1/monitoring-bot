export function summarizeMessage(originalMessage) {
  const lines = originalMessage.split("\n");
  const summaries = [];
  let currentIP = "";

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("DETAILS:")) {
      currentIP = lines[i + 1].split(": ")[1];
      summaries.push(`Receipt confirmed for IPv4: ${currentIP} Issue`);
    }
  }

  return summaries.join("\n");
}
