import mongoose from "mongoose";

const eventSchema = mongoose.Schema(
  {
    texts: {
      type: [String], // Array of strings to store multiple messages
      required: true,
      default: [],
    },
    tgId: {
      type: String,
      required: true,
    },
    confirmed: { type: Boolean, default: false },
    messageIds: { type: [Number] }, // Store multiple message IDs
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Event", eventSchema);
