[← Documentation index](./overview.md)

# Running tests on CI

<!-- TOC -->

- [Running tests on CI](#running-tests-on-ci)
  - [Feature/Test tags](#featuretest-tags)
  - [Feature branch](#feature-branch)
  - [Trunk](#trunk)
  - [Scheduled build configurations](#scheduled-build-configurations)
  - [Jetpack build configurations](#jetpack-build-configurations)

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
| `@authentication`            | Login, 2FA and security key specs.                                  |
| `@gutenberg`                 | Editor-focused specs run on regular cadence.                        |
| `@i18n`                      | Specs verifying internationalized strings.                          |
| `@p2`                        | Specs for the internal P2 system.                                   |
| `@legal`                     | Specs for the marketing and legal team.                             |
| `@jetpack-wpcom-integration` | Specs for testing Jetpack's deployment on WPCOM.                    |

The remaining tags in `lib/pw-base.ts` group specs without selecting a build of their own.
That includes `@jetpack-remote-site`: no build greps it, so a spec carrying only that
tag never runs on CI.

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

## Jetpack build configurations

The Jetpack builds have no trigger in this repository: systems outside it queue them by
TeamCity build ID. Renaming or removing one breaks its caller, so update the caller first.

- **Jetpack Simple E2E Tests** (`calypso_WPComTests_JetpackSimpleE2ETests`): `bin/jetpack-sun-moon`
  in the WPCOM repository, on each continuous Jetpack deploy to Simple sites, and the
  `DotCom_GithubA8cCom_Wpcom_JetpackRecentPassingSimpleDeployE2eTests` TeamCity check,
  which Gherald starts on sun-moon PRs. Both still use the legacy
  `calypso_WPComTests_jetpack_simple_deployment_e2e_desktop` and `_mobile` builds.
- **Jetpack Atomic E2E Tests** (`calypso_WPComTests_JetpackAtomicE2ETests`): the Jetpack
  scenario of the ReleasesV2 release tool in the WPCOM repository, and manual runs during
  the Jetpack release. Both still use the legacy
  `calypso_WPComTests_jetpack_atomic_deployment_e2e_desktop` build.
- **Jetpack Atomic E2E Tests - Mixed Variations** (`calypso_WPComTests_JetpackAtomicSmokeE2ETests`):
  a Mission Control webhook, called after each Jetpack build by the workflow that updates
  the Jetpack staging sites. It still uses the legacy
  `calypso_WPComTests_jetpack_atomic_build_smoke_e2e_desktop` build.
