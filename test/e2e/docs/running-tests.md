# Run tests

## Table of Contents

<!-- TOC -->

- [Run tests](#run-tests)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
    - [Selenium legacy e2e](#selenium-legacy-e2e)
    - [Playwright e2e](#playwright-e2e)
  - [Target endpoint](#target-endpoint)
    - [Staging](#staging)
    - [Localhost](#localhost)
  - [Running tests Playwright](#running-tests-playwright)
    - [All tests](#all-tests)
    - [Individual spec files](#individual-spec-files)
  - [Running tests Selenium](#running-tests-selenium)
    - [All tests](#all-tests)
    - [Individual spec files](#individual-spec-files)
  - [TeamCity](#teamcity)

<!-- /TOC -->

## Overview

> As of 2021-08, Calypso e2e is undergoing migration from Selenium to Playwright. Until the migration is complete, there will be two methods to run e2e tests.

### Selenium (legacy) e2e

Selenium e2e tests use a combination of [`mocha`](https://mochajs.org/) and [`magellan`](https://github.com/TestArmada/magellan) to run its tests.

`mocha` is the test framework and runner.
`magellan` is a test runner runner that parallelizes `mocha` instances and adds automatic retries and suite support.

Calypso e2e when run in the CI environment uses `magellan` to spin up multiple `mocha` processes, each tasked with running one scenario (tagged with `@parallel`) from beginning to end. If any failures are encountered, the `mocha` process bails immediately and `magellan` schedules an automatic retry of the suite until the maximum number of attempts are reached.

Calypso e2e when run locally can use either `magellan` for identical behavior as in CI, or alternatively invoke `mocha` directly.

### Playwright e2e

Playwright e2e tests use Jest as the test framework and runner.

Jest natively parallelizes test suites, halting execution if any failures are detected. Automatic retry is not available with Jest.

---

## Target endpoint

### Staging

By default, end-to-end tests run from the developer's hardware will hit the WPCOM Staging environment, defined by the value `calypsoBaseUrl` within [`default.json`](config/default.json) file.

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

---

## Running tests (Playwright)

First, transpile TypeScript code:

```
yarn workspace @automattic/calypso-e2e build --watch
```

### A suite of specs

We use [jest-runner-groups](https://github.com/eugene-manuilov/jest-runner-groups) to group and run suites of specs.

Use the `--group` arg to provide a suite to test `Jest`. For example, to run all the tests run on a Calypso PR, run...

```
yarn jest --group=calypso-pr
```

### Individual spec file(s)

Specify the file(s) directly:

```
yarn jest specs/specs-playwright/wp-support__popover.ts specs/specs-playwright/wp-support__home.ts
```

## Running tests (Selenium)

### Individual spec file(s)

Specify spec file(s) directly to mocha:

<details>
<summary>Example (mocha)</summary>

```
yarn mocha specs/specs-wpcom/wp-calypso-gutenberg-coblocks-spec.js
```

</details>

<details>
<summary>Example (magellan)</summary>

```
yarn magellan --test=specs/specs-wpcom/wp-log-in-out-spec.js
```

</details>

Alternatively, append the `.only` postfix to a `describe` block:

<details>
<summary>Example</summary>

```
describe.only( 'Logging In and Out:', function() {
```

</details>

> :warning: ensure this syntax should be removed once the test is to be committed to the repository. There is an ESLint rule that checks for `.only` syntax, but please also exercise due diligence.

## TeamCity

Calypso end-to-end tests have migrated to TeamCity as of 2021-01.

Both sets of E2E Tests (desktop, mobile) are run against all branches, PRs and trunk. This process is automatic.

> :lock: Unfortunately, access to TeamCity is available only to Automatticians at this time. OSS Citizens (including Trialmatticians), please request an Automattician to execute the required e2e tests in the PR.
