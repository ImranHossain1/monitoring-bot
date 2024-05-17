class SessionManager {
  constructor() {
    this.sessions = {};
  }

  startSession(userId, message, saveCallback, sendCallback) {
    if (!this.sessions[userId]) {
      this.sessions[userId] = {
        messages: [],
        timer: setTimeout(
          () => this.endSession(userId, saveCallback, sendCallback),
          10000
        ), // 30 seconds
      };
    }

    this.sessions[userId].messages.push(message);
  }

  endSession(userId, saveCallback, sendCallback) {
    if (this.sessions[userId]) {
      const sessionMessages = this.sessions[userId].messages;
      saveCallback(userId, sessionMessages);
      sendCallback(sessionMessages);
      clearTimeout(this.sessions[userId].timer);
      delete this.sessions[userId];
    }
  }
}

export default new SessionManager();
