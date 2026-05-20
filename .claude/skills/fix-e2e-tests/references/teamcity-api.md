# TeamCity REST API notes (teamcity.a8c.com)

Working notes on how the TeamCity instance at `teamcity.a8c.com` behaves for the queries `fix-e2e-tests` makes. Treat as observations about the current state of the system — locator semantics, flag reliability, and field shapes have all shifted over time. Last refreshed: 2026-05-20.

## Authentication

Per-user access tokens:

- Created at <https://teamcity.a8c.com/profile.html?item=accessTokens>.
- Sent as `Authorization: Bearer <token>`.
- Scope: usually "same as current user" (no expiry, revocable).
- Stored locally at `~/.config/teamcity-access-token` (mode 0600) by `setup-token.sh`. Format: either bare token or `TEAMCITY_TOKEN=<value>` — both work.

Token failures:

- HTTP 401 → token revoked or never accepted.
- HTTP 403 → token has insufficient scope. Recreate it with "same as current user".

## Network

Direct HTTPS to `teamcity.a8c.com` works on the Automattic VPN; off VPN, a SOCKS5 tunnel on `localhost:8080` is typically required. `identify-failing-tests.sh` probes direct first, falls back to SOCKS5, and exits 3 with an actionable message if neither works.

## Build IDs of interest

PR-attached E2E builds, defined in [`.teamcity/_self/projects/WebApp.kt`](../../../../.teamcity/_self/projects/WebApp.kt):

| Build name on GitHub | TeamCity build-type ID | Runner |
| --- | --- | --- |
| `E2E Tests (Playwright Test)` | `calypso_WebApp_Calypso_E2E_Playwright_Test_Matrix` | Playwright Test |
| `Dashboard E2E Tests (PR)` | `calypso_WebApp_Calypso_Dashboard_*` | Playwright Test |
| `A4A E2E Tests (PR)` | `calypso_WebApp_Calypso_A4A_*` | Playwright Test |
| `E2E Tests (desktop)` | `calypso_WebApp_Calypso_E2E_Playwright_desktop` | Jest (legacy) |
| `E2E Tests (mobile)` | `calypso_WebApp_Calypso_E2E_Playwright_mobile` | Jest (legacy) |

Only the Playwright Test rows are Healer-compatible. The Jest-runner builds use `test/e2e/specs/**/*.ts` (no `.spec.`) per `test/e2e/AGENTS.md`.

Build URLs follow the form:

```
https://teamcity.a8c.com/buildConfiguration/<build-type-id>/<build-id>
```

The trailing numeric `<build-id>` is what we feed to the testOccurrences locator.

## The `testOccurrences` endpoint

The skill's primary query:

```
GET /app/rest/testOccurrences?locator=<locator>&fields=<projection>
```

### Locator

```
build:(id:<BUILD_ID>,defaultFilter:false),status:FAILURE,count:100
```

| Part | Why |
| --- | --- |
| `build:(id:<BUILD_ID>,...)` | Scope to one build. |
| `defaultFilter:false` | **Required for matrix builds.** The Playwright Test matrix build is a parent with snapshot dependencies (`[Desktop]`, `[Mobile]`, etc.); the actual failing occurrences live in those children. Without this flag the response is empty. |
| `status:FAILURE` | Only failed occurrences. |
| `count:100` | TC's default page size is lower; raise it so we don't truncate. |

### `fields=` projection

```
count,testOccurrence(id,name,muted,currentlyMuted,build(buildType(name)),details)
```

Notes on what's included and excluded:

- `id` — included but currently unused downstream. Could be dropped if you want a tighter response.
- `name` — full test identifier as TC reports it (`<spec>: <test path with › separators>`).
- `muted` / `currentlyMuted` — filtered at the jq layer in `identify-failing-tests.sh`, not in the locator (see pitfalls below).
- `build(buildType(name))` — used to label which matrix child the failure came from (`[Desktop]`, `[Mobile]`, etc.).
- `details` — full failure dump: FAILURE: summary header, the actual error class line, stack trace, and Playwright call log.
- `currentlyInvestigated` — **deliberately omitted** (see pitfalls).

## Common pitfalls

### `muted:false` in the locator behaves inconsistently

Combining `muted:false` with `defaultFilter:false` has given inconsistent results in practice — some muted occurrences leak through, presumably because of how `defaultFilter:false` and the muted-filter interact in the matrix-traversal path. **Filter muted/currentlyMuted at the jq layer instead.** The result is reliable and easy to verify from the slim output.

### `currentlyInvestigated` is not a reliable filter

The investigation flag goes stale (devs forget to clear it), is project-scoped (not per-occurrence in the way the field name suggests), and doesn't always match the build's failed-tests list in TC's UI. Filtering on it causes the skill's candidate list to silently diverge from what the user sees on TC. Don't request the field; don't filter on it.

### The error class line in `details` is indented

Playwright's `details` blob looks like:

```
FAILURE: ...
    TimeoutError: page.locator: locator '#late' is not visible within 150ms
    at file://.../infrastructure__flaky-fixture.spec.ts:42
    ...
    Call log:
      - waiting for locator('#late')
      ...
```

The actual error class (`TimeoutError`, `Error`, `expect(...)`, `AssertionError`) is **indented** under the `FAILURE:` summary header. A strict `^(error_class)` regex misses it and you end up extracting the useless summary line. Allow leading whitespace: `^[[:space:]]*(TimeoutError|Error|expect|AssertionError)`. POSIX bracket class instead of `\s` to keep the regex out of expansion-obfuscation territory (see [`permission-heuristics.md`](permission-heuristics.md)).

### `details` may be missing on edge-case occurrences

A stray occurrence without a `details` field will crash a jq pipeline that does `.details | split("\n")` — `.details` is `null`, and `null | split(_)` errors. Default it first: `(.details // "") as $d`.

## Fetching one occurrence's details on demand

`identify-failing-tests.sh` includes the full `details` for every non-muted occurrence in its response. If you need to re-fetch one occurrence (e.g., during the 5.3 re-dispatch loop where you want a fresh snapshot), use a build+test locator:

```bash
curl -sS --fail --socks5 localhost:8080 \
    -H "Authorization: Bearer $(cut -d= -f2 ~/.config/teamcity-access-token)" \
    -H "Accept: application/json" \
    "https://teamcity.a8c.com/app/rest/testOccurrences?locator=build:(id:<BUILD_ID>),test:(name:<URL_ENCODED_NAME>)&fields=testOccurrence(name,details)"
```

The test name needs URL-encoding (spaces, parens, `›` separators).

## Useful URLs

- Build configuration overview: `https://teamcity.a8c.com/buildConfiguration/<build-type-id>`
- Single build overview: `https://teamcity.a8c.com/buildConfiguration/<build-type-id>/<build-id>`
- REST API base: `https://teamcity.a8c.com/app/rest/`
- API reference (server-rendered): `https://teamcity.a8c.com/app/rest/swagger.json`
- Access token management: `https://teamcity.a8c.com/profile.html?item=accessTokens`
