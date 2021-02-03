# Run tests

## Table of Contents

<!-- TOC -->

- [Run tests](#run-tests)
    - [Table of Contents](#table-of-contents)
    - [Local Against Staging](#local-against-staging)
        - [Run all tests default](#run-all-tests-default)
        - [Run individual spec](#run-individual-spec)
        - [Run individual case](#run-individual-case)
        - [Headless](#headless)
        - [Other options](#other-options)
    - [Local Development Environment](#local-development-environment)
    - [CircleCI](#circleci)
        - [Canary](#canary)
        - [Full suite](#full-suite)
        - [Schedule](#schedule)
    - [Sauce Labs](#sauce-labs)

<!-- /TOC -->

## Local Against Staging

To run tests locally, ensure relevant steps in the [setup](docs/setup.md) have been followed.

These steps will execute tests against WordPress.com staging environment. To run against a local development environment see the section below.

### Run all tests (default)

```
./run.sh -g
```

Configuration values for this command is read from `magellan.json`.

This is the same process used in the CI environment.

Note that this command will search for tests tagged with `@parallel`. If you add new e2e tests, ensure it is tagged with the `@parallel` keyword. For more information, see this page.

### Run individual spec

```
./node_modules/.bin/mocha <path_to_e2e_spec>
```

eg.

```
./node_modules/.bin/mocha specs/wp-calypso-gutenberg-coblocks-spec.js
```

Alternatively, use the `.only` syntax when writing tests:

eg.

```
describe.only( 'Logging In and Out:', function() {
```

### Run individual case

```
./node_modules/.bin/mocha <path_to_e2e_spec> -g "<test_case_name>"
```

eg.

```
./node_modules/.bin/mocha specs/wp-calypso-gutenberg-coblocks-spec.js -g 'Insert a Pricing Table block'
```

**!NOTE**: this syntax should be removed once the test is to be committed to the repository.

### Headless

By default the tests start their own Selenium server in the background, which in turn launches a Chrome browser on your desktop where you can watch the tests execute. This can be a bit of a headache if you're trying to do other work while the tests are running, as the browser may occasionally steal focus back (although that's mostly been resolved).

The easiest way to run "headlessly" without a visible window is to add the `-x` flag when running `run.sh`:

```
./run.sh -g -x
```

or using the `HEADLESS=1` environment variable which will run Chrome with the `--headless` flag:

```
export HEADLESS=1
./node_modules/.bin/mocha <path_to_e2e_spec>
```

### Other options

The `run.sh` script takes a number of parameters that can be mixed-and-matched.

For the list of current supported flags, use `run.sh -h`.

## Local Development Environment

Local development environment refers to a locally served instance of the `wp-calypso` frontend.

```shell
npm start
./run.sh -g -u http://calypso.localhost:3000
```

## CircleCI

Broadly speaking, `Automattic/wp-calypso` runs two types of test suites:

- canary (limited set)
- full (full set)

Each suite is also scheduled to execute at regular intervals throughout the day.

Additionally, suites can be triggered using the appropriate GitHub label on the PR.

### Canary

As of 2021-01-25, a variety of canary tests are triggered _automatically_ on all PRs and merges.

These include:

- chrome canary
- internet explorer
- safari
- woocommerce

### Full suite

The following GitHub labels provide ability to trigger e2e tests for specific feature(s):

| Label                                      | Target Suite                                     |
| ------------------------------------------ | ------------------------------------------------ |
| `[Status] Needs e2e Testing`               | Full suite of WordPress.com e2e tests            |
| `[Status] Needs Jetpack e2e Testing`       | Full suite of Jetpack e2e tests                  |
| `[Status] Needs e2e Testing CoBlocks Edge` | Full suite of CoBlocks e2e tests                 |
| `[Status] Needs e2e Testing Gutenberg`     | Full suite of Gutenberg e2e tests                |
| `[Status] Needs e2e Testing horizon`       | Full mobile & desktop suite of horizon e2e tests |

### Schedule

_All times are in UTC._

| Suite                 | When                         | Time                       |
| --------------------- | ---------------------------- | -------------------------- |
| WordPress.com         | Each `wp-calypso` deployment | -                          |
|                       | Every 6 hours                | 00:00, 06:00, 12:00, 18:00 |
| Internet Explorer     | ?                            | ?                          |
| Jetpack               | Every 12 hours               | 01:00, 13:00               |
| Jetpack Bleeding Edge | Every 12 hours               | 07:00, 19:00               |
| WooCommerce           | Every 12 hours               | 11:00, 23:00               |

## Sauce Labs

To run tests on Sauce Labs, add the following environment variable to CircleCI:

```
export SAUCE_ARG="-l osx-chrome"
```

Note that tests tend to run slower on Sauce Labs and this option should be used sparingly.
