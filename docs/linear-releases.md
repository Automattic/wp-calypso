# Linear Releases

Linear Releases connects merged code to Linear's release tracking. When a PR merges to `trunk`, the [Linear Release Action](https://github.com/linear/linear-release-action) scans commits for issue references and links them to your team's release pipeline in Linear.

Linear Releases is in **public beta** as of April 2026. Contact Linear support or your account manager to request access. APIs and commands may change.

The Creators team (Newsletter + Reader) piloted this in Spring 2026. This doc captures what we learned so the next team doesn't start from scratch.

## How it works

1. A push lands on `trunk` touching paths your workflow monitors.
2. The action checks out full git history and scans commit messages for Linear issue IDs.
3. Matching issues get linked to a new release in your team's Linear pipeline.

## Setting up a new workflow

Copy `.github/workflows/linear-release-creators.yml` as a starting point. You'll need:

- **A Linear pipeline access key** stored as a GitHub Actions secret. This is not a Personal API key. Generate it from your team's Release pipeline settings in Linear.
- **Path filters** scoped to your team's code. Keep these tight: every trunk push matching your paths can create a release entry.
- **`fetch-depth: 0`** on the checkout step. The CLI compares commit ranges, so shallow clones break issue detection silently. This is easy to miss because the action succeeds but finds zero issues.

### Workflow hardening

- **SHA-pin the action.** Tag references like `v0.6.0` are mutable. A compromised tag could run arbitrary code with your secret. Pin to the commit SHA for the version you want.
- **Set `permissions: contents: read`.** Without an explicit permissions block, the workflow inherits org defaults, which can drift broader than needed.
- **Add concurrency control.** Rapid trunk pushes can trigger duplicate syncs. Use `concurrency` with `cancel-in-progress: false` to queue them.

## Gotchas

### Issue detection may require a keyword prefix

During our pilot with CLI v0.5.0, bare issue IDs in commit messages (e.g., `NL-490 Fix thing`) were not detected. Adding a keyword prefix (`Fixes NL-490`, `Ref READ-432`) or including the issue ID in the branch name (`feat/NL-490-description`) resolved this. The upstream docs say the CLI "automatically scans commits for Linear issue identifiers" but do not clarify whether bare IDs work. Safest approach: always use a keyword prefix.

| Works | Not reliably detected (as of v0.5.0) |
|---|---|
| `Fixes NL-490 Add celebration modal` | `NL-490 Add celebration modal` |
| `Ref READ-432 Update feed layout` | `READ-432 Update feed layout` |
| Branch name `feat/NL-490-description` | Bare ID in commit body without keyword |

### Action versioning is confusing

Linear's docs reference `v1`, which doesn't exist as a published tag. As of April 2026, the latest release is `v0.6.0` (which bundles CLI `v0.7.0`). Always check the [releases page](https://github.com/linear/linear-release-action/releases) for the current version.

### One release per push is expected

Matching trunk pushes create a separate release entry when commits reference tracked issues. If no commits match, no release is created. This can be noisy in high-frequency repos. CLI v0.7.0 defaults to short-SHA version names, which avoids the duplicate-version-name collisions that occurred with earlier naming schemes.

### Linear UI can show phantom releases

You may see an "N releases" badge on a project while the release list appears empty. This is a Linear UI rendering issue, not a problem with your workflow.

## Linear setup for testing

Before your first merge to trunk, make sure Linear is configured to receive releases:

1. **Enable the GitHub integration** in Linear Settings > Integrations > GitHub if not already active.
2. **Create a release pipeline** for your team: go to your team's settings in Linear, find the Releases section, and enable it. This is where releases will appear after the action runs.
3. **Generate a pipeline access key**: In your team's Release pipeline settings in Linear, create an access key. This is not a Personal API key.
4. **Add the secret to GitHub**: In the Calypso repo settings, add your key as a repository secret (e.g., `LINEAR_RELEASE_KEY_YOURTEAM`).
5. **Test with a real merge**: The action only runs on trunk pushes, so you need an actual merge to test. Use a trivial change (comment, whitespace) in a monitored path with a commit message like `Ref TEAM-123 Test Linear release sync`.
6. **Verify in Linear**: After the workflow completes, check your team's Releases view. The new release should appear with the referenced issue linked.

## Current deployments

| Team | Workflow | Secret | Paths |
|---|---|---|---|
| Creators (Newsletter + Reader) | `linear-release-creators.yml` | `LINEAR_RELEASE_KEY_CREATORS` | `client/reader/**`, `client/blocks/reader-*/**`, newsletter-related data/UI paths |
