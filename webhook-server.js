import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import "./env.js";

const SECRET = process.env.HOPPIER_WEBHOOK_SECRET; // the whole whsec_… value
const PORT = 3000;
const seenEventIds = new Set(); // in your app, keep these in your database

if (!SECRET) {
  console.error("Add your signing secret to .env as HOPPIER_WEBHOOK_SECRET.");
  process.exit(1);
}

function isSignedByHoppier(header = "", rawBody) {
  const pairs = header.split(",").map((pair) => pair.split("="));
  const t = Number(pairs.find(([key]) => key === "t")?.[1]);
  // An old timestamp means a captured request being replayed.
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return false;

  const expected = createHmac("sha256", SECRET)
    .update(`${t}.`)
    .update(rawBody)
    .digest("hex");
  // While you rotate a secret there are two v1 values: accept either.
  return pairs.some(
    ([key, signature]) =>
      key === "v1" &&
      signature?.length === expected.length &&
      timingSafeEqual(Buffer.from(signature), Buffer.from(expected)),
  );
}

createServer((req, res) => {
  if (req.method !== "POST") return res.writeHead(405).end();

  const chunks = [];
  let size = 0;
  req.on("data", (chunk) => {
    size += chunk.length;
    if (size > 64 * 1024) req.destroy(); // events are small
    chunks.push(chunk);
  });

  req.on("end", () => {
    // Check the signature on the raw bytes, before any JSON parsing.
    const rawBody = Buffer.concat(chunks);
    if (!isSignedByHoppier(req.headers["x-hoppier-signature"], rawBody)) {
      console.log("✗ Rejected a request without a valid signature");
      return res.writeHead(401).end();
    }

    // Answer within 10 seconds, and do any slow work after answering.
    res.writeHead(200).end();

    const event = JSON.parse(rawBody.toString("utf8"));
    if (seenEventIds.has(event.id)) return; // a retry of an event you've handled
    seenEventIds.add(event.id);

    const { participant_email, program_id, amount, currency } = event.data;
    console.log(
      `✓ ${event.type} ${event.id}: ${participant_email}, ${program_id}, ${amount} ${currency}`,
    );
  });
}).listen(PORT, () => {
  console.log(`Waiting for Hoppier webhooks on http://localhost:${PORT}`);
});
