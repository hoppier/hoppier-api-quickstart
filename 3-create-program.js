import { hoppier } from "./hoppier.js";

// The gift card brands to offer, as merchant ids from step 2.
const merchantIds = process.argv.slice(2).map(Number);

// This call takes no Idempotency-Key: if it times out, look for the program
// with GET /programs before you send it again.
const program = await hoppier("POST", "/programs", {
  body: {
    name: "Thank-you gifts",
    programType: "gift_card",
    amount: 2500, // in cents: $25.00 per person
    ...(merchantIds.length > 0 && { merchantIds }),
  },
});

console.log(program);
