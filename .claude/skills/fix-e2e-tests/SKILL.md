---
name: fix-e2e-tests
description: Given a wp-calypso PR number, identify the failing E2E test(s) in that PR's CI run so they can be fixed. Use when asked to investigate or fix a failing E2E test on a specific PR.
allowed-tools: Bash, Agent
---

# Fix E2E Tests

Given a wp-calypso PR number, this skill identifies the failing E2E test(s) in that PR's CI run, asks the Playwright Test Healer agent to generate a fix, and opens a fix PR back against the original PR's branch so CI validates the repair.

Before touching anything else, the skill verifies that the two required tools are working: the GitHub CLI (used to read PR metadata and checks) and a TeamCity access token (used to fetch which individual tests failed, since GitHub's commit-status description only says "build failed"). If either isn't set up, the skill walks the user through configuring it.

Before each step, tell the user in one short sentence what you're about to do and why, so they aren't surprised by a Bash call or a follow-up setup request.

See [`examples/worked-run.md`](examples/worked-run.md) for an illustrative end-to-end walk-through — useful for pattern-matching the shape of each step's input and output before running the skill for the first time.

## Step 1: Verify GitHub CLI access

The skill uses `gh` (the GitHub CLI command, from <https://cli.github.com/>) to read PR metadata and check runs. Confirm `gh` is installed **and** its stored token actually works — `gh auth status` alone is not enough, as it can report success while the keyring token is stale and every API call returns 401.

Announce what you're checking (e.g., "Checking that the `gh` CLI is installed and authenticated — the skill uses it to read PR checks."), then run the probe as one Bash call. The API probe (`gh api user`) is the authoritative check; it fails non-zero on a bad or missing token.

```bash
if ! command -v gh >/dev/null 2>&1; then
  echo "GH_MISSING"
elif login=$(gh api user --jq .login 2>/dev/null) && [ -n "$login" ]; then
  echo "GH_OK $login"
else
  echo "GH_BAD"
fi
```

Interpret the result:

- `GH_OK` → tell the user GitHub access is confirmed in one short sentence (e.g., "GitHub access confirmed — authenticated as `<login>`."), then proceed to Step 2.
- `GH_MISSING` → `gh` is not installed. Tell the user to install it from <https://cli.github.com/> (on Linux typically via their package manager), then re-run the skill. Stop.
- `GH_BAD` → `gh` is installed but not authenticated, or the stored token is invalid/expired. Guide them through re-auth:

  > `gh` isn't authenticated to github.com. In Claude Code, run this with the `!` prefix so the OAuth flow stays interactive in your shell:
  >
  > ```
  > ! gh auth login -h github.com
  > ```
  >
  > Choose **HTTPS** and **Login with a web browser**, follow the prompts, then tell me when you're done.

  Wait for the user's confirmation, then re-run the check. Loop until it reports `GH_OK`. If the user wants to stop, stop.

Do not proceed past Step 1 until the check reports `GH_OK`.

## Step 2: Verify TeamCity access

The E2E pipeline runs on TeamCity (`teamcity.a8c.com`). GitHub's commit-status description is a generic "TeamCity build failed" — individual failing tests must be fetched from TeamCity's REST API, which requires a per-user access token and, on most Automattic workstations, a SOCKS5 tunnel on `localhost:8080`.

Announce what you're checking (e.g., "Checking access to TeamCity — this is where the E2E pipeline runs, and the skill gathers the failing tests from its REST API."), then run this probe once per skill invocation. It autodetects the network path, loads the persisted token, and validates it.

```bash
# Load token. Canonical (and only) location is ~/.config/teamcity-access-token — outside any
# .claude/ path so Claude Code's path heuristic doesn't treat it as a project file and prompt
# on every read. setup-token.sh writes here.
if [ -f "$HOME/.config/teamcity-access-token" ]; then
  TEAMCITY_TOKEN=$(cut -d= -f2 "$HOME/.config/teamcity-access-token" 2>/dev/null)
  [ -z "$TEAMCITY_TOKEN" ] && TEAMCITY_TOKEN=$(cat "$HOME/.config/teamcity-access-token")
fi

probe() { curl -sS -o /dev/null -w "%{http_code}" --max-time 6 "$@" "https://teamcity.a8c.com/" 2>/dev/null; }
TC_PROXY=""
if [[ ! "$(probe)" =~ ^(200|302|401|403)$ ]]; then
  if [[ "$(probe --socks5 localhost:8080)" =~ ^(200|302|401|403)$ ]]; then
    TC_PROXY="--socks5 localhost:8080"
  else
    echo "NET_UNREACHABLE"; exit 0
  fi
fi

if [ -z "${TEAMCITY_TOKEN:-}" ]; then
  echo "TC_TOKEN_MISSING proxy=[$TC_PROXY]"; exit 0
fi

CODE=$(curl -sS $TC_PROXY -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TEAMCITY_TOKEN" -H "Accept: application/json" \
  "https://teamcity.a8c.com/app/rest/server")
case "$CODE" in
  200)     echo "TC_OK proxy=[$TC_PROXY]";;
  401|403) echo "TC_TOKEN_BAD proxy=[$TC_PROXY]";;
  *)       echo "TC_HTTP_$CODE proxy=[$TC_PROXY]";;
esac
```

Interpret:

- `TC_OK` → record the `proxy=[...]` value. Every subsequent TeamCity call in later steps must use `curl $TC_PROXY ...` with that value. Continue to Step 3.
- `NET_UNREACHABLE` → ask the user whether a VPN / proxy tunnel is running; stop until they confirm one way or another, then retry the probe.
- `TC_TOKEN_MISSING` / `TC_TOKEN_BAD` → run the token setup flow below, then retry the probe.
- `TC_HTTP_<code>` → show the user the code and stop; it's not something the skill can recover from.

### Token setup

The skill stores the TeamCity access token at `~/.config/teamcity-access-token` (mode 0600, per-user, outside any repo). This location intentionally avoids any `.claude/` path component — Claude Code's permission heuristic treats paths containing `.claude/` as project files and prompts on every read, so keeping the token outside that namespace is what makes automated runs frictionless. Never write the token to the repo, `.claude/settings*.json`, or a shell profile.

**Critical UX constraint.** Do not let the user paste the token into Claude Code — not into the chat and especially not via the `!` prefix. Claude Code echoes `!`-command stdin into the transcript, which defeats hidden-password reads and leaks the token.

Guide the user as follows:

> 1. Open <https://teamcity.a8c.com/profile.html?item=accessTokens>.
> 2. Click **Create access token**.
> 3. **Token name**: `claude-teamcity-access-token`.
> 4. **Expire in**: leave blank.
> 5. **Permissions scope**: _same as current user_.
> 6. Click **Create**.
> 7. Copy the token to your clipboard — TeamCity only shows it once, so if you dismiss the dialog before copying you'll have to regenerate.
>
> **Do not paste the token into this chat.** Anything you type here ends up in the conversation transcript. The next step is run in a _separate_ terminal so the hidden-password prompt stays hidden.
>
> 8. In a **separate terminal window (not Claude Code)**, `cd` to the wp-calypso repo and run:
>
>    ```bash
>    bash .claude/skills/fix-e2e-tests/setup-token.sh
>    ```
>
>    At the hidden prompt, paste the token and press Enter. The script refuses to run under a non-TTY stdin precisely to defeat the `!`-prefix footgun, so if you run it via `!` it will abort and remind you to use a separate terminal.
>
> 9. Come back here and say **done**.

After "done", re-run the probe block. Loop until it reports `TC_OK`.

Do not proceed past Step 2 until the probe reports `TC_OK`.

## Step 3: Resolve the PR

The skill operates on one PR at a time. The user may have passed the PR identifier as an argument when invoking the skill — accept either form:

- A bare PR number (e.g., `110080`).
- A full GitHub PR URL on `Automattic/wp-calypso` (e.g., `https://github.com/Automattic/wp-calypso/pull/110080`). Extract the trailing number.

If the argument is a URL for a different repository, or is not a number / recognizable PR URL, treat it as missing and ask the user.

**If no PR identifier was provided**, ask the user in a short chat message (do not use `AskUserQuestion` — this is free-form text, not a pick list):

> Which PR on `Automattic/wp-calypso` should I investigate? Paste the PR number (e.g., `110080`) or URL.

Wait for the reply and parse it the same way.

Once you have a number, announce in one short sentence what you're about to do (e.g., "Fetching PR #<NUMBER> from GitHub to confirm it exists and load its check statuses."), then validate the PR and capture its metadata in one Bash call. Keep the output for later steps — branch name and HEAD SHA will be needed to look up checks.

```bash
gh pr view <PR_NUMBER> --repo Automattic/wp-calypso \
  --json number,title,state,isDraft,headRefName,headRefOid,url,statusCheckRollup 2>&1
```

- Exit 0 with JSON → the PR exists. Show the user a one-line confirmation (PR number, title, state, branch) and proceed.
- Non-zero / "not found" → tell the user the PR wasn't found on `Automattic/wp-calypso` and ask for another one. Loop until you get a valid PR or the user stops.

Do not proceed past Step 3 until a PR has been successfully resolved.

## Step 4: Identify the failing E2E test(s)

Using the `statusCheckRollup` captured in Step 3, find the failing E2E checks and ask TeamCity which individual tests failed.

`statusCheckRollup` is GitHub's unified list of every CI check attached to a PR's head commit. It merges two shapes in one array: **`CheckRun` entries** (from GitHub Actions) and **`StatusContext` entries** (from external systems posting to the commit-status API — TeamCity on this repo). Each entry has a name/context, a pass/fail state, and a URL back to the system that produced it. The skill uses it because it already has everything needed to find failing E2E jobs without making a second GitHub API call.

### 4.1: Find the failing E2E check(s)

From `statusCheckRollup`, pick entries that meet **all** of:

- state/conclusion is `FAILURE`
- URL starts with `https://teamcity.a8c.com/buildConfiguration/`
- context (`StatusContext.context`) or name (`CheckRun.name`) contains the phrase `E2E Tests`

The known PR-level E2E checks on wp-calypso are defined in `.teamcity/_self/projects/WebApp.kt`:

| Check name | Runner | Healer-compatible? |
| --- | --- | --- |
| `E2E Tests (Playwright Test)` | Playwright Test | yes |
| `Dashboard E2E Tests (PR)` | Playwright Test | yes |
| `A4A E2E Tests (PR)` | Playwright Test | yes |
| `E2E Tests (desktop)` | Jest runner (legacy) | no |
| `E2E Tests (mobile)` | Jest runner (legacy) | no |

Each match's URL has the form `https://teamcity.a8c.com/buildConfiguration/<config-id>/<build-id>`. Extract the trailing numeric `<build-id>` from each. The `<config-id>` segment identifies the runner: anything containing `_Playwright_Test_Matrix`, `_Dashboard_`, or `_A4A_` is Playwright Test; `_Playwright_desktop` / `_Playwright_mobile` are Jest legacy.

If **only** Jest-legacy builds failed, tell the user the Healer can't fix Jest-runner tests (that framework is being phased out per `test/e2e/AGENTS.md`) and stop. Otherwise collect the Playwright-Test build IDs and proceed.

If zero failing E2E checks exist at all, tell the user "no failing E2E tests on this PR" and stop.

See [`references/teamcity-api.md`](references/teamcity-api.md) for the full table of build IDs and the higher-level API behavior we depend on.

### 4.2: Fetch failing test occurrences

For each failing build ID from 4.1, run the helper script. It probes for the SOCKS5 proxy, rides out transient TeamCity errors, drops muted occurrences, and emits a JSON array of `{build, name, reason, details}` objects:

```bash
.claude/skills/fix-e2e-tests/identify-failing-tests.sh <BUILD_ID>
```

- **`reason`** is a one-line summary (≤160 chars), suitable for the 4.3 candidate table.
- **`details`** is the full `details` field (stack trace + Playwright call log), passed verbatim to the Healer in Step 5.2.

If the output is `[]`, the build has no non-muted failing tests — move to the next build.

If the script exits non-zero, the failure mode is in stderr. Likely cases:

| Exit | Cause | Action |
| --- | --- | --- |
| 1 | Token missing/unreadable | Re-run Step 2's setup flow. |
| 3 | Cannot reach TeamCity (direct or SOCKS5) | Check the VPN / proxy tunnel, then retry. |
| 22 + HTTP 401/403 in stderr | Token expired or revoked mid-run | Re-run Step 2's setup flow. |
| 22 + HTTP 5xx after retries | TeamCity is having a bad day | Retry the script; if it keeps failing, check TC status. |

See [`identify-failing-tests.sh`](identify-failing-tests.sh) for the curl/jq specifics, and [`references/teamcity-api.md`](references/teamcity-api.md) for the higher-level API behavior (locator gotchas, why `defaultFilter:false`, `currentlyInvestigated` unreliability, the indented-error-class quirk in `details`).

**Do not re-parse the raw JSON by grepping tool-results files on disk.** The script's output is the canonical view of failing tests; never reach into `/home/*/.claude/projects/...` for any reason.

### 4.3: Filter and present candidates

The `jq` pipeline in 4.2 already dropped muted/currentlyMuted occurrences and distilled each remaining one to `{build, name, reason}`. This sub-step is about **presenting** those candidates, not re-filtering them.

(Do **not** filter on `currentlyInvestigated`: on Automattic's TeamCity instance the flag is unreliable — investigations are often stale, project-scoped, and not surfaced in the build's failed-tests list. Filtering on it causes the skill's candidate list to silently diverge from what the user sees on the TC build Overview. The jq pipeline above reflects that by omitting the field entirely.)

For each candidate in the slimmed list, derive the display fields:

- **Spec path** — the part of `name` before the first `:` (e.g., `infrastructure/infrastructure__flaky-fixture.spec.ts`). Prepend `test/e2e/specs/` to get the repo-relative path.
- **Test title** — everything after the last `›` in `name`.
- **Build** — already projected as `build` (e.g., `[Desktop]`, `[Mobile]`).
- **Reason** — already projected as `reason`, already truncated.
- **Hint** — a one-word classifier derived from `reason`. The trailing `?` is deliberate: this is a heuristic from a single line of the trace, not a verdict.
  - `flake?` if `reason` starts with `TimeoutError` or contains `not visible` / `not found` / `not attached`.
  - `regression?` if `reason` looks like an `expect(...)` failure or `AssertionError` (a behavioral assertion didn't hold).
  - `?` if neither pattern matches.

Always render the full table to the user, **even if the list looks identical to a prior run in the same conversation**. This is the user's decision surface — don't collapse it into a one-line reference to "the same candidates as before", because the user needs the spec paths, test titles, and failure reasons in front of them to make a choice.

| #   | Spec                                                                  | Test                    | Build    | Hint   | Reason                                                      |
| --- | --------------------------------------------------------------------- | ----------------------- | -------- | ------ | ----------------------------------------------------------- |
| 1   | `test/e2e/specs/infrastructure/infrastructure__flaky-fixture.spec.ts` | Flaky by race condition | [Mobile] | flake? | TimeoutError: page locator '#late' not visible within 150ms |

Then:

- **Zero candidates** → tell the user all failing tests are muted. **End the skill here** — there's nothing for Step 5 to fix.
- **One candidate** → state it as the test you're going to fix, then **proceed to Step 5** with that test selected.
- **Multiple candidates** → ask in plain chat which to pursue, referencing the `#` column of the table you just printed (do not use `AskUserQuestion` — its picker header renders as dark-on-dark in some Claude Code themes, and since the candidates are already listed above, a free-form reply is clearer). Example: "Reply with the number of the test you want to pursue." **Wait for the reply before proceeding**, then carry the chosen test into Step 5.

The skill only continues into Step 5 once exactly one test has been identified. If the user declines to pick or says stop, end the skill cleanly and don't run Step 5.

## Step 5: Generate a fix and open a draft PR

Given a selected failing test from Step 4, create a git worktree at the right base ref, delegate the repair to the `Playwright Test Healer` agent working in that worktree, review the diff with the user, then push and open a draft PR assigned to the user.

### 5.1: Create the worktree on top of the PR's branch

The fix has to be applied at a commit that actually contains the failing spec, and the user running the skill usually wants CI on the PR under investigation to go green. Always branch the fix off the **PR's HEAD** (captured as `headRefOid` in Step 3) and always target the fix PR at the **PR's branch** (`headRefName`). This:

- guarantees the spec exists in the worktree (it's the tree that just failed CI);
- unblocks the PR directly — merging the fix PR into the original PR turns that PR's next CI run green;
- keeps scope predictable. If the failure actually lives on trunk too and the user prefers a trunk-targeted fix, they can re-target the base from the GitHub UI after review.

Do **not** use the Agent tool's built-in `isolation: "worktree"` — it bases the worktree on the current `HEAD`, which is almost never the PR branch.

Before any setup, confirm the PR's HEAD hasn't moved since Step 3. The CI failure we identified was tied to the SHA captured then; if the author has pushed since, the test code at the new HEAD may differ from the version that failed.

```bash
gh pr view <PR_NUMBER> --repo Automattic/wp-calypso --json headRefOid --jq .headRefOid
```

- If the output equals `<PR_SHA>` from Step 3 → proceed.
- If it differs → tell the user in plain chat (don't use `AskUserQuestion`): "PR has been pushed to since I looked it up — HEAD is now `<new>`, was `<old>`. The CI failure we triaged was on the old HEAD; the test may have changed at the new HEAD. Reply **proceed** to fix against the old HEAD anyway (the resulting PR will reach back in history, which reviewers may find confusing), or **restart** to re-run the skill against the current state."
  - On **proceed**: continue with `<PR_SHA>` unchanged.
  - On **restart**: stop the skill cleanly. No worktree has been created yet, so there's nothing to clean up.

Fetch the PR's tip and create the worktree. Run each command as a **separate Bash call** with the values inlined, not as one compound script — Claude Code's permission allowlist matches the entire command string against prefix patterns, so multi-statement scripts starting with a variable assignment don't match `Bash(git fetch:*)` etc. and trigger a permission prompt on every run.

Substitute the literal values from Step 3 directly into each command. Pick a unique worktree path like `.claude/worktrees/fix-e2e-<slug>-<timestamp>` (the timestamp keeps parallel runs from colliding; `date +%s` is fine).

Derive **slug** from the failing spec's filename (carried out of Step 4 — e.g., `infrastructure__flaky-fixture.spec.ts`): strip the trailing `.spec.ts`, lowercase, and replace any character outside `[a-z0-9_-]` with `-`. Cap at 50 characters. The example becomes `infrastructure__flaky-fixture`. The slug feeds the worktree path and the branch name (`fix/e2e-<slug>`); the human-readable commit/PR titles in 5.4 use the **test title** instead. Slug from spec basename rather than test title because it's stable, already URL-safe, and unique enough — one spec is usually the unit of fix even if several test cases inside it failed.

Then capture the absolute path of the main checkout. The symlinks in 5.1.3 and the cleanup in 5.5 need an absolute path that works on every developer's machine, and shell variables don't carry between Bash calls — so this one call gets the value, and you inline the literal result into the later calls:

```bash
git rev-parse --show-toplevel
```

Record the result as **REPO_ROOT**.

Check whether a `fix/e2e-<slug>` branch already exists locally from a prior run of this skill (when a PR was opened in 5.4, the cleanup in 5.5 deliberately keeps the local branch — so this is the common case when re-running against the same spec):

```bash
git show-ref --verify --quiet refs/heads/fix/e2e-<slug>
```

Exit 0 means the branch exists. Set **BRANCH** to `fix/e2e-<slug>-<timestamp>` (same timestamp as the worktree path). Exit 1 means it doesn't — set BRANCH to the unsuffixed `fix/e2e-<slug>`. Inline the chosen value everywhere `<BRANCH>` appears below. Don't auto-delete the prior branch — the user may still want it (or its PR).

Check for stale worktrees from prior runs of this skill. Step 5.5 normally cleans up after itself, but a crashed or interrupted run can leave a `.claude/worktrees/fix-e2e-*` directory behind. These don't block the new run (the timestamp keeps paths unique), but they accumulate and confuse later diagnosis.

```bash
git -C <REPO_ROOT> worktree list | grep "/.claude/worktrees/fix-e2e-" || true
```

If empty, continue. If one or more orphans are listed, show them to the user verbatim and ask in plain chat whether to clean them up before creating the new worktree. On agreement, remove each one (and only the worktree — leave its branch in place since it may still hold the user's prior work):

```bash
git -C <REPO_ROOT> worktree remove <orphan-path> --force
```

On decline, proceed without cleanup.

Run the setup script. It fetches `origin/<TARGET_BRANCH>` so the PR's tip is locally resolvable, creates a new branch + worktree at `<PR_SHA>`, and symlinks `node_modules` and `.husky/_` from the main checkout into the worktree so the pre-commit hook works without re-running yarn / husky install.

Announce first, so the user isn't surprised when the worktree appears or (in Step 5.5) disappears:

> Creating a worktree at `.claude/worktrees/fix-e2e-<slug>-<timestamp>` on a new `<BRANCH>` branch pointing at the PR's HEAD. It's local, ignored by git, and will be removed automatically when the skill finishes (after the PR is opened or if the skill exits earlier).

Then run:

```bash
.claude/skills/fix-e2e-tests/setup-worktree.sh <PR_SHA> <BRANCH> .claude/worktrees/fix-e2e-<slug>-<timestamp> <TARGET_BRANCH>
```

See [`setup-worktree.sh`](setup-worktree.sh) for the rationale (why symlinks instead of installing in the worktree, why both `node_modules` and `.husky/_` are required, why we never skip the pre-commit hook with `--no-verify`). The script runs as a single command from the assistant's perspective, so its internal `mkdir` / `cd` / etc. don't trip Claude Code's sensitive-path or expansion-obfuscation heuristics the way inline assistant Bash calls would.

If the script exits non-zero:

- **Exit 2** — not inside a git repo. Check your shell's cwd.
- **Exit 3** — `node_modules` or `.husky/_` missing in the main checkout. Run `yarn install` first.
- **Other** — propagated git failure (e.g., the branch name already exists, the remote is unreachable). Stderr names the cause.

Don't add extra sanity-check calls after the script (e.g., `ls` on the spec path) — the harness hooks `ls` as a filesystem read and its path heuristic can trigger a permission prompt for paths under `test/e2e/specs/…`. If the spec isn't actually in the worktree, the Healer's Read call in 5.2 will fail with a clear error; that's soon enough.

Record these values for later sub-steps (keep them in your working memory; later Bash calls must inline them rather than reference shell variables):

- **SLUG** — derived from the spec basename (see lead-in above)
- **WORKTREE_DIR** — `.claude/worktrees/fix-e2e-<slug>-<timestamp>`
- **BRANCH** — `fix/e2e-<slug>`, or `fix/e2e-<slug>-<timestamp>` if the unsuffixed form already exists locally
- **PR_SHA** — from Step 3
- **TARGET_BRANCH** — from Step 3
- **REPO_ROOT** — absolute path of the main checkout (captured above)

### 5.2: Delegate the fix to the Healer

Dispatch the Agent tool with `subagent_type: "Playwright Test Healer"` and **no** `isolation` parameter (we manage the worktree ourselves).

Use the **initial-dispatch template** in [`references/healer-prompt.md`](references/healer-prompt.md). Fill in the placeholders (`<WORKTREE_DIR>`, `<SPEC_ABS>`, `<TEST_TITLE>`, `<BUILD>`, `<TC_BUILD_URL>`, `<HINT>`, `<DETAILS>`) from values recorded in 5.1 and 4.3, then send the filled prompt as the Agent dispatch. The template carries all constraints (no skip/mute, no product-code edits unless reporting a bug, framework docs to follow, tool restrictions) — don't restate them inline here.

Exit conditions (also documented at the bottom of the template):

- Healer reports a **product bug** → surface verbatim to the user, remove the worktree (`git -C <REPO_ROOT> worktree remove <WORKTREE_DIR> --force`), stop.
- Healer returns **no changes** → tell the user, remove the worktree, stop.
- Otherwise → proceed to 5.3.

### 5.3: Review the diff with the user

Show the user the root-cause + fix summary from the Healer and the diff. Two things matter here:

1. **The Healer's edits are uncommitted at this point.** So `git diff <BASE>...HEAD` (three-dot, committed-history form) returns empty. Use `git diff <BASE>` (two-dot, compares working tree against the base) — that reflects what the Healer actually changed.
2. **The diff must land in the chat message, not just in the Bash tool output.** Claude Code folds Bash output into a collapsed block; if the skill says "Diff above" while the diff is hidden behind "ctrl+o to expand", the user is being asked to confirm a push they can't see. Capture the diff and quote it inline in your next chat message.

Run each `git` call separately with literal values inlined (not shell variables), so each matches the allowlist prefix without prompting:

```bash
git -C .claude/worktrees/fix-e2e-<slug>-<timestamp> --no-pager diff --stat <PR_SHA>
```

```bash
git -C .claude/worktrees/fix-e2e-<slug>-<timestamp> --no-pager diff <PR_SHA>
```

Then in the **next assistant message**, present the root cause + fix summary from the Healer and inline the diff inside a fenced code block (not a reference to "the diff above"). Shape:

> **Root cause.** <Healer's one-paragraph root cause.>
>
> **Fix.** <Healer's one-paragraph fix description.>
>
> **Diff** (stat):
>
> ```
> <paste --stat output here>
> ```
>
> ```diff
> <paste full unified diff here; truncate with "… (N more lines elided, say 'show full diff' to see the rest)" only if the diff exceeds ~120 lines>
> ```
>
> Ready to push and open a draft PR against `<TARGET_BRANCH>`? Say **yes** to proceed, or tell me what to change first.

If the user asks to see the elided portion, re-render with no truncation. Wait for an explicit affirmative before pushing.

**If the user asks for changes**, re-dispatch the Healer to revise the same worktree. Keep its prior uncommitted edits in place (resetting them throws away signal that may be partially right) and use the **re-dispatch template** in [`references/healer-prompt.md`](references/healer-prompt.md).

Capture a fresh diff just before re-dispatch so `<PRIOR_DIFF>` reflects the current state of the worktree, including any earlier iterations in this loop:

```bash
git -C .claude/worktrees/fix-e2e-<slug>-<timestamp> --no-pager diff <PR_SHA>
```

Fill in `<USER_FEEDBACK>` and `<PRIOR_DIFF>` (plus the unchanged `<WORKTREE_DIR>` / `<SPEC_ABS>` / etc. from the initial dispatch), then dispatch and loop back to the diff review at the top of 5.3.

### 5.4: Commit, push, and open the PR

Commit the Healer's edits (they arrive uncommitted), push the branch, and open the PR — all scoped to the worktree via `git -C` so the user's shell cwd stays at the main checkout. As in 5.1 and 5.3, each call is a separate Bash invocation with literal values inlined.

**Before each call, announce what's happening in one short sentence** so the user doesn't have to infer from the raw bash output. The subcalls are visible to the user as tool invocations in the transcript; a one-line narration per call ("Staging the Healer's edits.", "Committing with root-cause and fix in the body.", "Pushing to origin.", "Opening the draft PR.") is enough and matches the pattern from Steps 1–3.

**Stage** (announce: "Staging the Healer's edits."):

```bash
git -C .claude/worktrees/fix-e2e-<slug>-<timestamp> add -A
```

**Commit** (announce: "Committing — the message carries the root cause and fix summary so the PR body can be derived from it."):

```bash
git -C .claude/worktrees/fix-e2e-<slug>-<timestamp> commit -m "$(cat <<'EOF'
E2E: fix <short test title>

<one-paragraph root cause>

<one-paragraph fix description>
EOF
)"
```

**Push** (announce: "Pushing the branch to origin."):

```bash
git -C .claude/worktrees/fix-e2e-<slug>-<timestamp> push -u origin <BRANCH>
```

**Open the PR** (announce: "Opening the PR against `<TARGET_BRANCH>` and assigning it to you.").

Do **not** `cd` into the worktree. Use `gh pr create --repo Automattic/wp-calypso --head <BRANCH> --base <TARGET_BRANCH> ...` — the `--head` flag tells gh which branch to PR from, so no cd is needed. This sidesteps two harness gotchas (see [`references/permission-heuristics.md`](references/permission-heuristics.md)): the persistent-cwd issue (cd into a soon-to-be-removed dir leaves the shell stranded) and the `cd && git` "untrusted directory" prompt.

**Open the PR as ready-for-review, not draft.** AGENTS.md's default PR guidance is "create as draft", but this skill deliberately diverges: wp-calypso's E2E test matrix (and several other checks) is configured to skip draft PRs, and the whole point of opening the fix PR is to let CI validate the Healer's change. Opening as draft would leave the dev with no CI signal until they manually clicked "Ready for review", which is the opposite of what this skill is trying to accomplish.

```bash
gh pr create --repo Automattic/wp-calypso --assignee @me \
  --head <BRANCH> --base <TARGET_BRANCH> \
  --title "E2E: fix <short test title>" \
  --body "$(cat <<'EOF'
...body...
EOF
)"
```

PR body structure (per `.github/PULL_REQUEST_TEMPLATE.md` and AGENTS.md):

The fix PR targets the parent PR's branch, not trunk — it's a piece of the parent PR's work, not an independent change to the default branch. Two template sections are therefore omitted:

- **Omit `Part of #`** entirely. The parent PR carries that reference; this one is scoped to that PR's work.
- **Omit the `Pre-merge Checklist`** entirely. The checklist is a gate for merges into trunk; this PR merges into the parent PR's branch, so it doesn't apply. The parent PR keeps its own checklist.

Start the body at **Proposed Changes** and include only these sections:

- **Proposed Changes** — 2–3 bullets describing what changed in the test.
- **Why are these changes being made?** — the Healer's root-cause paragraph, with a link to the TeamCity build URL as evidence of the failure.
- **Testing Instructions** — `Run \`yarn playwright test <spec> --reporter=list --repeat-each=10\` locally; all runs should pass.` Don't claim you verified unless you actually did.

Do not mention individuals by name. Do not link to wordpress.com URLs (AGENTS.md).

### 5.5: Clean up and report

Once the PR is pushed and created, the worktree has done its job — the branch and commits live on the `origin` remote, and the local worktree is disposable. Remove it so stale worktrees don't accumulate across runs (previous iterations of this skill left orphaned directories behind, which then confused diagnosis on later runs).

Announce: "PR opened. Cleaning up the worktree."

Run the cleanup as a single Bash call with the worktree path inlined, using `git -C <REPO_ROOT>` (the absolute path captured at the start of 5.1) to avoid any reliance on the shell's cwd (which can be broken if a prior step left it pointing inside a removed directory):

```bash
git -C <REPO_ROOT> worktree remove .claude/worktrees/fix-e2e-<slug>-<timestamp> --force
```

`--force` is used deliberately: the worktree contains a symlinked `node_modules` (from Step 5.1.3) and uncommitted husky-generated state from the pre-commit hook, neither of which should block removal. Nothing of value lives only in the worktree — everything worth keeping is in the branch on origin.

Do **not** `cd` into or near the worktree before this call (see [`references/permission-heuristics.md`](references/permission-heuristics.md) for the `cd && git` heuristic).

Do **not** also delete the `<BRANCH>` local branch: that branch points at the commit you just pushed, and leaving it in place is helpful if the user wants to pull new changes into it or amend later. Remove it only if the PR is abandoned.

If the PR was **not** opened (e.g., the Healer reported a product bug in 5.2 and the skill stopped, or the user declined to push in 5.3), also remove the worktree — but _do_ delete the local branch too, since nothing was pushed:

```bash
git worktree remove .claude/worktrees/fix-e2e-<slug>-<timestamp> --force
git branch -D <BRANCH>
```

Then tell the user the outcome. The message must make it clear that **the Healer's fix is heuristic and the developer is responsible for validating it before requesting review or merging**. The fix was generated from the CI failure trace, not a local rerun — CI will exercise it again now that the PR is open (not draft), but that's one signal, not a guarantee.

Use a short, structured block so the validate-before-review framing is impossible to miss:

> **PR opened** against `<TARGET_BRANCH>`: `<url>` — assigned to you, CI is running.
>
> The fix was generated by the Playwright Test Healer based on the CI failure output. Before requesting review or merging, validate it — e.g., `yarn playwright test <spec-rel-path> --reporter=list --repeat-each=10` locally, or confirm the PR's CI passes on a few runs of the previously-failing check.
>
> Worktree cleaned up.

On the no-PR path (Healer flagged a product bug, or the user declined to push), the tone is different — no validation nudge, just the facts:

> Healer reported a product bug — no PR opened. Worktree and branch cleaned up.

Stop.
