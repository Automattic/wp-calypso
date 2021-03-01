# Other Information

## Table of Contents

- [NodeJS Version](#nodejs-version)
- [Git Pre-Commit Hook](#git-pre-commit-hook)
- [Launch Logged-In Window](#launch-logged-in-window)
- [User account requirements](#user-account-requirements)
- [List of wrapper repos & friends](#list-of-wrapper-repos--friends)
- [What to name your branch](#what-to-name-your-branch)
- [How to fix the `chromedriver not found` error when running e2e tests locally](#how-to-fix-the-chromedriver-not-found-error-when-running-e2e-tests-locally)

## NodeJS Version

The node version should be defined in the `.nvmrc` file for use with the [nvm](https://github.com/creationix/nvm) project.

## Launch Logged-In Window

To facilitate manual testing, the [launch-wpcom-login.js](/scripts/launch-wpcom-login.js) file in `/scripts` will launch a Chrome browser window to WordPress.com and log in with the account definition given on the command line. The only config requirement for this is that the `local-${NODE_CONFIG_ENV}.json` file needs to have the `testAccounts` object defined. If no account is given on the command line, `defaultUser` will be used.

Example:

```bash
./node_modules/.bin/babel-node scripts/launch-wpcom-login.js multiSiteUser
```

## User account requirements

### jetpackUserPRESSABLE for PRESSABLE Target

- Selected main site (in Account Settings)
- Working Twitter Publicize integration
- Free plan
- Theme which is displaying tags and categories (e.g. Twenty Fifteen)
- Installed "Hello Dolly" plugin

## List of wrapper repos & friends

Wrapper repo is basically the same Main repo but with parameterized `./run.sh` command which provide variety of ways to run the tests. We set things up this way to make it easy to differentiate build types on Circle CI, for example: [history of WooCommerce e2e test runs](https://circleci.com/build-insights/gh/Automattic/wp-e2e-tests-woocommerce/master).

1. ~~[Main repo](https://github.com/Automattic/wp-e2e-tests) - Retired e2e repo~~
1. [Canary tests](https://github.com/Automattic/wp-e2e-tests-canary) - `@canary` tagged tests which runs on every Calypso `trunk` merge
1. ~~[IE11 tests](https://github.com/Automattic/wp-e2e-tests-ie11) - IE11 tests running in Sauce Labs. Triggered by `cron` job~~
1. ~~[Jetpack stable](https://github.com/Automattic/wp-e2e-tests-jetpack) - Jetpack centric tests (specs tagged with `@jetpack` tag) which uses stable Jetpack releases and hosted on Pressable~~
1. ~~[Jetpack bleeding edge](https://github.com/Automattic/wp-e2e-tests-jetpack-be) - Jetpack centric tests (specs tagged with `@jetpack` tag) which uses 'bleeding edge' Jetpack releases and hosted on Pressable~~
1. [Branches full suite tests](https://github.com/Automattic/wp-e2e-tests-for-branches) - Repo which is used to run e2e full suite tests against Calypso PR's. Triggered by GitHub labels
1. [Branches canary tests](https://github.com/Automattic/wp-e2e-canary-for-branches) - Repo which is used to run e2e canary tests against Calypso PR's. Triggered by GitHub labels
1. ~~[Woo tests](https://github.com/Automattic/wp-e2e-tests-woocommerce) - Runs WooCommerce specs~~
1. ~~[I18N tests](https://github.com/Automattic/wp-e2e-tests-i18n) - Runs I18N test suite. Triggered by `cron` job~~
1. ~~[Jetpack Release Smoke test](https://github.com/Automattic/wp-e2e-tests-jetpack-smoke) - Manually triggered smoke test which is running against multiple set of WPORG hosts~~

\*\* Branches with strikethrough are now unnecessary with the move of e2e tests in to wp-calypso

\*\*Note- If adding to this list, also add to /scripts/circleci-branch-update.sh to ensure they stay up to date on node version

Friends:

- [E2E tests Github bridge](https://github.com/Automattic/wp-e2e-tests-gh-bridge) - middleware used to trigger Branches repo by github labels
- [WP-Desktop Github bridge](https://github.com/Automattic/wp-desktop-gh-bridge) - middleware used to trigger e2e tests to run against wp-desktop by github labels

## What to name your branch

- Use the same naming conventions as listed in [wp-calypso](https://github.com/Automattic/wp-calypso/blob/HEAD/docs/git-workflow.md#branch-naming-scheme)
- If you have changes to jetpack tests, be sure to add "jetpack" into your branch name so those tests are run on CI

## How to fix the `chromedriver not found` error when running e2e tests locally

When runnning e2e tests locally, an error can appear about chromedriver not being found in `/wp-calypso/node_modules/chromedriver/lib/chromedriver/chromedriver`

This is likely due to a few `env` variables that are recommended by `yarn calypso-doctor`, since installing `chromedriver` is really slow and not needed most of the time. In particular:

- `CHROMEDRIVER_SKIP_DOWNLOAD`
- `PUPPETEER_SKIP_DOWNLOAD`

You can force the download of `chromedriver` by overriding the environment variablew, and forcing a fresh install:

`CHROMEDRIVER_SKIP_DOWNLOAD='' PUPPETEER_SKIP_DOWNLOAD='' yarn install --force`
