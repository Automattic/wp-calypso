---
name: fix-flaky-e2e
description: Find flaky E2E tests on TeamCity and fix them. Scans recent builds of the main E2E build configurations via the TeamCity REST API, identifies tests that intermittently fail, reproduces locally, delegates the fix to the Playwright Test Healer agent, verifies stability, and opens a draft PR. Use when asked to fix flaky e2e tests, triage recent TeamCity failures, or stabilize a specific spec.
allowed-tools: Read, Glob, Grep, Edit, Write, Bash, Agent, AskUserQuestion, ToolSearch
---

# Fix Flaky E2E Tests

Automates the triage-and-fix loop for flaky E2E tests running on TeamCity (`teamcity.a8c.com`).

## Prerequisites

- `TEAMCITY_TOKEN` must be set in the environment. If missing, stop and instruct the user:
  > Generate a token at https://teamcity.a8c.com/profile.html?item=accessTokens (scope: "View project") and export it as `TEAMCITY_TOKEN`.
- `gh` CLI must be authenticated (`gh auth status`). Needed for opening the draft PR.
- A local Calypso dev server and the e2e environment must be runnable. See `test/e2e/AGENTS.md` and `test/e2e/docs-new/setup.md`.

## Build configurations in scope

The skill monitors these TeamCity build configs (IDs are stable, set in `.teamcity/_self/projects/WebApp.kt`):

| Display name | TeamCity build ID |
| --- | --- |
| E2E Tests (desktop) | `calypso_WebApp_Calypso_E2E_Playwright_desktop` |
| E2E Tests (mobile) | `calypso_WebApp_Calypso_E2E_Playwright_mobile` |
| E2E Tests (Playwright Test) | `calypso_WebApp_Calypso_E2E_Playwright_Test_Matrix` |
| Dashboard E2E Tests (PR) | `calypso_WebApp_Dashboard_E2E_Playwright_Test_Matrix` |

The `Required` GitHub check is an aggregator over these — skip it. The `Docker image` build is a dependency of the e2e configs but is not a test job; it's out of scope for this skill.

## Args

Pass one of:
- (nothing) — **scan mode**: list flaky candidates across all configs, let the user pick.
- A TeamCity build URL (e.g. `https://teamcity.a8c.com/viewLog.html?buildId=123456`) — scope to one build.
- A spec path or test title — scope to one test and pull its recent TC history.

## Step 1: Verify auth

```bash
test -n "$TEAMCITY_TOKEN" || { echo "TEAMCITY_TOKEN not set"; exit 1; }
curl -sSf -H "Authorization: Bearer $TEAMCITY_TOKEN" -H "Accept: application/json" \
  https://teamcity.a8c.com/app/rest/server > /dev/null
```

If the curl fails, stop and surface the error (likely expired token).

## Step 2: Detect flaky tests (scan mode)

For each build config in the table above, fetch the last 20 finished builds on `trunk`:

```bash
curl -sS -H "Authorization: Bearer $TEAMCITY_TOKEN" -H "Accept: application/json" \
  "https://teamcity.a8c.com/app/rest/builds?locator=buildType:(id:<BUILD_ID>),branch:trunk,state:finished,count:20&fields=build(id,number,status,finishDate,revisions(revision(version)))"
```

For each build, fetch failing test occurrences:

```bash
curl -sS -H "Authorization: Bearer $TEAMCITY_TOKEN" -H "Accept: application/json" \
  "https://teamcity.a8c.com/app/rest/testOccurrences?locator=build:(id:<BUILD>),status:FAILURE,muted:false,count:5000&fields=testOccurrence(name,status,duration,test(id,name))"
```

**Flakiness heuristic.** A test is flaky if, across the last 20 builds of a given config:
- it appears with status `FAILURE` in at least one build, AND
- it appears with status `SUCCESS` (or is absent on retry runs) in at least one other build, AND
- the spec file was not modified between the failing and passing runs (check with `git log --oneline <from>..<to> -- <spec-path>` — if the spec was touched, the failure may be legitimate).

Prefer TC's own signals when available: `testOccurrence.currentlyInvestigated`, `currentlyMuted`, and the `/app/rest/investigations` endpoint. Tests that are already muted are skipped (someone is on it).

Rank flakes by frequency (failures / total runs across the window). Present the top 10 to the user and ask which to fix (use `AskUserQuestion`).

## Step 3: Gather failure context for the chosen test

For the selected test, pull:
- The most recent failing `testOccurrence` details (error message + stacktrace):
  ```bash
  curl -sS -H "Authorization: Bearer $TEAMCITY_TOKEN" -H "Accept: application/json" \
    "https://teamcity.a8c.com/app/rest/testOccurrences/id:<OCCURRENCE_ID>?fields=name,status,details,build(id,number,webUrl)"
  ```
