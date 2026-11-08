import { randomUUID } from "node:crypto";
import { hoppier, usage } from "./hoppier.js";

const [program, email, option] = process.argv.slice(2);
if (!program || !email) {
  usage("node 4-add-participant.js <program id> <email> [--send-invite]");
}

const participant = await hoppier("POST", "/participants", {
  // One key per add. In your app, save it with the add and send the same key
  // on every retry, so the person is only ever added once.
  headers: { "Idempotency-Key": randomUUID() },
  body: {
    program,
    email,
    firstName: "Test",
    lastName: "Person",
    // Hoppier emails the invite only when you ask. Otherwise, send the
    // person their `inviteUrl` yourself.
    ...(option === "--send-invite" && { sendEmailAsUsersAreAdded: true }),
  },
});

console.log(participant);
