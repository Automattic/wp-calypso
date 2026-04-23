---
name: fix-flaky-e2e-tests
description: Given a wp-calypso PR number, identify the flaky E2E test(s) in that PR's CI run so they can be fixed. Use when asked to investigate or fix a flaky E2E test on a specific PR.
allowed-tools: Bash, AskUserQuestion
---

# Fix Flaky E2E Tests

Given a PR number on `Automattic/wp-calypso`, locate the flaky E2E test(s) that are failing (or being retried) in that PR's CI run.

This skill is built incrementally. Right now it covers preflight (GitHub + TeamCity) and PR resolution. Subsequent steps (identify failing tests, reproduce locally, fix) will be added as earlier ones land in a satisfying state.

Before each step, tell the user in one short sentence what you're about to do and why, so they aren't surprised by a Bash call or a follow-up setup request.

## Step 1: Verify GitHub CLI access

The skill uses `gh` to read PR metadata and check runs. Confirm `gh` is installed **and** its stored token actually works — `gh auth status` alone is not enough, as it can report success while the keyring token is stale and every API call returns 401.

Announce what you're checking (e.g., "Checking that the `gh` CLI is installed and authenticated — the skill uses it to read PR checks."), then run the probe as one Bash call. The API probe (`gh api user`) is the authoritative check; it fails non-zero on a bad or missing token.

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

- `GH_OK` → proceed to Step 2.
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
# Load token. Prefer the canonical shared file; fall back to a legacy name if present.
for f in "$HOME/.claude/teamcity-access-token.env" "$HOME/.claude/fix-flaky-e2e.env"; do
  [ -f "$f" ] && [ -z "${TEAMCITY_TOKEN:-}" ] && { set -a; . "$f"; set +a; }
done

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

The skill stores the TeamCity access token at `~/.claude/teamcity-access-token.env` (mode 0600, per-user, outside any repo). Never write it to the repo, `.claude/settings*.json`, or a shell profile.

**Critical UX constraint.** Do not let the user paste the token into Claude Code — not into the chat and especially not via the `!` prefix. Claude Code echoes `!`-command stdin into the transcript, which defeats hidden-password reads and leaks the token.

Guide the user as follows:

> 1. Open <https://teamcity.a8c.com/profile.html?item=accessTokens>.
> 2. Click **Create access token**.
> 3. **Token name**: `claude-teamcity-access-token`.
> 4. **Expire in**: leave blank.
> 5. **Permissions scope**: *same as current user*.
> 6. Click **Create**.
> 7. Copy the token to your clipboard — TeamCity only shows it once, so if you dismiss the dialog before copying you'll have to regenerate.
>
> **Do not paste the token into this chat.** Anything you type here ends up in the conversation transcript. The next step is run in a *separate* terminal so the hidden-password prompt stays hidden.
>
> 8. In a **separate terminal window (not Claude Code)**, `cd` to the wp-calypso repo and run:
>
>    ```bash
>    bash .claude/skills/fix-flaky-e2e-tests/setup-token.sh
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

Once you have a number, validate the PR exists and capture its metadata in one Bash call. Keep the output for later steps — branch name and HEAD SHA will be needed to look up checks.

```bash
gh pr view <PR_NUMBER> --repo Automattic/wp-calypso \
  --json number,title,state,isDraft,headRefName,headRefOid,url,statusCheckRollup 2>&1
```

- Exit 0 with JSON → the PR exists. Show the user a one-line confirmation (PR number, title, state, branch) and proceed.
- Non-zero / "not found" → tell the user the PR wasn't found on `Automattic/wp-calypso` and ask for another one. Loop until you get a valid PR or the user stops.

Do not proceed past Step 3 until a PR has been successfully resolved.

