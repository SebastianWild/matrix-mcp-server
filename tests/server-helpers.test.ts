import test from "node:test";
import assert from "node:assert/strict";

process.env.MATRIX_ACCESS_TOKEN = "env-access-token";
process.env.MATRIX_USER_ID = "@sebastian:matrix.example.com";
process.env.MATRIX_HOMESERVER_URL = "https://matrix.example.com";

const helpers = await import("../src/utils/server-helpers.js");

test("uses MATRIX_ACCESS_TOKEN when request headers do not include a token", () => {
  assert.equal(helpers.getAccessToken({}, undefined), "env-access-token");
});

test("uses MATRIX_USER_ID and MATRIX_HOMESERVER_URL when request headers omit Matrix context", () => {
  assert.deepEqual(helpers.getMatrixContext({}), {
    matrixUserId: "@sebastian:matrix.example.com",
    homeserverUrl: "https://matrix.example.com",
  });
});
