# Example: a complete fix-e2e-tests run

A narrative walk-through of one full skill invocation, from PR number to opened fix PR. **The values below are illustrative, not from a real historical run** — they're here so a future reader can pattern-match on the shape of each step's input and output.

If you ever run the skill against a real PR and the output is particularly clean, consider replacing this doc with that run.

Throughout this example:

- **Parent PR:** #110080 on `Automattic/wp-calypso`, branch `try/fix-something`, HEAD `a1b2c3d4e5f6…`.
- **Failing test:** `Infrastructure tests › Flaky fixture › Flaky by race condition` in `test/e2e/specs/infrastructure/infrastructure__flaky-fixture.spec.ts`, on the `[Mobile]` build of the Playwright Test matrix.

---

## Step 1: GitHub CLI

Assistant says: "Checking that `gh` is installed and authenticated."

```
$ gh api user --jq .login
sarahnorris
```

`GH_OK sarahnorris` → proceed.

## Step 2: TeamCity access

Assistant says: "Checking access to TeamCity."

Probe finds direct connectivity blocked but SOCKS5 works:

```
TC_OK proxy=[--socks5 localhost:8080]
```

Token already present at `~/.config/teamcity-access-token`. Proceed.

## Step 3: Resolve the PR

User types: `110080`.

Assistant says: "Fetching PR #110080 from GitHub."

```
$ gh pr view 110080 --repo Automattic/wp-calypso \
    --json number,title,state,isDraft,headRefName,headRefOid,url,statusCheckRollup
```

Returns JSON including `headRefName: "try/fix-something"`, `headRefOid: "a1b2c3d4e5f6…"`, and a `statusCheckRollup` array.

Assistant confirms to user: "PR #110080 — *Improve fixture handling for flaky setup* — open, branch `try/fix-something`. Proceeding."

Recorded values:

- `<PR_NUMBER>` = `110080`
- `<PR_SHA>` = `a1b2c3d4e5f6789abc012def345abcdef6789abc`
- `<TARGET_BRANCH>` = `try/fix-something`

## Step 4.1: Find the failing E2E check(s)

From `statusCheckRollup`, two FAILURE entries point at `teamcity.a8c.com/buildConfiguration/...` and contain `E2E Tests`:

| Check | URL | Runner |
| --- | --- | --- |
| `E2E Tests (Playwright Test)` | `https://teamcity.a8c.com/buildConfiguration/calypso_WebApp_Calypso_E2E_Playwright_Test_Matrix/1234567` | Playwright Test ✅ |
| `E2E Tests (desktop)` | `https://teamcity.a8c.com/buildConfiguration/calypso_WebApp_Calypso_E2E_Playwright_desktop/1234566` | Jest legacy ❌ |

Playwright Test build ID: **`1234567`**. Jest-legacy build is recorded for context but not investigated.

## Step 4.2: Fetch failing test occurrences

```
$ .claude/skills/fix-e2e-tests/identify-failing-tests.sh 1234567
[
  {
    "build": "[Mobile]",
    "name": "infrastructure/infrastructure__flaky-fixture.spec.ts: Infrastructure tests › Flaky fixture › Flaky by race condition",
    "reason": "TimeoutError: page.locator('#late'): waiting for locator '#late' to be visible (timeout 150ms)",
    "details": "FAILURE: Test \"Flaky by race condition\" failed (attempt 3 of 3)\n    TimeoutError: page.locator('#late'): waiting for locator '#late' to be visible (timeout 150ms)\n        at /home/runner/work/wp-calypso/wp-calypso/test/e2e/specs/infrastructure/infrastructure__flaky-fixture.spec.ts:42:12\n    Call log:\n      - waiting for locator('#late') to be visible\n      -   locator resolved to <div id=\"late\" hidden>…</div>\n      -   timed out 150ms\n"
  }
]
```

One candidate. Both checks together produced exactly one Playwright Test failure.

## Step 4.3: Present candidates

Assistant renders the table:

| #   | Spec                                                                  | Test                    | Build    | Hint   | Reason                                                                              |
| --- | --------------------------------------------------------------------- | ----------------------- | -------- | ------ | ----------------------------------------------------------------------------------- |
| 1   | `test/e2e/specs/infrastructure/infrastructure__flaky-fixture.spec.ts` | Flaky by race condition | [Mobile] | flake? | TimeoutError: page.locator('#late'): waiting for locator '#late' to be visible (timeout 150ms) |

One candidate → assistant skips the "reply with the number" prompt and announces: "Going to fix this one."

## Step 5.1: Setup worktree

Assistant computes:

