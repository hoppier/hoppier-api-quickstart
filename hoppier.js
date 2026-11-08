import "./env.js";

// There is no sandbox: every request works on your live Hoppier account.
const BASE_URL = "https://app.hoppier.com/api/v1";

if (!process.env.HOPPIER_API_KEY) {
  console.error("Add your API key to .env as HOPPIER_API_KEY.");
  process.exit(1);
}

export async function hoppier(method, path, { body, headers } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.HOPPIER_API_KEY}`,
      ...(body && { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body && JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // Act on the status and the `error` code: the message's wording can change.
    throw new Error(`${response.status} ${data?.error}: ${data?.message}`);
  }
  return data;
}

export function usage(text) {
  console.error(`Usage: ${text}`);
  process.exit(1);
}
