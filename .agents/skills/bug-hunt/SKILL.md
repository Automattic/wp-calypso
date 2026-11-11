---
name: bug-hunt
description: Have a fresh subagent try to break a change and report concrete failures by severity, without editing files. Use before committing a change, or when asked to find bugs or edge cases in a diff.
---

# Bug hunt

Checking that a change works shows the case its author had in mind. A bug hunt looks for the cases they didn't. Run it once the change's other edits are done, not alongside a review that edits files, so its line numbers stay right. Start a fresh subagent (the Agent tool in Claude Code) with the prompt below, so it reads the change without the session's assumptions. If you can't start one, follow the prompt yourself, reading only the diff and the code around it.

## Prompt

Fill in the branch, the checkout path and the goal:

> You are trying to break the change on branch `<branch>` in `<path>`. Its goal: `<what the change should do, and what is true when it's done>`. Read `git diff origin/trunk...HEAD`, uncommitted changes (`git diff HEAD`), the untracked files that belong to the change (`git status`) and the code around them.
>
> Find concrete ways it fails. Check:
>
> - edge-case inputs: empty, very long, special characters, zero, large numbers
> - empty, loading and error states, including a failed or slow request
> - races: repeated clicks, navigating away mid-request, stale cached data
> - permissions: a user without the needed capability, a logged-out visitor
> - other callers of the changed functions, components, hooks and selectors
> - site types: Simple, Atomic and self-hosted Jetpack
> - the feature flag off, when the change sits behind one
> - translated strings and right-to-left languages
> - dark mode and mobile widths
>
> Back each finding by reading the code or running it, and drop anything you can't support. Don't edit files. If you check in a browser, follow `.agents/skills/verify/browser.md` and keep the E2E test accounts read-only.
>
> Report each finding as: severity, `path:line`, scenario → wrong result. CRITICAL: data loss, a crash, a security hole or a broken core flow. HIGH: wrong behavior users see in a realistic case. MEDIUM: wrong behavior in an unlikely case. LOW: hardening or polish. End with `NO FINDINGS` if there are none.

## After it returns

- Fix the CRITICAL and HIGH findings in one round, then re-run the checks from [verify](../verify/SKILL.md) that cover the fixes. Don't start another hunt.
- List MEDIUM and LOW findings under the PR's Details, as work left for a follow-up.
