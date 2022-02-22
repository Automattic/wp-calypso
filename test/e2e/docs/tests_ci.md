<div style="width: 45%; float:left" align="left"><a href="./tests_local.md"><-- Running tests on your machine</a> </div>
<div style="width: 5%; float:left" align="center"><a href="./../README.md">Top</a></div>
<div style="width: 45%; float:right"align="right"><a href="./writing_tests.md">Writing Tests --></a> </div>

<br><br>

# Running tests on CI

<!-- TOC -->

- [Running tests on CI](#running-tests-on-ci)
  - [Feature/Test groups](#featuretest-groups)
  - [Feature branch](#feature-branch)
  - [Trunk](#trunk)
  - [Scheduled build configurations](#scheduled-build-configurations)

<!-- /TOC -->

<br>

> :lock: Unfortunately, access to TeamCity is available only to Automatticians at this time. OSS Citizens (including Trialmatticians), please request an Automattician to execute the required e2e tests in the PR prior to merge.

## Feature/Test groups

Each test file (referred to as `spec`) are assigned at least one group.
This ensures that [jest-runner-groups](https://github.com/eugene-manuilov/jest-runner-groups) is able to locate and run the appropriate set of test specs for the build configuration. **Failure to add a group will result in the spec not running as part of CI.**

The following groups are available as of this time:

| Group             | Remarks                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `calypso-pr`      | Run for every commit to any feature branch in this repository.                           |
| `calypso-release` | Run for every PR merged into `trunk` in this repository.                                 |
| `gutenberg`       | Editor-focused specs run on regular cadence.                                             |
| `coblocks`        | Block-focused specs for our fork of [CoBlocks](https://wordpress.org/plugins/coblocks/). |
| `i18n`            | Specs verifying internationalized strings.                                               |
| `p2`              | Specs for the internal P2 system.                                                        |
| `quarantined`     | Specs that need additional work.                                                         |
| `legal`           | Specs for the marketing and legal team.                                                  |

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

In addition to build configurations that are automatically triggered based on branch workflow, there exists build configurations that run on a regular schedule though **only on `trunk`**!

| Build configuration name            | Frequency  |
| ----------------------------------- | ---------- |
| WPCOM/Gutenberg E2E Tests (mobile)  | once a day |
| WPCOM/Gutenberg E2E Tests (desktop) | once a day |
| Quarantined E2E                     | once a day |
