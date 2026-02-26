---
name: create-a4a-pr
description: Create or edit A4A-related pull requests with consistent titles, reviewers, labels, and body conventions
---

# Create A4A PR

When the user runs `/create-a4a-pr` or asks to create/open/raise a PR for A4A work (`client/a8c-for-agencies/**`), do the following, then reply with the **full PR link** pasted in the message.

## Steps

1. **Branch** — Create a new branch from the base (`trunk` or the one they specify). Use a descriptive name (e.g. `add/feature-name`, `fix/bug-name`).
2. **Commit** — Stage and commit with a clear message. Use `A4A: ` prefix in the commit when it's A4A work.
3. **Create PR** — `gh pr create` with base, title, body. Default base is `trunk` unless they said "on top of PR #…" (then use that PR's branch). **Body must follow** `.github/PULL_REQUEST_TEMPLATE.md`: put "This PR is built on top of {pr-url}." at the very top when applicable; then "Part of #" or Fixes/Resolves with the Linear link; then fill Proposed Changes, Why are these changes being made?, Testing Instructions, and Pre-merge Checklist per the template.
4. **Conventions** — Add reviewer `Automattic/a4a-genesis`, label `A8c Agencies`, assign to the branch author. Use `gh pr edit` if needed.
5. **Reply** — Paste the full PR URL in the message so they can click it.

## Conventions summary

- **Title:** Prefix with `A4A: ` (e.g. `A4A: Add PR review workflow`).
- **Reviewer:** `Automattic/a4a-genesis`.
- **Label:** `A8c Agencies`.
