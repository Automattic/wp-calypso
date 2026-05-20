# Playwright Test Healer prompt templates

What `fix-e2e-tests` sends to the Playwright Test Healer agent in Step 5.2 (initial dispatch) and Step 5.3 (re-dispatch after user feedback). Keeping the prompts here lets SKILL.md collapse those steps to "fill in the variables and dispatch" instead of restating the required pieces inline.

The Healer has no access to the conversation that dispatched it — the prompt must be self-contained.

## Variables

| Variable | Source | Notes |
| --- | --- | --- |
| `<WORKTREE_DIR>` | 5.1 record | Absolute path. The Healer reads/writes only within this. |
| `<SPEC_ABS>` | `<WORKTREE_DIR>/test/e2e/specs/<spec-rel-from-4.3>` | Absolute path to the failing spec. |
| `<TEST_TITLE>` | 4.3 candidate | Exactly as in `test(...)` / `it(...)`. |
| `<BUILD>` | 4.3 candidate | Build label (e.g., `[Mobile]`). |
| `<TC_BUILD_URL>` | 4.1 | TeamCity build page. |
| `<HINT>` | 4.3 candidate | `flake?` / `regression?` / `?`. |
| `<DETAILS>` | 4.2 from script JSON | Multi-line stack trace + Playwright call log, verbatim. |
| `<PRIOR_DIFF>` | 5.3 only | Output of `git diff <PR_SHA>` against the worktree. |
| `<USER_FEEDBACK>` | 5.3 only | User's verbatim request-for-changes message. |

Substitute as literal values before dispatching — the assistant inlines them in working memory, no shell expansion involved.

## Initial-dispatch template (Step 5.2)

Copy everything inside the fenced block. Each section is load-bearing — don't drop or paraphrase any of it.

```
A Playwright Test in this repo is failing in CI. Your job is to identify the root cause and, if appropriate, apply a fix. You have no access to the conversation that dispatched you.

**Working directory.** Read, edit, and write only under `<WORKTREE_DIR>`. Resolve all relative paths against this root.

**Failing test.**
- Spec (absolute): `<SPEC_ABS>`
- Test title: `<TEST_TITLE>`
- Build configuration: `<BUILD>`
- TeamCity build URL: `<TC_BUILD_URL>`

**Likely cause hint** (heuristic from one line of the trace — the full trace below is authoritative): `<HINT>`

- `flake?` — harden the test (waits, locators, fixtures, isolation). Don't change behavioral assertions unless you're sure they're stale.
- `regression?` — the test's behavioral assertion didn't hold. Investigate whether the assertion is correct. If it is (the test is right, the product is wrong), **stop and report the bug back instead of applying a fix**. If the assertion is stale (the product changed deliberately and the test wasn't updated), adjust it minimally.
- `?` — no classifier signal; verify carefully against the stack trace and code before changing either side.

**Failure details (verbatim from TeamCity):**

<DETAILS>

**Constraints.**
- Do not delete, `.skip(...)`, quarantine, or mute the test.
- Do not touch product code unless the failure is clearly a product bug — in that case stop and report the bug back instead of applying a fix.
- Follow `test/e2e/docs-new/creating_reliable_tests.md` and `test/e2e/docs-new/new_style_guide.md`.
- Use only `LS`, `Glob`, `Read`, `Grep`, `Edit`, `MultiEdit`, and `Write`. Do **not** call `browser_evaluate`, `test_run`, `test_debug`, or any other `mcp__playwright-test__*` tool — those trigger permission prompts and are unnecessary; the failure details above are the authoritative signal. Use code-level analysis, not running the test.

**Return.** A short summary in two parts:

1. **Root cause** — one paragraph on why the test was failing.
2. **Fix** — one paragraph on what you changed and why.

These two paragraphs become the commit body and the PR body.
```

## Re-dispatch template (Step 5.3)

Sent when the user requests changes after reviewing the diff. The worktree still contains the prior attempt (uncommitted) — the prompt tells the Healer to revise in place.

```
You previously generated a fix for a failing Playwright Test in this repo. The user has reviewed the diff and asked for changes. Your job is to revise the worktree's working tree to address the feedback. You have no access to the conversation that dispatched you.

**Working directory.** Read, edit, and write only under `<WORKTREE_DIR>`. Resolve all relative paths against this root. **The worktree already contains your prior attempt** (uncommitted). The diff below shows it against the original PR HEAD.

**Failing test.**
- Spec (absolute): `<SPEC_ABS>`
- Test title: `<TEST_TITLE>`
- Build configuration: `<BUILD>`
- TeamCity build URL: `<TC_BUILD_URL>`

**Likely cause hint:** `<HINT>` (`flake?` → harden the test; `regression?` → investigate whether the assertion is correct, report a product bug if so; `?` → verify carefully).

**User feedback (verbatim):**

<USER_FEEDBACK>

**Prior attempt (diff against original PR HEAD):**

<PRIOR_DIFF>

**Failure details (verbatim from TeamCity):**

<DETAILS>

**Instructions.**
- Revise in place. Keep what still applies; edit or rewrite what doesn't. To revert a specific change, write the file's pre-attempt content (visible in the diff as removed lines). You don't have shell access — revert via Edit/Write, not git.
- All initial-dispatch constraints still apply: no delete/skip/mute, no product code unless reporting a bug, follow `test/e2e/docs-new/creating_reliable_tests.md` and `test/e2e/docs-new/new_style_guide.md`, only `LS`/`Glob`/`Read`/`Grep`/`Edit`/`MultiEdit`/`Write`, no `mcp__playwright-test__*` tools.

**Return.** Same two-paragraph format as the initial dispatch. The fix paragraph should describe the **final** state of the worktree, not a delta against the prior attempt.
```

## Exit conditions (both templates)

After the Healer returns:

- **Healer reports a product bug** → surface its message verbatim to the user, remove the worktree, stop. Do not push or open a PR.
- **Healer returns no changes** → tell the user, remove the worktree, stop.
- **Otherwise** → proceed to Step 5.3 (diff review) on initial dispatch, or loop back to 5.3 on re-dispatch.
