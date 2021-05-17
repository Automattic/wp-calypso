# Run tests

## Table of Contents

<!-- TOC -->

- [Run tests](#run-tests)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Target environment](#target-environment)
    - [Staging](#staging)
    - [Localhost](#localhost)
  - [Running tests](#running-tests)
    - [All tests](#all-tests)
    - [Individual spec files](#individual-spec-files)
    - [Individual suite](#individual-suite)
  - [Options](#options)
    - [Headless](#headless)
  - [TeamCity](#teamcity)

<!-- /TOC -->

## Overview

Calypso e2e tests use a combination of [`mocha`](https://mochajs.org/) and [`magellan`](https://github.com/TestArmada/magellan) to run its tests.

`mocha` is the test framework and runner.
`magellan` is a test runner runner that parallelizes `mocha` instances and adds automatic retries and suite support.

Calypso e2e when run in the CI environment uses `magellan` to spin up multiple `mocha` processes, each tasked with running one scenario (tagged with `@parallel`) from beginning to end. If any failures are encountered, the `mocha` process bails early (due to the `--bail` flag) and `magellan` schedules an automatic retry of the suite until the maximum number of attempts are reached.

Calypso e2e when run locally can use either `magellan` for identical behavior as in CI, or alternatively invoke `mocha` directly.

## Target environment

### Staging

By default, end-to-end tests run from the developer's hardware will hit the WPCOM Staging environment. This is specified inside the [`default.json`](config/default.json) file, under `calypsoBaseUrl`.

### Localhost

Local development environment refers to a locally served instance of the `wp-calypso` frontend.

1. ensure required [dependencies](setup.md#software-environment#steps) are set up.

2. change the `calypsoBaseURL` value in `test/e2e/config/default.json` to `http://calypso.localhost:3000`.

   Alternatively: create a new local-<name>.json under `test/e2e/config` and set the `calypsoBaseURL` value to `http://calypso.localhost:3000`.

3. start the webapp:

```shell
yarn start
```

4. once webapp is started, open `http://calypso.localhost:3000` in your browser.

5. ensure requests to `http://calypso.localhost:3000` are registering in your local instance.

The local environment is now ready for testing. When a test is run, it will hit againt the local development server instead of the WordPress.com staging environment.

## Running tests

### All tests

```
./run.sh -g
```

Configuration values for this command is read from `magellan.json`.

This command will run all tests in the `test/e2e/spec` directory using `magellan` with retries enabled.

### Individual spec file(s)

Specify spec file(s) directly to mocha:

```
./node_modules/.bin/mocha <path_to_e2e_spec>
```

<details>
<summary>Example (mocha)</summary>

```
./node_modules/.bin/mocha specs/wp-calypso-gutenberg-coblocks-spec.js
```

</details>

<detail>
<summary>Example (magellan)</summary>

```
yarn magellan --test=specs/wp-log-in-out-spec.js
```

</details>

Alternatively, append the `.only` postfix to a `describe` block:

<details>
<summary>Example</summary>

```
describe.only( 'Logging In and Out:', function() {
```

</details>

:warning: ensure this syntax should be removed once the test is to be committed to the repository.
There is an ESLint rule that checks for `.only` syntax, but please also exercise due diligence.

### Individual suite

```
./node_modules/.bin/mocha <path_to_e2e_spec> -g "<test_case_name>"
```

eg.

```
./node_modules/.bin/mocha specs/wp-calypso-gutenberg-coblocks-spec.js -g 'Insert a Pricing Table block'
```

## Options

### Headless

By default the tests start their own Selenium server in the background, which in turn launches a Chrome browser on your desktop where you can watch the tests execute. This can be a bit of a headache if you're trying to do other work while the tests are running, as the browser may occasionally steal focus back.

If using `run.sh`, add the `-x` flag:

```shell
./run.sh -g -x
```

If using `mocha` or `magellan`, export an environment variable:

```shell
export HEADLESS=1
./node_modules/.bin/mocha <path_to_e2e_spec>
```

## TeamCity

Calypso end-to-end tests have migrated to TeamCity as of 2021-01.

Both sets of E2E Tests (desktop, mobile) are run against all branches, PRs and trunk. This process is automatic.

Note that access to TeamCity is available only to Automatticians.

OSS Citizens (including Trialmatticians), please request an Automattician to execute the required e2e tests in the PR.
