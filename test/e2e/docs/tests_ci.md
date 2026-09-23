[← Documentation index](./overview.md)

# Running tests on CI

<!-- TOC -->

- [Running tests on CI](#running-tests-on-ci)
  - [Feature/Test tags](#featuretest-tags)
  - [Feature branch](#feature-branch)
  - [Trunk](#trunk)
  - [Scheduled build configurations](#scheduled-build-configurations)

<!-- /TOC -->

<br>

> :lock: Unfortunately, access to TeamCity is available only to Automatticians at this time. OSS Citizens (including Trialmatticians), please request an Automattician to execute the required e2e tests in the PR prior to merge.

## Feature/Test tags

Each test file (referred to as `spec`) is assigned at least one tag, declared on the
`test.describe` block and taken from the `tags` object in [`lib/pw-base.ts`](../lib/pw-base.ts).
Build configurations select the specs they run by passing that tag to Playwright's `--grep`.
**Failure to add a tag will result in the spec not running as part of CI.**

The following tags are used by a build configuration as of this time:

| Tag                          | Remarks                                                             |
| ---------------------------- | ------------------------------------------------------------------- |
| `@calypso-pr`                | Run for every commit to any feature branch in this repository.      |
| `@calypso-release`           | Run for every PR merged into `trunk` in this repository.            |
| `@dashboard-pr`              | Dashboard-focused specs run for every commit to any feature branch. |
| `@a8c-for-agencies`          | Specs for the A8C for Agencies client.                              |
| `@authentication`            | Login, 2FA and security key specs. Selected by directory.           |
| `@gutenberg`                 | Editor-focused specs run on regular cadence.                        |
| `@i18n`                      | Specs verifying internationalized strings. Selected by directory.   |
| `@p2`                        | Specs for the internal P2 system. Selected by directory.            |
| `@legal`                     | Specs for the marketing and legal team.                             |
| `@jetpack-wpcom-integration` | Specs for testing Jetpack's deployment on WPCOM.                    |

The remaining tags in `lib/pw-base.ts` group specs without selecting a build of their own.
That includes `@jetpack-remote-site`: no build greps it, so a spec carrying only that
tag never runs on CI.

A build can also select its specs with a Playwright project rather than a tag, taking every
spec under a directory. `i18n`, `p2` and `authentication` work that way: a spec added to
`specs/i18n`, `specs/p2` or `specs/authentication` runs whether or not it carries the tag,
and one carrying the tag from anywhere else does not. See `projects` in
[`playwright.config.ts`](../playwright.config.ts).

## Feature branch

Anytime a new branch is pushed to GitHub it also becomes available in TeamCity.

| Build configuration name | Automatically triggered? |
| ------------------------ | ------------------------ |
| E2E Tests (mobile)       | Yes                      |
| E2E Tests (desktop)      | Yes                      |
| Pre-Release Tests        | No                       |

## Trunk

The main branch - `trunk` - behaves differently from feature branches. Changes to `trunk` can only occur once a PR is approved and merged.

The Pre-Release E2E tests are connected directly to the Calypso Deploy page and various Slack channels. If the Pre-Release E2E tests pass, the change(s) can then be deployed to production.

| Build configuration name | Automatically triggered? |
| ------------------------ | ------------------------ |
| E2E Tests (mobile)       | No                       |
| E2E Tests (desktop)      | No                       |
| Pre-Release Tests        | Yes                      |

## Scheduled build configurations

In addition to build configurations that are automatically triggered based on branch workflow, there exists build configurations that run on a regular schedule, but **only on `trunk`**.

| Build configuration name            | Frequency          |
| ----------------------------------- | ------------------ |
| WPCOM/Gutenberg E2E Tests (mobile)  | once a day         |
| WPCOM/Gutenberg E2E Tests (desktop) | once a day         |
| Authentication E2E                  | once every 6 hours |
