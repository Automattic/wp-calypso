---
name: fix-e2e-tests
description: Given a wp-calypso PR number, identify the failing E2E test(s) in that PR's CI run so they can be fixed. Use when asked to investigate or fix a failing E2E test on a specific PR.
allowed-tools: Bash, Agent
---

# Fix E2E Tests

Given a wp-calypso PR number, this skill identifies the failing E2E test(s) in that PR's CI run, asks the Playwright Test Healer agent to generate a fix, and opens a fix PR back against the original PR's branch so CI validates the repair.

Before touching anything else, the skill verifies that the two required tools are working: the GitHub CLI (used to read PR metadata and checks) and a TeamCity access token (used to fetch which individual tests failed, since GitHub's commit-status description only says "build failed"). If either isn't set up, the skill walks the user through configuring it.

Before each step, tell the user in one short sentence what you're about to do and why, so they aren't surprised by a Bash call or a follow-up setup request.

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

From `statusCheckRollup`, pick entries where the context (`StatusContext.context`) or name (`CheckRun.name`) contains `E2E` and state/conclusion is `FAILURE`. Each points at TeamCity via a URL of the form:

```
https://teamcity.a8c.com/buildConfiguration/<config-id>/<build-id>
```

Extract the trailing numeric `<build-id>` from each. Collect them all — a PR may have more than one failing E2E check.

If zero failing E2E checks exist, tell the user "no failing E2E tests on this PR" and stop.

### 4.2: Fetch failing test occurrences

For each failing build ID from 4.1, query TeamCity in **one curl statement per build, self-contained** — no pre-call token-loading loop, no shell variable carryover from Step 2. Each Bash invocation is isolated (shell state doesn't persist between calls), so the token must be read inline from its persisted file, and the proxy flag must be inlined literally based on the `TC_PROXY` value recorded in Step 2.

Avoid compound scripts with `{ ... }` group commands and quoted `"$VAR"` expansions in the same statement — Claude Code's Bash permission heuristic flags the combination as potential "expansion obfuscation" and will prompt for every run. A single `curl` invocation with a `$(cut ...)` command substitution doesn't trigger the heuristic.

**Slim the response with `jq` at the Bash layer** so the assistant doesn't receive a wall of JSON that overflows its context. If the response is too big to hold in-head, the model will be tempted to grep the raw JSON out of the tool-results cache on disk — and that cache lives under `/home/<user>/.claude/projects/...`, which triggers the same `.claude/` path heuristic that has prompted us repeatedly before. Don't let it get there: produce a compact, ready-to-read list from the curl call itself.

```bash
curl -sS --socks5 localhost:8080 -H "Authorization: Bearer $(cut -d= -f2 ~/.config/teamcity-access-token)" -H "Accept: application/json" "https://teamcity.a8c.com/app/rest/testOccurrences?locator=build:(id:<BUILD_ID>,defaultFilter:false),status:FAILURE,count:100&fields=count,testOccurrence(id,name,muted,currentlyMuted,build(buildType(name)),details)" | jq '.testOccurrence | map(select(.muted == false and .currentlyMuted == false)) | map({build: .build.buildType.name, name, reason: ((.details // "") as $d | ($d | split("\n") | map(select(test("^[[:space:]]*(TimeoutError|Error|expect|AssertionError)"))) | first) // ($d | split("\n") | first) | .[0:160])})'
```

**Keep this entire bash command on a single line, no line continuations.** Two Claude Code heuristics combine to make any other shape prompt for permission on every run:

- `jq -f <script-file>` is flagged as "dangerous flags that could execute code or read arbitrary files" — `-f` is hardcoded into the heuristic, no allowlist pattern overrides it. So the script must be inline.
- A multi-line jq script with embedded `|` operators confuses the command parser: it reads the jq's internal `|` as extra shell pipeline stages and can't form a stable pattern, so the resulting prompt doesn't offer a "session-allow" option either. Single-line keeps the parser happy.

The regex deliberately matches `expect` rather than `expect\(` for the same parser-friendliness reason: `\\(` inside the quoted jq string risks tripping the "expansion obfuscation" heuristic. `expect` alone is good enough to catch `expect(...)` lines without the escape.

What this pipeline does and why each piece:

- The `fields=` projection deliberately omits `currentlyInvestigated` and `id`: the flag isn't a reliable filter on this TeamCity instance (see the project memory), and the occurrence ID isn't used downstream.
- Filters muted/currentlyMuted occurrences **at the jq layer**. Applying `muted:false` in the TeamCity locator alongside `defaultFilter:false` has given inconsistent results in practice; doing it in jq is reliable and easy to verify from the output.
- Picks the first line of `details` that contains a recognizable error class (`TimeoutError`, `Error`, `expect`, `AssertionError`) and truncates to 160 chars. Falls back to the first line if no match.
- Three jq subtleties (don't try to simplify them away — each is load-bearing):
  - `(.details // "") as $d` binds the original details to `$d` before the pipeline starts. Without this, the `// (.details | …)` fallback runs in the inner context (where `.` is the matched line, not the occurrence object) and errors with `Cannot index array with string "details"`.
  - The regex anchor allows leading whitespace: `^[[:space:]]*(…)`. Playwright's `details` blob indents the actual error class line (e.g., `    TimeoutError: …`); a strict `^(…)` anchor misses it and you get only the unhelpful `FAILURE:` summary line. POSIX bracket class `[[:space:]]` is used instead of `\s` because the backslash risks tripping Claude Code's expansion-obfuscation heuristic.
  - `.details // ""` defaults missing `details` to an empty string, so a stray occurrence without that field doesn't crash the pipeline.
- Leaves the object with just three fields per candidate (`build`, `name`, `reason`). Typical output for a 9-occurrence build is maybe 2–5 objects totaling a few hundred tokens — small enough to process in-head.

If Step 2 recorded no proxy (`TC_PROXY=""`, direct connection works), drop the `--socks5 localhost:8080` flag. The proxy flag is known at this point in the skill run — inline it, don't dereference shell variables. The token path is always `~/.config/teamcity-access-token`.

**Do not re-parse the raw JSON by grepping tool-results files on disk.** If the output above isn't enough — e.g., you need the full `details` for the Healer's prompt — re-issue the curl with a build+test-specific locator to fetch only that one occurrence's details. Never reach into `/home/*/.claude/projects/...` for any reason.

`defaultFilter:false` is required: the top-level build is a matrix with snapshot dependencies (`[Desktop]`, `[Mobile]`, etc.), and the actual test failures live in those children. Without it, the response is empty.

### 4.3: Filter and present candidates

The `jq` pipeline in 4.2 already dropped muted/currentlyMuted occurrences and distilled each remaining one to `{build, name, reason}`. This sub-step is about **presenting** those candidates, not re-filtering them.

(Do **not** filter on `currentlyInvestigated`: on Automattic's TeamCity instance the flag is unreliable — investigations are often stale, project-scoped, and not surfaced in the build's failed-tests list. Filtering on it causes the skill's candidate list to silently diverge from what the user sees on the TC build Overview. The jq pipeline above reflects that by omitting the field entirely.)

For each candidate in the slimmed list, derive the display fields:

- **Spec path** — the part of `name` before the first `:` (e.g., `infrastructure/infrastructure__flaky-fixture.spec.ts`). Prepend `test/e2e/specs/` to get the repo-relative path.
- **Test title** — everything after the last `›` in `name`.
- **Build** — already projected as `build` (e.g., `[Desktop]`, `[Mobile]`).
- **Reason** — already projected as `reason`, already truncated.

Always render the full table to the user, **even if the list looks identical to a prior run in the same conversation**. This is the user's decision surface — don't collapse it into a one-line reference to "the same candidates as before", because the user needs the spec paths, test titles, and failure reasons in front of them to make a choice.

| #   | Spec                                                                  | Test                    | Build    | Reason                                                      |
| --- | --------------------------------------------------------------------- | ----------------------- | -------- | ----------------------------------------------------------- |
| 1   | `test/e2e/specs/infrastructure/infrastructure__flaky-fixture.spec.ts` | Flaky by race condition | [Mobile] | TimeoutError: page locator '#late' not visible within 150ms |

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

Fetch the PR's tip and create the worktree. Run each command as a **separate Bash call** with the values inlined, not as one compound script — Claude Code's permission allowlist matches the entire command string against prefix patterns, so multi-statement scripts starting with a variable assignment don't match `Bash(git fetch:*)` etc. and trigger a permission prompt on every run.

Substitute the literal values from Step 3 directly into each command. Pick a unique worktree path like `.claude/worktrees/fix-e2e-<slug>-<timestamp>` (the timestamp keeps parallel runs from colliding; `date +%s` is fine).

1. Fetch the PR's branch so its HEAD is locally resolvable:

   ```bash
   git fetch origin <TARGET_BRANCH>
   ```

2. Create the worktree on a new `fix/e2e-<slug>` branch pointing at the PR's HEAD. Before running this, announce to the user what you're about to do **and** that the worktree will be cleaned up automatically at the end of the skill (Step 5.5), so they're not surprised when it disappears:

   > Creating a worktree at `.claude/worktrees/fix-e2e-<slug>-<timestamp>` on a new `fix/e2e-<slug>` branch pointing at the PR's HEAD. It's local, ignored by git, and will be removed automatically when the skill finishes (after the PR is opened or if the skill exits earlier).

   ```bash
   git worktree add -b fix/e2e-<slug> .claude/worktrees/fix-e2e-<slug>-<timestamp> <PR_SHA>
   ```

3. Link two auto-generated bits from the main checkout into the worktree so the pre-commit hook can run. Both are gitignored on the main side — they exist after `yarn install` and `husky install` but aren't in the tracked tree the worktree sees.

   ```bash
   ln -s /var/www/wp-calypso/node_modules .claude/worktrees/fix-e2e-<slug>-<timestamp>/node_modules
   ```

   ```bash
   ln -s /var/www/wp-calypso/.husky/_ .claude/worktrees/fix-e2e-<slug>-<timestamp>/.husky/_
   ```

   **Why both are needed.** The worktree shares `.git` with the main checkout but has its own working tree, so anything `yarn install` or `husky install` generated locally isn't there. wp-calypso's pre-commit hook reads:

   ```sh
   . "$(dirname "$0")/_/husky.sh"       # needs .husky/_/husky.sh (husky-generated)
   yarn run install-if-no-packages && node bin/pre-commit-hook.js   # needs node_modules
   ```

   Missing either causes the commit to fail (`cannot open .husky/_/husky.sh` or `Couldn't find the node_modules state file`). Symlinks are sufficient because the main checkout uses Yarn Berry with `nodeLinker: node-modules` (not PnP) and husky's generated shim is a plain shell include — neither tool has absolute-path state that breaks when shared. We never skip the hook (`--no-verify`) — fix the environment instead.

   **Why the husky symlink replaces the whole `.husky/_` path** (and not, say, just `.husky/_/husky.sh` inside an `mkdir`'d directory):

   - `.husky/_/` is **not** in the tracked tree at all — only `.husky/pre-commit` and `.husky/pre-push` are (`git ls-files .husky/` returns just those two). So in a fresh worktree there's no `.husky/_/` directory to symlink *into*; we'd have to `mkdir -p` first.
   - `mkdir -p` (or any write) under `.husky/` triggers Claude Code's hardcoded "sensitive path" heuristic and prompts on every run, regardless of allowlist.
   - Symlinking the whole `.husky/_` path sidesteps that — no `mkdir`, just a single `ln -s`.

   The symlink would otherwise be staged by Step 5.4's `git add -A`, since `.husky/_` is a path git can see (no parent gitignore covers it). The repo's tracked `.gitignore` therefore has an explicit `.husky/_` entry: in the main checkout the path is auto-generated and untracked anyway so the rule is benign, and in the worktree it makes the symlink invisible to `git add -A`.

   For the same reason, `node_modules` is symlinked at the worktree root because the repo's main `.gitignore` already excludes `node_modules/`.

Don't add extra sanity-check calls (e.g., `ls` on the spec path) — the harness hooks `ls` as a filesystem read and its path heuristic can trigger a permission prompt for paths under `test/e2e/specs/…`. If the spec isn't actually in the worktree, the Healer's Read call in 5.2 will fail with a clear error; that's soon enough.

Record these values for later sub-steps (keep them in your working memory; later Bash calls must inline them rather than reference shell variables):

- **WORKTREE_DIR** — `.claude/worktrees/fix-e2e-<slug>-<timestamp>`
- **BRANCH** — `fix/e2e-<slug>`
- **PR_SHA** — from Step 3
- **TARGET_BRANCH** — from Step 3

### 5.2: Delegate the fix to the Healer

Dispatch the Agent tool with `subagent_type: "Playwright Test Healer"` and **no** `isolation` parameter (we manage the worktree ourselves).

The prompt **must be self-contained** — the agent has no access to this conversation. Include:

- **Working directory**: absolute path to `$WORKTREE_DIR`. Instruct the Healer to read, edit, and write files only under this path. All relative paths in its prompt should be resolved against this root.
- **Absolute spec path**: `$WORKTREE_DIR/$SPEC_REL`.
- **Test title** (exactly as in `test(...)` / `it(...)`).
- **Build configuration** the failure was observed on (e.g., `[Mobile]`).
- **TeamCity build URL** from Step 4.
- **Failure details** from Step 4.2 verbatim (the `details` field — stack trace and Playwright call log).
- **Constraints**:
  - Fix the test's stability; do not touch product code unless the failure is clearly a product bug, in which case **stop and report the bug back instead of applying a fix**.
  - Do not delete, `.skip(...)`, quarantine, or mute the test.
  - Follow `test/e2e/docs-new/creating_reliable_tests.md` and `test/e2e/docs-new/new_style_guide.md`.
  - **Use only `LS`, `Glob`, `Read`, `Grep`, `Edit`, `MultiEdit`, and `Write`** for analysis and edits. Do **not** call `browser_evaluate`, `test_run`, `test_debug`, or any other `mcp__playwright-test__*` tool — those trigger permission prompts and are unnecessary: the failure details above are the authoritative signal. Rely on code-level analysis, not on running the test.
- **Expected return**: a short summary of (a) why the test was failing (root cause, one paragraph) and (b) what the fix does (one paragraph), plus the edits applied under `$WORKTREE_DIR`. Capture both paragraphs — they become the commit body and PR body.

Exit conditions:

- Healer reports a **product bug** → surface verbatim to the user, `git worktree remove "$WORKTREE_DIR" --force`, stop.
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

If the user asks to see the elided portion, re-render with no truncation. Wait for an explicit affirmative before pushing. If the user asks for changes, re-dispatch the Healer with their feedback (operating on the same worktree), then loop back here.

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
git -C .claude/worktrees/fix-e2e-<slug>-<timestamp> push -u origin fix/e2e-<slug>
```

**Open the PR** (announce: "Opening the PR against `<TARGET_BRANCH>` and assigning it to you.").

Do **not** `cd` into the worktree. Use `gh pr create --repo Automattic/wp-calypso --head fix/e2e-<slug> --base <TARGET_BRANCH> ...` — the `--head` flag tells gh which branch to PR from, so no cd is needed. This matters because:

- The Bash tool's cwd persists across calls; cd-ing into the worktree and then removing it in 5.5 leaves the shell with an invalid cwd (`pwd` fails with `getcwd: cannot access parent directories`).
- The harness flags `cd <path> && git <cmd>` as "potentially running hooks from untrusted directory" and prompts every time. `gh pr create --head` sidesteps that entirely.

**Open the PR as ready-for-review, not draft.** AGENTS.md's default PR guidance is "create as draft", but this skill deliberately diverges: wp-calypso's E2E test matrix (and several other checks) is configured to skip draft PRs, and the whole point of opening the fix PR is to let CI validate the Healer's change. Opening as draft would leave the dev with no CI signal until they manually clicked "Ready for review", which is the opposite of what this skill is trying to accomplish.

```bash
gh pr create --repo Automattic/wp-calypso --assignee @me \
  --head fix/e2e-<slug> --base <TARGET_BRANCH> \
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

Run the cleanup as a single Bash call with the worktree path inlined, using `git -C /var/www/wp-calypso` to avoid any reliance on the shell's cwd (which can be broken if a prior step left it pointing inside a removed directory):

```bash
git -C /var/www/wp-calypso worktree remove .claude/worktrees/fix-e2e-<slug>-<timestamp> --force
```

`--force` is used deliberately: the worktree contains a symlinked `node_modules` (from Step 5.1.3) and uncommitted husky-generated state from the pre-commit hook, neither of which should block removal. Nothing of value lives only in the worktree — everything worth keeping is in the branch on origin.

Do **not** `cd` into or near the worktree before this call. The heuristic "command changes directory before running git" will prompt, and the call is allowlisted only as `Bash(git worktree:*)` / `Bash(git -C:*)`, not as `cd && git worktree`.

Do **not** also delete the `fix/e2e-<slug>` local branch: that branch points at the commit you just pushed, and leaving it in place is helpful if the user wants to pull new changes into it or amend later. Remove it only if the PR is abandoned.

If the PR was **not** opened (e.g., the Healer reported a product bug in 5.2 and the skill stopped, or the user declined to push in 5.3), also remove the worktree — but _do_ delete the local branch too, since nothing was pushed:

```bash
git worktree remove .claude/worktrees/fix-e2e-<slug>-<timestamp> --force
git branch -D fix/e2e-<slug>
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