- Artifacts from the failing build (trace.zip, video, screenshots):
  ```bash
  curl -sS -H "Authorization: Bearer $TEAMCITY_TOKEN" -H "Accept: application/json" \
    "https://teamcity.a8c.com/app/rest/builds/id:<BUILD>/artifacts/children/?locator=recursive:true"
  ```
  Download the trace for the failing spec:
  ```bash
  curl -sSL -H "Authorization: Bearer $TEAMCITY_TOKEN" \
    "https://teamcity.a8c.com/app/rest/builds/id:<BUILD>/artifacts/content/<path-to-trace.zip>" \
    -o /tmp/flake-trace.zip
  ```
- Test history to confirm the flake pattern:
  ```bash
  curl -sS -H "Authorization: Bearer $TEAMCITY_TOKEN" -H "Accept: application/json" \
    "https://teamcity.a8c.com/app/rest/testOccurrences?locator=test:(name:<TEST_NAME>),buildType:(id:<BUILD_ID>),count:50&fields=testOccurrence(status,build(id,number,finishDate))"
  ```

## Step 4: Find the spec file locally

Map the TC test name to a spec file. TC names look like `suite > subsuite > title`. Grep `test/e2e/specs/**/*.spec.ts` and `test/e2e/specs/**/*.ts` for the deepest title, then confirm the match. Record the absolute path.

## Step 5: Reproduce locally

Check out a new branch from `trunk` (naming per `docs/git-workflow.md`):

```bash
git fetch origin trunk
git checkout -b fix/flaky-e2e-<short-slug> origin/trunk
```

Run the spec multiple times with `--reporter=list` (see `test/e2e/AGENTS.md` — omitting this flag makes the process hang waiting for the HTML report):

```bash
cd test/e2e
yarn playwright test <spec-path> --reporter=list --repeat-each=5
```

If it doesn't reproduce after 5 repeats, try with retries disabled and under CPU throttling conditions similar to CI. If still no repro, note this and proceed with the Healer agent anyway — the TC trace is the authoritative failure.

## Step 6: Hand off to the Playwright Test Healer agent

Delegate via the `Agent` tool with `subagent_type: "Playwright Test Healer"`. The prompt must be self-contained — the agent has no conversation history. Include:

- Absolute spec path.
- TeamCity build URL(s) where it failed.
- The exact failure message + stacktrace from Step 3.
- Link to the downloaded trace at `/tmp/flake-trace.zip`.
- History snapshot: "failed in N of last M builds on trunk".
- The instruction: **fix the flakiness in the test, not the product code**, unless the trace clearly indicates a product bug (then stop and report back instead).
- Conventions to honor: `test/e2e/docs-new/creating_reliable_tests.md`, `test/e2e/docs-new/new_style_guide.md`.

## Step 7: Verify stability

After the Healer reports a fix, run the spec 10 consecutive times:

```bash
cd test/e2e
yarn playwright test <spec-path> --reporter=list --repeat-each=10
```

All 10 must pass. If any fail, re-enter Step 6 with the new failure details. Cap at 3 heal cycles — if still flaky, stop and ask the user whether to quarantine (add the `quarantined` group to the spec) or escalate.

## Step 8: Open a draft PR

Follow `AGENTS.md` PR conventions:
- Draft PR, template from `.github/PULL_REQUEST_TEMPLATE.md`.
- Title: `E2E: fix flaky <short test name>`.
- Body:
  - `Part of #` — if the user provides a Linear ID, use `Part of LIN-XXX`.
  - **Proposed Changes**: one-line summary of what the Healer changed.
  - **Why**: flake rate `N/M` on `<config display name>`, with TC build URLs.
  - **Testing Instructions**: "ran spec 10x locally, all passed" + link to local trace.
  - Checklist items: mark only those that apply (most are inapplicable for a test-only fix).

```bash
gh pr create --draft --title "E2E: fix flaky <short test name>" --body "$(cat <<'EOF'
...body per above...
EOF
)"
```

Do **not** push or create the PR without user confirmation if the skill has made more than a trivial edit to non-test code.

## Step 9: (Optional) File a flaky-spec issue

If the user asks, file a GitHub issue using `.github/ISSUE_TEMPLATE/flaky-e2e-spec-report.yml`:

```bash
gh issue create --template flaky-e2e-spec-report.yml \
  --title "Flaky E2E: <spec>" \
  --body "..."
```

## Error handling and escape hatches

- TeamCity 401/403 → token expired or insufficient scope; stop and tell the user to regenerate.
- TeamCity 404 on a build ID → config was renamed; re-resolve by display name and warn that the hardcoded ID in this skill needs updating.
- Rate limiting (429) → back off exponentially, cap at 3 retries.
- If local reproduction repeatedly hangs, run with `DEBUG=pw:api` prepended and surface the first hang point to the user before continuing.
- Never modify a spec's `quarantined` group membership without explicit user approval.
