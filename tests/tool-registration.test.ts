import test from "node:test";
import assert from "node:assert/strict";
import { registerMatrixTools } from "../src/register-tools.js";

class FakeServer {
  public readonly tools: string[] = [];

  registerTool(name: string): void {
    this.tools.push(name);
  }
}

test("registers only read-only tools by default", () => {
  const server = new FakeServer();

  registerMatrixTools(server);

  assert.deepEqual(server.tools, [
    "list-joined-rooms",
    "get-room-info",
    "get-room-members",
    "get-room-messages",
    "get-messages-by-date",
    "identify-active-users",
    "get-user-profile",
    "get-my-profile",
    "get-all-users",
    "search-public-rooms",
    "get-notification-counts",
    "get-direct-messages",
  ]);
});

test("registers action tools only when explicitly enabled", () => {
  const server = new FakeServer();

  registerMatrixTools(server, { enableActionTools: true });

  assert.deepEqual(server.tools.slice(-8), [
    "send-message",
    "send-direct-message",
    "create-room",
    "join-room",
    "leave-room",
    "invite-user",
    "set-room-name",
    "set-room-topic",
  ]);
});
