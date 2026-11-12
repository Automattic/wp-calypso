---
name: create-pr
description: Commit the current change and open a draft GitHub pull request for it, with the commit message and PR description in this repository's format. Use whenever committing, pushing a branch or creating a pull request in this repository.
---

# Create a pull request

A pull request starts as one commit; follow-up commits during review are fine.

This is a public repository: follow the Confidentiality section of `AGENTS.md` in the subject, body and PR description. No internal URLs; use P2 and Slack shortlinks and bare Linear keys (`LIN-123`). Don't mention people's names.

## 1. Write the subject

`<Area>: <Summary>`, e.g. `Sites: Show the PHP version for Simple sites`.

- **Area** is the product area or section the change touches, as a user or developer would name it. Look for precedent before naming a new one.
- **Summary** starts with a verb in the imperative.

## 2. Write the commit body

Two plain paragraphs of one or two sentences each, with no labels, lists or headings. The first states the problem: what was wrong or missing, in the past tense. The second states the fix: how this change solves it, in the present tense.

Example:

```
Sites: Show the PHP version for Simple sites

The Sites list and site overview showed `-` for the PHP version of Simple sites, even though they run PHP. The version was only fetched for sites with the PHP hosting feature, which Simple sites don't have.

Simple sites now read their PHP version from Core's `core/get-environment-info` ability, for users who can manage the site's options. Other sites still use the hosting PHP endpoint.
```

## 3. Write the PR description

The PR title is the commit subject. The description follows `.github/PULL_REQUEST_TEMPLATE.md`, without its HTML comments.

Start with a line linking the related GitHub or Linear issue: `Fixes #123` or `Fixes LIN-123` when merging resolves it, `Part of LIN-123` when it doesn't, e.g. it still needs a separate deploy. Leave the line out when there is no issue.

