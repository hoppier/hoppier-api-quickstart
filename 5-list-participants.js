import { hoppier, usage } from "./hoppier.js";

const program = process.argv[2];
if (!program) usage("node 5-list-participants.js <program id>");

const params = new URLSearchParams({ program, limit: "100" });
const participants = await hoppier("GET", `/participants?${params}`);

// `pending` until the person claims their reward, then `active`.
console.table(participants.map(({ email, status }) => ({ email, status })));
