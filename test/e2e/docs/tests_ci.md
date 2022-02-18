<div style="width: 45%; float:left" align="left"><a href="./tests_local.md"><-- Running tests on your machine</a> </div>
<div style="width: 5%; float:left" align="center"><a href="./../README.md">Top</a></div>
<div style="width: 45%; float:right"align="right"><a href="./writing_tests.md">Writing Tests --></a> </div>

<br><br>

# Running tests on CI

<!-- TOC -->

- [Running tests on CI](#running-tests-on-ci)
    - [Feature branch](#feature-branch)
    - [Trunk](#trunk)
    - [Scheduled build configurations](#scheduled-build-configurations)

<!-- /TOC -->

<br>

> :lock: Unfortunately, access to TeamCity is available only to Automatticians at this time. OSS Citizens (including Trialmatticians), please request an Automattician to execute the required e2e tests in the PR prior to merge.

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