If the change adds new translatable strings, add this warning next, so a human remembers the label (see the String Freeze section of [docs/i18n.md](../../../docs/i18n.md#string-freeze)):

```
> [!IMPORTANT]
> This PR introduces new translatable strings. Remember to add the `[Status] String Freeze` label before merging.
```

The description then reuses the commit body's two paragraphs in reverse order, each under its own heading. `## What` holds the fix paragraph rewritten to start with a verb in the imperative, then `## Why` holds the problem paragraph as is.

For a change users can see (UI, or new or changed translatable strings), add before/after screenshots under `## What`, after its paragraph. Take and upload them as in [verify/screenshots.md](../verify/screenshots.md).

Then add a `## Details` heading listing what What and Why leave out: which components, hooks, selectors, endpoints or feature flags change and how, trade-offs and alternatives rejected, and work left for a follow-up. Put the list in a collapsed `<details>` block whose `<summary>` is `Details`, with a blank line after `<summary>` and before `</details>` so that GitHub renders the Markdown inside. When changes must ship in a particular sequence, state the rollout order under Details, before the `<details>` block. Leave out Details only when What already names everything the diff does.

Next, add a `## How to Test` heading with numbered steps a reviewer can follow on Calypso Live or a local dev server: the URL path to open, what to do, and what to expect. Keep each step to one action and its result, starting with any setup it needs (site, account, flag); for a fix, also say what happens without it. If the change runs in more than one app (for example Dashboard and A4A, or Calypso and Jetpack Cloud), include steps for each. Don't list tests or CI runs; the checks already show them.

List any companion patches above step 1 and say which steps or environments need each patch. Link public PRs, and reference private PRs by the private links, such as 12345-ghe-Automattic/wpcom.

Start a step with `🤖☑️` only when you ran it on the commit you're pushing and saw its expected result; reading the code or a passing test doesn't count. Leave a step you couldn't run unmarked. A step that fails is a bug: fix it or ask the user, and don't reword the step to match.

After How to Test, add a `## Agent Report` heading with "🤖☑️ Tested by the agent on <where> at commit <hash>." and, if any step is unmarked, "⚠️ The agent didn't run testing <steps>: <why>.", with <steps> such as `step 3` or `steps 2 and 3`. Leave out the first line when you ran no step.

Then add a collapsed `<details>` block whose `<summary>` is `Pattern consistency report`, formatted like the one under Details. In it, list places where the code you touched showed more than one way to do the same thing, used a deprecated pattern, or disagreed with the docs: at most the two that cost you the most time or would most likely mislead the next change. Name the files, and say which way you followed and why. When you found none, write "No conflicting patterns found." instead of the list. Leave out the block only when you wrote no code that could follow a pattern, such as a dependency bump, a docs-only change, a config value or feature flag toggle, a revert, or regenerated files.

Example:

```
Part of DOTMSD-1611

## What

Read the PHP version of Simple sites from Core's `core/get-environment-info` ability, for users who can manage the site's options. Other sites still use the hosting PHP endpoint.

| | Before | After |
|---|---|---|
| Sites list | (screenshot) | (screenshot) |
| Site overview | (screenshot) | (screenshot) |

## Why

The Sites list and site overview showed `-` for the PHP version of Simple sites, even though they run PHP. The version was only fetched for sites with the PHP hosting feature, which Simple sites don't have.

## Details

<details>
<summary>Details</summary>

- `canViewPHPVersion` in `client/dashboard/sites/features.ts` allows sites with the PHP hosting feature, and Simple sites whose user has `manage_options`. The Sites list field and the site overview both use it.
- `fetchSiteEnvironmentInfo` in `@automattic/api-core` runs the ability, and `siteEnvironmentPHPVersionQuery` in `@automattic/api-queries` trims its version to major.minor, e.g. `8.3`.
- This is an alternative to #116059, which needed a backend change.

</details>

## How to Test

1. 🤖☑️ As an admin of a Simple site, open `/sites`, enable the PHP column in **View options**. Verify that the site shows its PHP version.
2. 🤖☑️ Open the site's overview. Verify that it shows the PHP version too.
3. Verify that an Atomic site is unchanged.

## Agent Report

🤖☑️ Tested by the agent on a local dev server at commit 4c0c0bb.

⚠️ The agent didn't run testing step 3: it needs an Atomic site, and none was available.

<details>
<summary>Pattern consistency report</summary>

- Some Sites list fields check access through helpers in `client/dashboard/sites/features.ts`, while others check it inline in their field definitions. Followed `features.ts`, which the site overview also uses.

</details>
```

## 4. Open the PR

1. Unless told specifically otherwise, branch off the latest `trunk`, named `<prefix>/<short-kebab-description>` with a single slash, because multiple slashes break Calypso Live testing. The prefix is `add/` (new feature), `update/` (iterating on an existing one), `fix/` (fixing something broken) or `try/` (experiment). Don't use Linear's autogenerated branch name (e.g. `dotcom-17900-…`), which has no prefix.
2. Run the `verify` skill ([verify/SKILL.md](../verify/SKILL.md)), at least the CI type-check for the code you touched, plus the browser check for a change users can see (UI, or new or changed translatable strings). In the browser check, run each How to Test step and mark it as in [How to Test](#3-write-the-pr-description). The browser check can wait for the draft's Calypso Live preview (see [Choosing where to test](../verify/browser.md#choosing-where-to-test)). Skip this for docs-only changes.
3. For a change users can see, ask the user whether they want before/after screenshots, or take them without asking if no one is there. Preview them with `node .agents/skills/verify/scripts/preview.cjs "$OUT"` and `open` the page it writes; if the user is there, ask whether they want to adjust anything, and wait for both answers before committing. If the browser check waits for the Calypso Live preview, do this after it instead.
4. Commit, push, and open the PR as a draft. If the browser check waited for the preview, run it once the preview is built, then add the screenshots, mark the steps you ran and fill in the Agent Report before marking the PR ready.

Omit tool attribution such as a "Generated with Claude Code" footer or a `Co-Authored-By` trailer.
