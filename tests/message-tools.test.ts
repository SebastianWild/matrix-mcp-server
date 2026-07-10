import test from "node:test";
import assert from "node:assert/strict";
import { messagesResult } from "../src/tools/tier0/messages.js";
import { ProcessedMessageWithMetadata } from "../src/matrix/messageProcessor.js";

test("messagesResult returns structured message metadata", () => {
  const message: ProcessedMessageWithMetadata = {
    content: {
      type: "text",
      text: "Route sequence?",
    },
    metadata: {
      eventId: "$event-1",
      sender: "@alice:matrix.example.com",
      senderDisplayName: "Alice",
      timestamp: "2026-07-09T20:45:00.000Z",
      originServerTs: 1783629900000,
      msgtype: "m.text",
      body: "Route sequence?",
    },
  };

  const result = messagesResult([message], "!room:matrix.example.com", "Trip Planning");

  assert.deepEqual(result.structuredContent, {
    roomId: "!room:matrix.example.com",
    roomName: "Trip Planning",
    messages: [
      {
        eventId: "$event-1",
        sender: "@alice:matrix.example.com",
        senderDisplayName: "Alice",
        timestamp: "2026-07-09T20:45:00.000Z",
        originServerTs: 1783629900000,
        msgtype: "m.text",
        body: "Route sequence?",
        type: "text",
        text: "Route sequence?",
        mimeType: undefined,
      },
    ],
  });
  assert.equal(
    result.content[0].text,
    "2026-07-09T20:45:00.000Z Alice: Route sequence?"
  );
});
