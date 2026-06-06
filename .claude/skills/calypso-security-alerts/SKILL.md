---
name: calypso-security-alerts
description: Scan Automattic/wp-calypso for Dependabot alerts and dependency-security PRs, classify whether action is needed, and report concise read-only next steps.
allowed-tools: Bash, Read, Grep, Glob
---

# Calypso security alerts

Use this skill to scan the current dependency-security state for `Automattic/wp-calypso`.

This is a read-only workflow. Do not merge PRs, close PRs, dismiss alerts, post comments, change labels, or change repository settings.

## Inputs

Accept any of these:

- no input: scan the current queue
- PR URL or PR number: inspect that PR against the alert state
- alert number, GHSA, CVE, or package name: start from that alert or dependency
- `days=N`: include recent fixed or dismissed alerts from the last N days

Run from the repository root.

## Workflow

1. Read `docs/dependency-security-alerts.md`.
2. Confirm `gh` is authenticated.
3. Check open Dependabot alerts.
4. Check recent alert activity.
5. Check open Dependabot PRs.
6. Check open Renovate dependency PRs from `matticbot`.
7. Check open PRs with the `Security` label.
8. For relevant PRs, inspect mergeability, required checks, labels, changed files, and whether the matching alert is still open.
9. Apply the dependency age rule from the playbook.
10. Report counts first, then action items.

## Triage rules

- Treat open Dependabot alerts as the source of truth.
- If open Dependabot alerts are empty, report that the active GitHub dependency alert queue is clear.
- Prefer an existing Dependabot PR only when it fixes the alert and required checks pass.
- Treat grouped Dependabot PRs as inventory unless they are clean enough to merge.
- Treat Renovate PRs as normal dependency maintenance unless they close a current Dependabot alert.
- If no useful bot PR exists, recommend the smallest manual remediation path.
- During the dependency-age wait window, classify the item as "track and wait".
- Use `gh pr checks`, not only `statusCheckRollup`, when deciding whether Calypso CI is ready.

## Report format

```text
Scan complete.

- Open Dependabot alerts: <count>
- Open Dependabot PRs: <count>
- Open Renovate dependency PRs: <count>
- Open security-labeled PRs: <count>

Action needed:
- <item>

No action needed:
- <proof>
```

If there is nothing to do, say that first.
