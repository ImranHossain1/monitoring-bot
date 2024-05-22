import { v4 as uuidv4 } from "uuid";

class SessionManager {
  constructor() {
    this.sessions = {};
  }

  startSession(userId, message, saveCallback, sendCallback, reminderCallback) {
    // Check if a session already exists for the user
    if (!this.sessions[userId]) {
      this.sessions[userId] = {
        sessionId: uuidv4(),
        messages: [],
        confirmed: false,
        sendTimer: null,
        reminderTimer: null,
      };
    }

    // Add the message to the current session's messages
    this.sessions[userId].messages.push(message);

    // If there is no send timer, start one
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
      await sendCallback(session.sessionId, session.messages).then(() => {
        // Set the reminder timer for 15 seconds after the messages are sent
        session.reminderTimer = setTimeout(() => {
          this.sendReminder(userId, reminderCallback);
        }, 15000); // 15 seconds
      });

      // Reset the session's messages but keep the session active for confirmation
      session.messages = [];
      session.sendTimer = null; // Reset the send timer
    }
  }

  sendReminder(userId, reminderCallback) {
    const session = this.sessions[userId];
    if (session && !session.confirmed) {
      reminderCallback(session.sessionId);
    }
  }

  confirmSession(sessionId) {
    for (const userId in this.sessions) {
      const session = this.sessions[userId];
      if (session && session.sessionId === sessionId) {
        session.confirmed = true;
        clearTimeout(session.reminderTimer);
        this.endSession(userId); // End the session after confirmation
        break;
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
