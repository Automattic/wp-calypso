---
name: dashboard-browser
description: Browse the locally running Calypso or multi-site Dashboard (my.localhost / calypso.localhost) as a logged-in WordPress.com user, to verify a UI change, check what a screen shows, or look for console and API errors. Use when asked to check, verify, screenshot or explore a page of the local dev server.
---

# Dashboard browser

Drives a headless Chromium against the local dev server, logged in as a WordPress.com user.

## Accounts

- **E2E test accounts (default).** Shared accounts from the E2E secrets, e.g. `defaultUser`, `simpleSiteFreePlanUser`, `atomicUser`. Pick one with `--as <name>`.
- **The user's own account** (`--as me`). Only when the user asks for it, e.g. to check their real sites, plans or domains.

**Stay read-only.** Don't save settings, create or delete anything, or start a purchase unless the user explicitly asks. The test accounts are shared with CI and other developers, and `me` is the user's real account.

## Setup

If a script exits with code 2, it needs something from the user (start the dev server, set up the E2E secrets, or log in with `auth.cjs me`): pass its message on. Don't try to decrypt the E2E secrets yourself.

Sessions are saved in `~/.local/state/wp-calypso-dashboard-browser/`. They are live logins: never print, copy or commit them.

## Browsing

Run from the repo root:

```bash
node .agents/skills/dashboard-browser/scripts/browse.cjs <url> [options]
```

`<url>` is a path on the dashboard (`/sites`, `/sites/example.wordpress.com/settings`) or an absolute URL, e.g. `http://calypso.localhost:3000/home` for classic Calypso.

| Option                                 | Purpose                                                                                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `--as <account>`                       | E2E account name, or `me`. Default `defaultUser`.                                                                     |
| `--wait-for <selector>`                | Wait for a Playwright selector, e.g. `'role=row >> nth=1'` or `'text=Latest activity'`.                               |
| `--eval <code>` / `--eval-file <path>` | Async Playwright code to run after the page loads, with `page` and `context` in scope. Its `return` value is printed. |
| `--screenshot <path>`                  | Save a screenshot; add `--full-page` for the whole page.                                                              |
| `--no-snapshot`                        | Skip the ARIA snapshot of `<main>`, which is printed by default.                                                      |
| `--viewport <WxH>`                     | Default `1440x1000`. Use e.g. `390x844` for mobile.                                                                   |
| `--settle <ms>`                        | Extra wait before reporting, for late-loading content. Default `2000`.                                                |
| `--log-requests <regex>`               | Also list every response whose URL matches, with its status and envelope code, e.g. `'me/sites'`.                     |

The report lists **problems**: console errors, page errors, failed requests, and API errors inside `http_envelope` responses.

Before running `--eval` and before reporting, the script waits up to 60s for spinners, loading bars and blurred placeholder text in `<main>` to go away. If one is still showing, the report says **STILL LOADING**: treat the snapshot and screenshot as incomplete, not as an empty page. Loading states it doesn't recognize, like a card's own skeleton, need `--wait-for` or a higher `--settle`.

Each run starts a fresh browser, so chain interactions in one `--eval`:

```bash
node .agents/skills/dashboard-browser/scripts/browse.cjs /sites --screenshot /tmp/overview.png --eval '
  await page.getByRole( "row" ).nth( 1 ).getByRole( "link" ).first().click();
  await page.waitForURL( /\/sites\/[^/]+$/ );
  await page.getByRole( "heading", { level: 2 } ).first().waitFor();
  return page.getByRole( "heading", { level: 2 } ).allInnerTexts();
'
```

Save screenshots outside the repo, e.g. in a temporary directory.

## Gotchas

- **Don't wait for `networkidle`.** The dashboard keeps polling, so it never goes idle. Wait for a visible element instead.
- **Tour popovers** (e.g. "Switch layouts", "Go to WP Admin") can cover parts of the page in screenshots. They're real UI; the ARIA snapshot still lists what's under them. Dismiss one in `--eval` if it gets in the way.
- If a fresh login still lands on the login page, report it rather than working around it.
