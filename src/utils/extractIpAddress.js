import { extractStateChange, extractSummary } from "./extractDescription.js";

export function countIPAddresses(messages) {
  const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
  const ipCounts = {};

  messages.forEach((message) => {
    const ips = message.match(ipRegex);
    const uniqueIps = new Set(ips); // Use a Set to ensure each IP is counted only once per message

    const summary = extractSummary(message);
    const stateChange = extractStateChange(message);

    uniqueIps.forEach((ip) => {
      if (!ipCounts[ip]) {
        ipCounts[ip] = {
          count: 0,
          summaries: [],
          stateChanges: [],
        };
      }
      ipCounts[ip].count += 1;
      if (summary) {
        ipCounts[ip].summaries.push(summary);
      }
      if (stateChange) {
        ipCounts[ip].stateChanges.push(stateChange);
      }
    });
  });

  // Only keep the first and last summary and state change for each IP
  for (let ip in ipCounts) {
    const summaries = ipCounts[ip].summaries;
    if (summaries.length > 0) {
      ipCounts[ip].firstSummary = summaries[0];
      ipCounts[ip].lastSummary = summaries[summaries.length - 1];
    }
    delete ipCounts[ip].summaries; // Remove the array to avoid confusion

    const stateChanges = ipCounts[ip].stateChanges;
    if (stateChanges.length > 0) {
      ipCounts[ip].firstStateChange = stateChanges[0];
      ipCounts[ip].lastStateChange = stateChanges[stateChanges.length - 1];
    }
    delete ipCounts[ip].stateChanges; // Remove the array to avoid confusion
  }

  return ipCounts;
}
