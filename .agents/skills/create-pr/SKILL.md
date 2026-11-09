---
name: create-pr
description: Commit the current change and open a draft GitHub pull request for it, with the commit message and PR description in this repository's format. Use whenever committing, pushing a branch or creating a pull request in this repository.
---

# Create a pull request

A pull request starts as one commit; follow-up commits during review are fine, since PRs are squash-merged. The commit message and the PR description follow the format below. Draft both first, then create the branch, commit and push.

This is a public repository: follow the Confidentiality section of `AGENTS.md` in the subject, body and PR description. No internal URLs; use P2 and Slack shortlinks and bare Linear keys (`LIN-123`). Don't mention people's names.

## 1. Write the subject

`<Area>: <Summary>`, e.g. `Sites: Show the PHP version for Simple sites`.

- **Area** is the product area or section the change touches, as a user or developer would name it, e.g. `Reader`, `Notifications`, `Domains`, `Checkout`, `Dashboard`, `Agents Manager`, `Help Center`, `Components`, `Packages`, `E2E`, `Config`. When several fit, pick the one that tells a reader scanning `git log` the most. When none fits, look for precedent before naming a new one.
- **Summary** starts with a verb in the imperative: `Show`, `Fix`, `Remove`, `Let`, `Load`.

## 2. Write the commit body

Two plain paragraphs of one or two sentences each, with no labels, lists or headings. The first states the problem: what was wrong or missing, in the past tense. The second states the fix: how this change solves it, in the present tense.

Example:

```
Sites: Show the PHP version for Simple sites

The Sites list and site overview showed `-` for the PHP version of Simple sites, even though they run PHP. The version was only fetched for sites with the PHP hosting feature, which Simple sites don't have.

Simple sites now read their PHP version from Core's `core/get-environment-info` ability, for users who can manage the site's options. Other sites still use the hosting PHP endpoint.
```

## 3. Write the PR description

The PR title is the commit subject. The description follows `.github/PULL_REQUEST_TEMPLATE.md`.

Start with a line linking the related GitHub or Linear issue: `Fixes #123` or `Fixes LIN-123` when merging resolves it, `Part of LIN-123` when it doesn't, e.g. it still needs a separate deploy. Leave the line out when there is no issue.

The description then reuses the commit body's two paragraphs in reverse order, each under its own heading. `## What` holds the fix paragraph rewritten to start with a verb in the imperative, like the subject's summary, then `## Why` holds the problem paragraph as is.

Then add a `## Details` heading listing what What and Why leave out: which components, hooks, selectors, endpoints or feature flags change and how, trade-offs and alternatives rejected, and work left for a follow-up. Put the list in a collapsed `<details>` block whose `<summary>` is `Click to view details`, with a blank line after `<summary>` and before `</details>` so that GitHub renders the Markdown inside. Prefer a list when there are several parts, so a reviewer can scan it. Leave out Details only when What already names everything the diff does.

Last, add a `## How to Test` heading with numbered steps a reviewer can follow on Calypso Live or a local dev server: the URL path to open, what to do, and what to expect. Keep each step to one action and its result, starting with any setup it needs (site, account, flag); for a fix, also say what happens without it. If the change runs in more than one app (for example Dashboard and A4A, or Calypso and Jetpack Cloud), include steps for each. Don't list tests or CI runs; the checks already show them.

After the steps, add one short line naming the commit they ran on and where, e.g. "Ran on Calypso Live at 4c0c0bb." Mark a step you couldn't run `**Not run:**` with the reason, e.g. it needs access you don't have or changes something you can't undo, and keep it in the list so the reviewer can run it.

For a change users can see (UI, or new or changed translatable strings), add before/after screenshots: reviewers check the expected state against them, and the a8ci18n bot asks for a screenshot of new strings for translators. Take them with a test account, with internal hostnames and personal data kept out. If you can't upload images, say so instead. Never commit images to the repository to host them.

Drop the template's HTML comments.

Example:

```
Part of DOTMSD-1611

## What

Read the PHP version of Simple sites from Core's `core/get-environment-info` ability, for users who can manage the site's options. Other sites still use the hosting PHP endpoint.

## Why

The Sites list and site overview showed `-` for the PHP version of Simple sites, even though they run PHP. The version was only fetched for sites with the PHP hosting feature, which Simple sites don't have.

## Details

<details>
<summary>Click to view details</summary>

- `canViewPHPVersion` in `client/dashboard/sites/features.ts` allows sites with the PHP hosting feature, and Simple sites whose user has `manage_options`. The Sites list field and the site overview both use it.
- `fetchSiteEnvironmentInfo` in `@automattic/api-core` runs the ability, and `siteEnvironmentPHPVersionQuery` in `@automattic/api-queries` trims its version to major.minor, e.g. `8.3`.
- This is an alternative to #116059, which needed a backend change.

</details>

## How to Test

1. As an admin of a Simple site, open `/sites`, enable the PHP column in **View options**, and check that the site shows its PHP version.
2. Open the site's overview and check that it shows the PHP version too.
3. Check that an Atomic site is unchanged.

| | Before | After |
|---|---|---|
| Sites list | (screenshot) | (screenshot) |
| Site overview | (screenshot) | (screenshot) |
```

## 4. Open the PR

1. Unless told specifically otherwise, branch off the latest `trunk`, named `<prefix>/<short-kebab-description>` with a single slash, because multiple slashes break Calypso Live testing. The prefix is `add/` (new feature), `update/` (iterating on an existing one), `fix/` (fixing something broken) or `try/` (experiment). Don't use Linear's autogenerated branch name (e.g. `dotcom-17900-…`), which has no prefix.
2. Verify the change with [verify](../verify/SKILL.md), at least the CI type-check for the code you touched. Skip this for docs-only changes.
3. Commit, push, and open the PR as a draft.

Omit tool attribution such as a "Generated with Claude Code" footer or a `Co-Authored-By` trailer.
