# Browser check

`scripts/browse.cjs` drives headless Chromium against a local dev server or a hosted build, logged in as a WordPress.com user, and reports what the page shows. Use it by default. Drive a browser yourself (see [Other browsers](#other-browsers)) only when the user asks for one, when the check needs a long interactive session, or when `browse.cjs` can't log in.

## Choosing where to test

- When a PR is open or you were asked to open one, prefer [Calypso Live](#calypso-live) for final signed-in checks. Run the static checks and unit tests before opening it, and the browser check once the draft's preview is built. Draft PRs opened from branches in this repository get preview links, so you can run those checks before marking the PR ready. Each preview lets you verify the intended commit without sharing a local dev server across worktrees.
- Use a [local dev server](#setup) to reproduce bugs, test unpushed changes, or run checks when the preview is unavailable or can't support them, e.g. a flag only the local config turns on. Never open a PR, or ask for one, just to get a preview. Before reusing a running server, confirm it's serving the intended checkout: `lsof -nP -iTCP:3000 -sTCP:LISTEN` with the server's port lists the listener's PID, and `lsof -a -d cwd -p 12345` with that PID shows its directory.

## Accounts

- **E2E test accounts (default).** Shared accounts from the E2E secrets, e.g. `defaultUser`, `simpleSiteFreePlanUser`, `atomicUser`. Pick one with `--as <name>`.
- **The user's own account** (`--as me`, or their Chrome). Only when the user asks for it, or for a check that changes anything (below). Never take PR screenshots with it.

> [!CAUTION]
> **CRITICAL: the E2E test accounts are shared with CI and other developers. Use them for read-only checks only, with no exceptions, even when the user asks.** Don't save, publish, install, delete or buy anything, submit a form, or send a `POST`, `PUT` or `DELETE` request, in any browser or `--eval`.
>
> When a check needs a change, ask the user to sign in with their own account instead (options 2 and 3 in [Setup](#setup)) and to pick one of their sites whose URL contains `test`. To see a state a change would show, stop at the confirmation step or stub the response with `context.route()`.

**Check each site type the change affects**, e.g. when the code branches on `isAtomic`, `isJetpack`, hosting features or plans: `--as defaultUser,atomicUser,jetpackRemoteSiteUser`.

| Site type           | Account                 |
| ------------------- | ----------------------- |
| Simple              | `defaultUser`           |
| Atomic              | `atomicUser`            |
| Self-hosted Jetpack | `jetpackRemoteSiteUser` |

## Setup

- Local targets require a running dev server (`yarn start` or `yarn start-dashboard`). Don't start it yourself unless asked or [running unattended](#running-unattended). The script waits up to 90s for its first build. Hosted URLs skip this check.
- If you need something from the user, ask directly, with your question tool if you have one (`AskUserQuestion` in Claude Code), without narrating the skill's steps. For anything the user has to run, give the exact command. In Claude Code, prefix it with `!` so it runs in the session, except `setup-test-accounts.sh`: that one goes in the user's own terminal, to keep the key out of the conversation. For a failed login, offer, in plain words without setup details:
  1. **Playwright with the E2E test accounts:** the user runs `.agents/skills/verify/scripts/setup-test-accounts.sh` in their own terminal.
  2. **Playwright with their own account:** the user runs `! node .agents/skills/verify/scripts/auth.cjs me`.
  3. **Claude in Chrome with their own account:** usually already signed in; the user connects it with `/chrome` in Claude Code.

  Describe each option by what it does (e.g. "a headless Playwright browser, logged in as a shared test account"), not by its command. When the user picks one, show its command and wait until they say it's done before running the script again. Don't set up the test accounts yourself unless running unattended.

- Sessions are saved in `~/.local/state/wp-calypso-verify/`. They are live logins: never print, copy or commit them, and never save network recordings (HAR files, traces) of a login.

## Calypso Live

1. Use the preview link from the PR bot for each affected client. Set the path you want to check and keep the image and environment query parameters. Pass the full URL to `browse.cjs` in single quotes with the usual test account. The script retries startup responses for up to 90 seconds and fails if it cannot load a build. Use a fresh bot link if a container URL has expired.
2. Check the final host and path to confirm the intended client. A signed-in account can redirect from Classic to Dashboard. Confirm that the report's `preview commit` matches the PR head you intend to verify. If it doesn't, wait for the `Docker image (Web app)` check on that commit, reread the bot link, and confirm the commit again. Builds for successive pushes can update the link out of order, so if it still serves another commit, verify locally. Don't verify an older build. The preview may also include trunk as of build time.
3. Run the same interactions and capture the same states you would check locally. When using response fixtures with a shared test account, keep the live account read-only. Report which UI checks used fixtures and which real backend behavior remains unverified.

```bash
node .agents/skills/verify/scripts/browse.cjs 'PASTE_THE_FULL_PR_PREVIEW_URL_HERE' --no-snapshot
```

## Running unattended

If you're a subagent that can't ask the user, report back to the agent that started you instead of acting on your own. When no one can answer at all (a pipeline or cloud run), don't stop to ask:

- If you need a local build and the right dev server isn't running, start it in the background with the Node version in `.nvmrc`: `yarn start-dashboard`, or `yarn start` when you need classic Calypso or the Reader. Its first build takes several minutes; rerun the script until it gets past the build. If another checkout's server holds the port, put the same free port in front of both commands, e.g. `PORT=3100 yarn start-dashboard` and `PORT=3100 node .agents/skills/verify/scripts/browse.cjs /sites`.
- If the E2E test accounts aren't set up but `E2E_SECRETS_KEY` is set, run `.agents/skills/verify/scripts/setup-test-accounts.sh`.
- If Chromium is missing, run `(cd test/e2e && npx playwright install --with-deps chromium)`.
- If you still can't log in, skip the browser check and report it as not done, with the reason.
- Skip any check that would change something and report it as not done.

## Browsing

```bash
node .agents/skills/verify/scripts/browse.cjs <url> [options]
```

`<url>` is a path on the local Dashboard (such as `/sites`) or an absolute URL. Use an absolute URL for Calypso Live, production, or Classic on the local dev server (such as `http://calypso.localhost:3000/read`). `{site}` in it becomes the test account's site, e.g. `/sites/{site}`: open it directly, since the first site in the Sites list may be another one. The script reads `PORT` from `.env` itself; don't open `.env`. Don't pipe its output (e.g. through `tail`): you'd lose its exit code.

| Option                                 | Purpose                                                                                                              |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `--as <accounts>`                      | E2E account names separated by commas, or `me`. Default `defaultUser`.                                               |
| `--wait-for <selector>`                | Wait for a Playwright selector, e.g. `'text=Latest activity'`.                                                       |
| `--eval <code>` / `--eval-file <path>` | Async Playwright code with `page`, `context`, `screenshot()` and `loaded()` in scope; its `return` value is printed. |
| `--screenshot <path>`                  | Save a screenshot outside the repo; add `--full-page` for the whole page.                                            |
| `--clip <selector>`                    | Crop the screenshot to the first element matching the selector.                                                      |
| `--arrow <selector>`                   | Point a red arrow at the first element matching the selector in the screenshot.                                      |
| `--no-snapshot`                        | Skip the ARIA snapshot of `<main>`, printed by default.                                                              |
| `--viewport <WxH>`                     | Default `1440x1000`; e.g. `390x844` for mobile.                                                                      |
| `--settle <ms>`                        | Extra wait before reporting. Default `2000`.                                                                         |
| `--log-requests <regex>`               | List matching responses with their status and envelope code.                                                         |

With several accounts, the script reports on each in turn and adds `-<account>` to screenshot names.

The report lists **problems**: console and page errors, failed requests, and API errors inside `http_envelope` responses. Compare with `trunk` before blaming your change.

The script waits up to 60s for spinners and placeholders in `<main>` to go away. If the report says **STILL LOADING**, the snapshot and screenshot are incomplete; use `--wait-for` or a higher `--settle`.

Each run starts a fresh browser, so chain interactions in one `--eval`. After a click that navigates, `await loaded()` before reading the page, or you may read loading placeholders:

```bash
node .agents/skills/verify/scripts/browse.cjs '/sites/{site}' --screenshot /tmp/settings.png --eval '
  await page.getByRole( "link", { name: "Settings" } ).first().click();
  await page.waitForURL( /\/settings$/ );
  await loaded();
  return page.getByRole( "heading", { level: 1 } ).first().innerText();
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
