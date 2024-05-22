import { v4 as uuidv4 } from "uuid";
import { countIPAddresses } from "./extractIpAddress.js";

class SessionManager {
  constructor() {
    this.sessions = {};
  }

  startSession(
    userId,
    message,
    hostGroup,
    saveCallback,
    sendCallback,
    reminderCallback
  ) {
    if (!this.sessions[userId]) {
      this.sessions[userId] = {
        sessionId: uuidv4(),
        messages: [],
        hostGroup: hostGroup, // Store the hostGroup
        confirmed: false,
        sendTimer: null,
        reminderTimer: null,
        messageIds: [], // Store message IDs to update both messages
        aggregatedMessage: "", // Store the aggregated message
      };
    }

    this.sessions[userId].messages.push(message);

    if (!this.sessions[userId].sendTimer) {
      this.sessions[userId].sendTimer = setTimeout(() => {
        this.sendMessages(userId, saveCallback, sendCallback, reminderCallback);
      }, 20000); // 20 seconds
    }
  }

  async sendMessages(userId, saveCallback, sendCallback, reminderCallback) {
    const session = this.sessions[userId];
    if (session) {
      await saveCallback(session.sessionId, session.messages);
      session.aggregatedMessage = this.aggregateMessages(
        session.messages,
        session.hostGroup
      ); // Store the aggregated message
      const messageId = await sendCallback(
        session.sessionId,
        session.aggregatedMessage
      );
      session.messageIds.push(messageId); // Store the message ID

      session.reminderTimer = setTimeout(async () => {
        const reminderMessageId = await this.sendReminder(
          userId,
          reminderCallback
        );
        session.messageIds.push(reminderMessageId); // Store the reminder message ID
      }, 15000); // 15 seconds

      session.messages = [];
      session.sendTimer = null;
    }
  }

  async sendReminder(userId, reminderCallback) {
    const session = this.sessions[userId];
    if (session && !session.confirmed) {
      return await reminderCallback(
        session.sessionId,
        session.aggregatedMessage
      );
    }
  }

  aggregateMessages(messages, hostGroup) {
    const individualIpSummary = countIPAddresses(messages);
    let aggregatedMessage = `You have ${messages.length} new service alerts. Please confirm receipt.\n`;

    for (const [ip, details] of Object.entries(individualIpSummary)) {
      aggregatedMessage +=
        `\n\nSystemd Service Summary: \n${details.firstSummary} -> ${details.lastSummary}\n\n` +
        `OUTPUT:\nTotal: ${details.count} \nInitial State: ${details.firstStateChange}\n` +
        `Current State : ${details.lastStateChange}\n\n\n` +
        `DETAILS:\nIPv4: ${ip}\nHOSTGROUP: ${hostGroup}\n`;
    }

    return aggregatedMessage;
  }

  confirmSession(sessionId) {
    for (const userId in this.sessions) {
      const session = this.sessions[userId];
      if (session && session.sessionId === sessionId) {
        session.confirmed = true;
        clearTimeout(session.reminderTimer);
        this.endSession(userId);
        return session.messageIds; // Return message IDs to update both messages
      }
    }
  }

  endSession(userId) {
    const session = this.sessions[userId];
    if (session) {
      clearTimeout(session.sendTimer);
      clearTimeout(session.reminderTimer);
      delete this.sessions[userId];
    }
  }
}

export default new SessionManager();
