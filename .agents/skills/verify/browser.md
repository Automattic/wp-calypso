# Browser check

`scripts/browse.cjs` drives a headless Chromium against the local dev server, logged in as a WordPress.com user, and reports what the page shows. Use it by default. Drive a browser yourself (see [Other browsers](#other-browsers)) only when the user asks for one, when the check needs a long interactive session, or when `browse.cjs` can't log in.

## Accounts

- **E2E test accounts (default).** Shared accounts from the E2E secrets, e.g. `defaultUser`, `simpleSiteFreePlanUser`, `atomicUser`. Pick one with `--as <name>`.
- **The user's own account** (`--as me`, or their Chrome). Only when the user asks for it, or to change site setup (below). Never take PR screenshots with it.

**Stay read-only** in any browser: don't save settings, create or delete anything, or start a purchase unless the user explicitly asks. The test accounts are shared with CI and other developers.

**Never change site setup on an E2E test account**, even when asked: PHP or WordPress version, plugins, themes, plan, visibility, domains, hosting settings. E2E tests depend on it. Ask the user to sign in with their own account instead (options 2 and 3 in [Setup](#setup)), and ask which of their sites to use: only one whose URL contains `test`.

**Never save anything with variation accounts**, even when asked: those with an `atomicVariation` or `gutenberg: 'edge'` in `packages/calypso-e2e/src/lib/utils/criteria-for-test-accounts.ts`, e.g. `jetpackAtomicPhpOldUser`.

## Setup

- The dev server must be running (`yarn start` or `yarn start-dashboard`). Don't start it yourself unless asked or [running unattended](#running-unattended). The script waits up to 90s for its first build.
- If a script exits with code 2, it needs something from the user. Ask directly, with your question tool if you have one (`AskUserQuestion` in Claude Code), without narrating the skill's steps. For anything the user has to run, give the exact command. In Claude Code, prefix it with `!` so it runs in the session, except `setup-test-accounts.sh`: that one goes in the user's own terminal, to keep the key out of the conversation. For a failed login, offer, in plain words without setup details:
  1. **Playwright with the E2E test accounts:** the user runs `.agents/skills/verify/scripts/setup-test-accounts.sh` in their own terminal.
  2. **Playwright with their own account:** the user runs `! node .agents/skills/verify/scripts/auth.cjs me`.
  3. **Claude in Chrome with their own account:** usually already signed in; the user connects it with `/chrome` in Claude Code.

  Describe each option by what it does (e.g. "a headless Playwright browser, logged in as a shared test account"), not by its command. When the user picks one, show its command and wait until they say it's done before running the script again. Don't set up the test accounts yourself unless running unattended.

- Sessions are saved in `~/.local/state/wp-calypso-verify/`. They are live logins: never print, copy or commit them, and never save network recordings (HAR files, traces) of a login.

## Running unattended

If you're a subagent that can't ask the user, report back to the agent that started you instead of acting on your own. When no one can answer at all (a pipeline or cloud run), don't stop to ask:

- If the dev server isn't running, start it in the background with the Node version in `.nvmrc`: `yarn start-dashboard`, or `yarn start` when you need classic Calypso or the Reader. Its first build takes several minutes; rerun the script until it gets past the build.
- If the E2E test accounts aren't set up but `E2E_SECRETS_KEY` is set, run `.agents/skills/verify/scripts/setup-test-accounts.sh`.
- If Chromium is missing, run `(cd test/e2e && npx playwright install --with-deps chromium)`.
- If you still can't log in, skip the browser check and report it as not done, with the reason.
- Skip any site setup change and report it as not done.

## Browsing

```bash
node .agents/skills/verify/scripts/browse.cjs <url> [options]
```

`<url>` is a Dashboard path (`/sites`) or an absolute URL such as `http://calypso.localhost:3000/home` or `/read` for classic Calypso and the Reader. The script reads `PORT` from `.env` itself; don't open `.env`. Don't pipe its output (e.g. through `tail`): you'd lose its exit code.

| Option                                 | Purpose                                                                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `--as <account>`                       | E2E account name, or `me`. Default `defaultUser`.                                                        |
| `--wait-for <selector>`                | Wait for a Playwright selector, e.g. `'text=Latest activity'`.                                           |
| `--eval <code>` / `--eval-file <path>` | Async Playwright code with `page`, `context` and `screenshot()` in scope; its `return` value is printed. |
| `--screenshot <path>`                  | Save a screenshot outside the repo; add `--full-page` for the whole page.                                |
| `--clip <selector>`                    | Crop the screenshot to the first element matching the selector.                                          |
| `--no-snapshot`                        | Skip the ARIA snapshot of `<main>`, printed by default.                                                  |
| `--viewport <WxH>`                     | Default `1440x1000`; e.g. `390x844` for mobile.                                                          |
| `--settle <ms>`                        | Extra wait before reporting. Default `2000`.                                                             |
| `--log-requests <regex>`               | List matching responses with their status and envelope code.                                             |

The report lists **problems**: console and page errors, failed requests, and API errors inside `http_envelope` responses. Compare with `trunk` before blaming your change.

The script waits up to 60s for spinners and placeholders in `<main>` to go away. If the report says **STILL LOADING**, the snapshot and screenshot are incomplete; use `--wait-for` or a higher `--settle`.

Each run starts a fresh browser, so chain interactions in one `--eval`:

```bash
node .agents/skills/verify/scripts/browse.cjs /sites --screenshot /tmp/overview.png --eval '
  await page.getByRole( "row" ).nth( 1 ).getByRole( "link" ).first().click();
  await page.waitForURL( /\/sites\/[^/]+$/ );
  await page.getByRole( "heading", { level: 2 } ).first().waitFor();
  return page.getByRole( "heading", { level: 2 } ).allInnerTexts();
'
```

## Gotchas

- **Calypso routes that need a login redirect when loaded directly**, in any browser: `calypso.localhost:3000/tags` lands on `/discover/tags` as if logged out, so a working fix looks broken. Load `/read` (or `/home`), then navigate inside the app:

  ```js
  await page.evaluate( () => {
  	window.history.pushState( {}, '', '/tags' );
  	window.dispatchEvent( new PopStateEvent( 'popstate' ) );
  } );
  ```

- **Don't wait for `networkidle`.** The dashboard keeps polling. Wait for a visible element.
- **Tour popovers** can cover parts of a screenshot. Dismiss them in `--eval` if they get in the way.
- **Sandboxes.** Headless Chromium can reach production even when `/etc/hosts` points at a sandbox. Responses from the edge have an `x-ac` header; sandbox responses don't. To reach the sandbox, start the `--eval` with:

  ```js
  await context.route( /public-api\.wordpress\.com/, async ( route ) =>
  	route.fulfill( { response: await route.fetch() } )
  );
  await page.goto( page.url() );
  ```

## Other browsers

When you drive a browser yourself (Claude in Chrome, Playwright MCP, an automated Chrome profile), sign in by hand:

- Sign in on `wordpress.com/log-in`, then open `calypso.localhost:3000/read?flags=oauth` once. Signing in on the calypso.localhost form doesn't stick: the cookie is refused as cross-site.
- An automated Chrome profile blocks third-party cookies by default; allow them (see `docs/install.md`).
- Playwright MCP's browser starts logged out, so it doesn't help when `browse.cjs` can't log in.
