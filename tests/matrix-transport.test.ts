import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import http from "node:http";
import https from "node:https";
import { once } from "node:events";
import { test } from "node:test";
import * as sdk from "matrix-js-sdk";
import { matrixFetch } from "../src/matrix/client.js";

const tls = {
  key: readFileSync(new URL("fixtures/localhost-key.pem", import.meta.url)),
  cert: readFileSync(new URL("fixtures/localhost-cert.pem", import.meta.url)),
};

for (const protocol of ["http", "https"] as const) {
  test(`Matrix SDK makes authenticated ${protocol.toUpperCase()} requests`, async (t) => {
    const requests: string[] = [];
    const handler: http.RequestListener = (req, res) => {
      assert.equal(req.headers.authorization, "Bearer test-only-token");
      requests.push(req.url!);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(req.url!.includes("joined_rooms")
        ? { joined_rooms: ["!test:localhost"] }
        : { user_id: "@test:localhost", device_id: "TEST" }));
    };
    const server = protocol === "http" ? http.createServer(handler) : https.createServer(tls, handler);
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    t.after(() => new Promise<void>((resolve) => server.close(() => resolve())));
    const address = server.address() as import("node:net").AddressInfo;
    const client = sdk.createClient({
      baseUrl: `${protocol}://127.0.0.1:${address.port}`,
      accessToken: "test-only-token",
      fetchFn: matrixFetch,
    });
    assert.deepEqual(await client.getJoinedRooms(), { joined_rooms: ["!test:localhost"] });
    assert.equal((await client.whoami()).user_id, "@test:localhost");
    assert.equal(requests.length, 2);
  });
}

test("Matrix SDK chooses transport again for an HTTP-to-HTTPS redirect", async (t) => {
  const secure = https.createServer(tls, (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ joined_rooms: ["!redirect:localhost"] }));
  });
  secure.listen(0, "127.0.0.1");
  await once(secure, "listening");
  t.after(() => new Promise<void>((resolve) => secure.close(() => resolve())));
  const securePort = (secure.address() as import("node:net").AddressInfo).port;
  const plain = http.createServer((req, res) => {
    res.writeHead(302, { Location: `https://127.0.0.1:${securePort}${req.url}` });
    res.end();
  });
  plain.listen(0, "127.0.0.1");
  await once(plain, "listening");
  t.after(() => new Promise<void>((resolve) => plain.close(() => resolve())));
  const client = sdk.createClient({
    baseUrl: `http://127.0.0.1:${(plain.address() as import("node:net").AddressInfo).port}`,
    fetchFn: matrixFetch,
  });
  assert.deepEqual(await client.getJoinedRooms(), { joined_rooms: ["!redirect:localhost"] });
});