- `<SLUG>` = `infrastructure__flaky-fixture`
- `<TIMESTAMP>` = `1729600000` (from `date +%s`)
- `<WORKTREE_DIR>` = `.claude/worktrees/fix-e2e-infrastructure__flaky-fixture-1729600000`

HEAD-drift check:

```
$ gh pr view 110080 --repo Automattic/wp-calypso --json headRefOid --jq .headRefOid
a1b2c3d4e5f6789abc012def345abcdef6789abc
```

Matches `<PR_SHA>` → proceed (no drift).

REPO_ROOT:

```
$ git rev-parse --show-toplevel
/Users/dev/Source/wp-calypso
```

Branch collision check:

```
$ git show-ref --verify --quiet refs/heads/fix/e2e-infrastructure__flaky-fixture
```

Exit 1 → branch doesn't exist locally → `<BRANCH>` = `fix/e2e-infrastructure__flaky-fixture` (unsuffixed).

Stale-worktree check:

```
$ git -C /Users/dev/Source/wp-calypso worktree list | grep "/.claude/worktrees/fix-e2e-" || true
```

Empty → no orphans to clean.

Assistant announces:

> Creating a worktree at `.claude/worktrees/fix-e2e-infrastructure__flaky-fixture-1729600000` on a new `fix/e2e-infrastructure__flaky-fixture` branch pointing at the PR's HEAD. It's local, ignored by git, and will be removed automatically when the skill finishes.

Then:

```
$ .claude/skills/fix-e2e-tests/setup-worktree.sh \
    a1b2c3d4e5f6789abc012def345abcdef6789abc \
    fix/e2e-infrastructure__flaky-fixture \
    .claude/worktrees/fix-e2e-infrastructure__flaky-fixture-1729600000 \
    try/fix-something
Fetching origin/try/fix-something so PR_SHA is locally resolvable...
Creating worktree at .claude/worktrees/fix-e2e-infrastructure__flaky-fixture-1729600000 on new branch fix/e2e-infrastructure__flaky-fixture at a1b2c3d4e5f6789abc012def345abcdef6789abc...
Linking node_modules and .husky/_ from /Users/dev/Source/wp-calypso...
Worktree ready: .claude/worktrees/fix-e2e-infrastructure__flaky-fixture-1729600000
```

## Step 5.2: Dispatch the Healer

Assistant fills the initial-dispatch template from `references/healer-prompt.md` and sends:

```
A Playwright Test in this repo is failing in CI. Your job is to identify the root cause and, if appropriate, apply a fix. You have no access to the conversation that dispatched you.

**Working directory.** Read, edit, and write only under `/Users/dev/Source/wp-calypso/.claude/worktrees/fix-e2e-infrastructure__flaky-fixture-1729600000`. Resolve all relative paths against this root.

**Failing test.**
- Spec (absolute): `/Users/dev/Source/wp-calypso/.claude/worktrees/fix-e2e-infrastructure__flaky-fixture-1729600000/test/e2e/specs/infrastructure/infrastructure__flaky-fixture.spec.ts`
- Test title: `Flaky by race condition`
- Build configuration: `[Mobile]`
- TeamCity build URL: `https://teamcity.a8c.com/buildConfiguration/calypso_WebApp_Calypso_E2E_Playwright_Test_Matrix/1234567`

**Likely cause hint** (heuristic from one line of the trace — the full trace below is authoritative): `flake?`

[…bias-by-hint rules and constraints, see references/healer-prompt.md…]

**Failure details (verbatim from TeamCity):**

FAILURE: Test "Flaky by race condition" failed (attempt 3 of 3)
    TimeoutError: page.locator('#late'): waiting for locator '#late' to be visible (timeout 150ms)
        at /home/runner/work/wp-calypso/wp-calypso/test/e2e/specs/infrastructure/infrastructure__flaky-fixture.spec.ts:42:12
    Call log:
      - waiting for locator('#late') to be visible
      -   locator resolved to <div id="late" hidden>…</div>
      -   timed out 150ms

[…constraints, return-format expectations…]
```

Healer returns:

> **Root cause.** The test waits for `#late` with a 150ms timeout, but in Mobile viewport this element is rendered behind a click-to-expand wrapper that resolves the locator immediately (so the wait technically succeeds) yet keeps the element hidden (so visibility never holds). The Desktop viewport doesn't render the wrapper, which is why this only fails on `[Mobile]`. The 150ms ceiling was a guard against runaway tests in the old fixture, not a behavioral assertion.
>
> **Fix.** Replaced the bare `expect(page.locator('#late')).toBeVisible({ timeout: 150 })` with a two-step pattern: first dismiss the click-to-expand wrapper if it's present (mobile-only), then assert visibility with the default 30s timeout that matches the rest of this spec. No behavioral change — the test still fails if `#late` is missing or hidden after the wrapper is gone.

