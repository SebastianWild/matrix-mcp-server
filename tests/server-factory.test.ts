import test from "node:test";
import assert from "node:assert/strict";
import { createMcpServer } from "../src/server.js";

test("creates a fresh MCP server instance for each HTTP request", () => {
  const first = createMcpServer();
  const second = createMcpServer();

  assert.notEqual(first, second);
});
