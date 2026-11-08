# Hoppier API quickstart

Create a gift card program, add someone to it and receive the signed `card.claimed` webhook with the [Hoppier API](https://docs.hoppier.com), in plain Node.js. There's no SDK and nothing to install: Node's built-in `fetch`, `crypto` and `http` do everything.

> [!WARNING]
> **There is no sandbox.** Every call works on your live Hoppier account: a participant you add is a real person in a real program. Test with your own email addresses, on a program you made for the purpose.

## What you need

- Node.js 22 or later (`node -v`).
- A Hoppier account with a plan. Sign up at [app.hoppier.com](https://app.hoppier.com).
- A company API key. In the dashboard, go to **Developers › API keys** and press **Create key**. Hoppier shows the key once.
- For the webhook, a public `https://` address that reaches your machine. Hoppier refuses `localhost`, so use a tunnel such as [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/).

## Set up

```bash
git clone https://github.com/hoppier/hoppier-api-quickstart.git
cd hoppier-api-quickstart
cp .env.example .env
```

Paste your API key into `.env` after `HOPPIER_API_KEY=`. Keep it out of your code and out of git: `.gitignore` already lists `.env`.

## Run it

| Step | Command                                          | What it does                                                                                                                          |
| ---- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `node 1-check-key.js`                            | Checks your key and shows which company it belongs to (`GET /validate`).                                                              |
| 2    | `node 2-find-gift-cards.js coffee`               | Searches the gift card brands a program can offer (`GET /merchants`).                                                                 |
| 3    | `node 3-create-program.js <merchant id>`         | Creates a gift card program worth $25 per person (`POST /programs`). Copy the `prg_` id it prints.                                    |
| 4    | `node 4-add-participant.js <program id> <email>` | Adds a person and returns their claim link, `inviteUrl` (`POST /participants`). Add `--send-invite` to have Hoppier email it to them. |
| 5    | `node 5-list-participants.js <program id>`       | Shows who has claimed their reward: `pending` until they do, then `active` (`GET /participants`).                                     |

In step 3, send one or more merchant ids from step 2, or none to start from your account's program template.

## Receive the webhook

1. Start a tunnel with `cloudflared tunnel --url http://localhost:3000` and copy the `https://….trycloudflare.com` address it prints.
2. In the dashboard, go to **Developers › Webhooks** and add an endpoint with that address. Copy its `whsec_…` signing secret, which Hoppier shows once, into `.env` after `HOPPIER_WEBHOOK_SECRET=`.
3. Run `node webhook-server.js`, then press **Send test** on the endpoint. Within about a minute the server prints `✓ card.claimed evt_test_…`.

You get a real `card.claimed` event when Hoppier sets a reward aside for someone you added: when they accept their invite, or the next time they sign in. To see one straight away, add yourself in step 4 and refresh the dashboard.

`webhook-server.js` does what every receiver should:

- checks `X-Hoppier-Signature` on the raw body: the HMAC-SHA256 of `<t>.<body>`, keyed with your whole `whsec_` secret, compared in constant time against each `v1` value;
- refuses a timestamp more than 5 minutes old;
- answers with a `2xx` straight away, well within the 10 seconds Hoppier waits;
- skips an event `id` it has already handled, because retries reuse it.

## Good to know

- **Units.** A program's `amount` is in cents (`2500` is $25.00). A participant's `amount` and the webhook's `data.amount` are in dollars.
- **Retrying an add.** `4-add-participant.js` sends an `Idempotency-Key`. In your app, store the key with the add and send the same one on every retry, so the person is added only once. Creating a program takes no key: after a timeout, look for it with `GET /programs` before you send it again.
- **Errors** come back as `{ "error": "<code>", "message": "…" }`. Act on the HTTP status and `error`; the message's wording can change.
- **Rate limits.** 50 requests every 10 seconds per IP address, and 300 reads plus 120 writes per minute per account.
- **`card.claimed`** means Hoppier has set the reward aside for the person. It doesn't mean they've spent it.

## Learn more

- [Quickstart](https://docs.hoppier.com/guides/quickstart)
- [API reference](https://docs.hoppier.com/api-reference/overview)
- [Webhooks](https://docs.hoppier.com/guides/webhooks)
- [Errors and rate limits](https://docs.hoppier.com/guides/errors-and-rate-limits)

Questions? Email support@hoppier.com.

## License

[MIT](LICENSE)