## Step 5.3: Diff review

```
$ git -C .claude/worktrees/fix-e2e-infrastructure__flaky-fixture-1729600000 --no-pager diff --stat a1b2c3d4e5f6789abc012def345abcdef6789abc
 test/e2e/specs/infrastructure/infrastructure__flaky-fixture.spec.ts | 6 +++++-
 1 file changed, 5 insertions(+), 1 deletion(-)
```

Assistant renders to user:

> **Root cause.** The test waits for `#late` with a 150ms timeout, but in Mobile viewport this element is rendered behind a click-to-expand wrapper that resolves the locator immediately (so the wait technically succeeds) yet keeps the element hidden (so visibility never holds). The Desktop viewport doesn't render the wrapper, which is why this only fails on `[Mobile]`. The 150ms ceiling was a guard against runaway tests in the old fixture, not a behavioral assertion.
>
> **Fix.** Replaced the bare `expect(page.locator('#late')).toBeVisible({ timeout: 150 })` with a two-step pattern: first dismiss the click-to-expand wrapper if it's present (mobile-only), then assert visibility with the default 30s timeout that matches the rest of this spec. No behavioral change — the test still fails if `#late` is missing or hidden after the wrapper is gone.
>
> **Diff (stat):**
>
> ```
>  test/e2e/specs/infrastructure/infrastructure__flaky-fixture.spec.ts | 6 +++++-
>  1 file changed, 5 insertions(+), 1 deletion(-)
> ```
>
> ```diff
> @@ -39,7 +39,11 @@
>      test( 'Flaky by race condition', async ( { page } ) => {
>          await page.goto( '/sites' );
> -        await expect( page.locator( '#late' ) ).toBeVisible( { timeout: 150 } );
> +        const expander = page.locator( '[data-mobile-expand]' );
> +        if ( await expander.isVisible() ) {
> +            await expander.click();
> +        }
> +        await expect( page.locator( '#late' ) ).toBeVisible();
>      } );
> ```
>
> Ready to push and open a draft PR against `try/fix-something`? Say **yes** to proceed, or tell me what to change first.

User: `yes`.

## Step 5.4: Commit, push, open PR

Assistant runs each call separately, with announcements:

> Staging the Healer's edits.

```
$ git -C .claude/worktrees/fix-e2e-infrastructure__flaky-fixture-1729600000 add -A
```

> Committing — the message carries the root cause and fix summary so the PR body can be derived from it.

```
$ git -C .claude/worktrees/fix-e2e-infrastructure__flaky-fixture-1729600000 commit -m "$(cat <<'EOF'
E2E: fix Flaky by race condition

[…root-cause paragraph…]

[…fix paragraph…]
EOF
)"
```

> Pushing the branch to origin.

```
$ git -C .claude/worktrees/fix-e2e-infrastructure__flaky-fixture-1729600000 push -u origin fix/e2e-infrastructure__flaky-fixture
```

> Opening the PR against `try/fix-something` and assigning it to you.

```
$ gh pr create --repo Automattic/wp-calypso --assignee @me \
    --head fix/e2e-infrastructure__flaky-fixture --base try/fix-something \
    --title "E2E: fix Flaky by race condition" \
    --body "$(cat <<'EOF'
## Proposed Changes
- Dismiss the mobile-only click-to-expand wrapper before asserting `#late` visibility.
- Drop the 150ms timeout in favor of the spec's default — that ceiling was a guard, not an assertion.

## Why are these changes being made?
[…root cause, with link to https://teamcity.a8c.com/buildConfiguration/.../1234567 as evidence…]

## Testing Instructions
Run `yarn playwright test test/e2e/specs/infrastructure/infrastructure__flaky-fixture.spec.ts --reporter=list --repeat-each=10` locally; all runs should pass.
EOF
)"
```

Output: `https://github.com/Automattic/wp-calypso/pull/110123`.

## Step 5.5: Cleanup and report

> PR opened. Cleaning up the worktree.

```
$ git -C /Users/dev/Source/wp-calypso worktree remove .claude/worktrees/fix-e2e-infrastructure__flaky-fixture-1729600000 --force
```

Final message to user:

> **PR opened** against `try/fix-something`: <https://github.com/Automattic/wp-calypso/pull/110123> — assigned to you, CI is running.
>
> The fix was generated by the Playwright Test Healer based on the CI failure output. Before requesting review or merging, validate it — e.g., `yarn playwright test test/e2e/specs/infrastructure/infrastructure__flaky-fixture.spec.ts --reporter=list --repeat-each=10` locally, or confirm the PR's CI passes on a few runs of the previously-failing check.
>
> Worktree cleaned up.
