---
name: fix-flaky-e2e-tests
description: Given a wp-calypso PR number, identify the flaky E2E test(s) in that PR's CI run so they can be fixed. Use when asked to investigate or fix a flaky E2E test on a specific PR.
allowed-tools: Bash, AskUserQuestion
---

# Fix Flaky E2E Tests

Given a PR number on `Automattic/wp-calypso`, locate the flaky E2E test(s) that are failing (or being retried) in that PR's CI run.

This skill is built incrementally. Right now it only covers the preflight check. Subsequent steps will be added as earlier ones land in a satisfying state.

## Step 1: Verify GitHub CLI access

The skill uses `gh` to read PR metadata and check runs. Before anything else, confirm `gh` is installed **and** the stored token actually works — `gh auth status` alone is not enough, as it can report success while the keyring token is stale and every API call returns 401.

**Before running the probe**, tell the user in one short sentence what you're about to check and why, so they aren't surprised by the Bash call or a follow-up install/re-auth request. Example: "Checking that the `gh` CLI is installed and authenticated — the skill uses it to read PR checks."

Then run the probe as one Bash call. The API probe (`gh api user`) is the authoritative check; it fails non-zero on a bad or missing token.

```bash
if ! command -v gh >/dev/null 2>&1; then
  echo "GH_MISSING"
elif gh api user --jq .login >/dev/null 2>&1; then
  echo "GH_OK"
else
  echo "GH_BAD"
fi
```

Interpret the result:

- `GH_OK` → proceed (there is no next step yet — tell the user the preflight passed and stop).
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
