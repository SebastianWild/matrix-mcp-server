import test from "node:test";
import assert from "node:assert/strict";
import {
  processMessageWithMetadata,
  processMessagesByDate,
} from "../src/matrix/messageProcessor.js";

function fakeMessageEvent({
  body,
  eventId = "$event-1",
  sender = "@alice:matrix.example.com",
  senderDisplayName = "Alice",
  ts = Date.parse("2026-07-09T20:45:00.000Z"),
}: {
  body: string;
  eventId?: string;
  sender?: string;
  senderDisplayName?: string;
  ts?: number;
}) {
  return {
    sender: { name: senderDisplayName },
    getType: () => "m.room.message",
    getContent: () => ({ msgtype: "m.text", body }),
    getId: () => eventId,
    getSender: () => sender,
    getTs: () => ts,
  } as any;
}

test("processMessageWithMetadata preserves sender and timestamp metadata", async () => {
  const message = await processMessageWithMetadata(
    fakeMessageEvent({ body: "Route sequence?" }),
    {} as any
  );

  assert.equal(message?.content.type, "text");
  assert.equal(message?.metadata.eventId, "$event-1");
  assert.equal(message?.metadata.sender, "@alice:matrix.example.com");
  assert.equal(message?.metadata.senderDisplayName, "Alice");
  assert.equal(message?.metadata.timestamp, "2026-07-09T20:45:00.000Z");
  assert.equal(message?.metadata.originServerTs, 1783629900000);
  assert.equal(message?.metadata.msgtype, "m.text");
  assert.equal(message?.metadata.body, "Route sequence?");
});

test("processMessagesByDate returns metadata-preserving messages in range", async () => {
  const messages = await processMessagesByDate(
    [
      fakeMessageEvent({
        body: "Before",
        eventId: "$before",
        ts: Date.parse("2026-07-09T19:59:59.000Z"),
      }),
      fakeMessageEvent({
        body: "Inside",
        eventId: "$inside",
        ts: Date.parse("2026-07-09T20:15:00.000Z"),
      }),
    ],
    "2026-07-09T20:00:00.000Z",
    "2026-07-09T21:00:00.000Z",
    {} as any
  );

  assert.equal(messages.length, 1);
  assert.equal(messages[0].metadata.eventId, "$inside");
  assert.equal(messages[0].metadata.senderDisplayName, "Alice");
});
