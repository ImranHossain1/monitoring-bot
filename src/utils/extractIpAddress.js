// export function extractIPv4(message) {
//   const ipv4Regex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
//   const match = message.match(ipv4Regex);
//   return match ? match[0] : null;
// }

export function countIPAddresses(messages) {
  const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
  const ipCounts = {};

  messages.forEach((message) => {
    const ips = message.match(ipRegex);
    if (ips) {
      ips.forEach((ip) => {
        if (ipCounts[ip]) {
          ipCounts[ip]++;
        } else {
          ipCounts[ip] = 1;
        }
      });
    }
  });

  return ipCounts;
}
