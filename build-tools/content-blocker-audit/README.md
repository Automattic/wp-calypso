# Content-blocker chunk audit

Content blockers match request URLs against filter lists, and some of their rules are generic enough to hit Calypso chunk names. `async-load-calypso-blocks-cookie-banner.<hash>.min.js` matched the EasyList Cookie rule `-cookie-banner.`, so browsers with that list enabled never loaded it and logged-out `/setup/onboarding/user` rendered blank (#112944, #109348).

This audit checks every JavaScript and CSS URL Calypso can load against the filter lists in [`filter-lists.json`](./filter-lists.json), so a newly added chunk name that a common blocker would refuse is caught before or after it ships.

## Running it

Audit a local build:

```bash
yarn build-client
yarn audit-content-blocker-chunks
```

Audit what is deployed right now. The chunk name and hash maps are read from the webpack runtime inlined in the page, so this covers every async chunk, not only the ones the page loads up front. Scripts and stylesheets the page references from outside Calypso's public path, such as stats or RUM beacons, are not audited: blockers refuse some of them on purpose.

```bash
yarn audit-content-blocker-chunks --page https://wordpress.com/setup/onboarding/user
```

| Option                | Default                                       |                                                                  |
| --------------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| `--dir <path>`        | `public/evergreen`                            | Build output directory to scan. Repeatable.                      |
| `--page <url>`        |                                               | Deployed page to read chunk URLs from instead. Repeatable.       |
| `--public-path <url>` | `https://wordpress.com/calypso/<dir name>/`   | URL the `--dir` is served from.                                  |
| `--page-url <url>`    | `https://wordpress.com/setup/onboarding/user` | Page that loads `--dir` assets, for `$domain=` and party checks. |
| `--cache-dir <path>`  | `.cache/content-blocker-lists`                | Where the downloaded lists are kept.                             |
| `--refresh`           |                                               | Download the latest lists even if cached.                        |
| `--offline`           |                                               | Only use cached lists; fail if one is missing.                   |
| `--json <path>`       |                                               | Also write the full report, including list versions.             |

Exit codes: `0` nothing blocked, `1` at least one asset blocked, `2` the control was not blocked or the run failed.

The lists are downloaded on first use and then reused, so repeated runs compare against the same rules. Pass `--refresh` to pick up new rules; the list versions are printed on every run and recorded in the JSON report. Downloads and page fetches are retried on network errors, 429s and 5xx responses. If a refresh still fails and a cached copy exists, that copy is used and marked as stale in the output and report.

## Scheduled run

The TeamCity build "Content-blocker chunk audit" (`ContentBlockerChunkAudit` in `.teamcity/_self/projects/WebApp.kt`) runs the `--page` form every six hours against what wordpress.com serves, with `--refresh` so each run uses the current lists. All entry points share one webpack runtime, so every page carries the same chunk maps; the entry files themselves (`entry-*`) are not in the maps, so one page per entry point is audited to pick them up: `/setup/onboarding/user` (Stepper), `/log-in` (login) and `/themes` (the main Calypso bundle). A wordpress.com bot challenge, which comes back as a 200, is retried like a server error. A failed run, whether an asset is blocked or the control was not, posts to `#dotcom-quake`. The JSON report, including the list versions, is kept as the build artifact `artifacts/content-blocker-audit.json`.

The build does not install dependencies: the audit only needs Node and the files in this directory.

## The control

`filter-lists.json` lists names that are known to be blocked: the original cookie-banner chunk. Every run checks them alongside the real assets. If a control is not blocked, the lists changed, a download returned something unexpected, or the matcher regressed — in any of those cases a clean result would mean nothing, so the run fails with exit code `2`. Keep at least one control, and only replace it with another name that the agreed lists block today.

## Changing the agreed lists

`filter-lists.json` is the agreed set: lists that uBlock Origin, AdGuard and Brave enable by default or offer one click away. Adding or removing a list changes what the audit treats as blocked, so do it in its own PR.

The lists are not vendored because of their size and licences. The audit keeps only the rules that can affect a script or stylesheet request to `assetHosts` from a page on `pageHosts`; host-specific rules for other sites are dropped.

## What the matcher supports

Adblock Plus network filter syntax as used by EasyList, uBlock Origin and AdGuard: `||` and `|` anchors, `^`, `*`, `/regex/`, `@@` exceptions (including `$document`), `$important`, `$badfilter`, resource types and their uBlock aliases, `$third-party`/`$1p`/`$3p`/`$strict1p`/`$strict3p`, `$domain=`/`$from=`, `$to=`, `$denyallow=`, `$method=` and `$match-case`. `!#if` blocks are evaluated for uBlock Origin on desktop Chromium and Firefox; a rule is kept if it applies on either. Sublists pulled in with `!#include` on those platforms (such as uBlock's yearly `filters-<year>.txt`) are downloaded and cached next to their list, and matches in them are reported as `<list>/<sublist>:<line>`; a sublist that cannot be downloaded is skipped with a warning. Cosmetic filters and rules that rewrite rather than block (`$csp`, `$removeparam`, `$redirect-rule`, …) are ignored, as are rules with options it does not recognise.
