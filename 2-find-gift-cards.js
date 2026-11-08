import { hoppier } from "./hoppier.js";

const query = process.argv[2] ?? "coffee";
const params = new URLSearchParams({
  programType: "gift_card",
  query,
  limit: "5",
});

const { merchants } = await hoppier("GET", `/merchants?${params}`);
console.table(merchants.map(({ id, name }) => ({ id, name })));
