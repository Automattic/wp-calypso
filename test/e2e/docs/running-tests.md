# Run tests

## Table of Contents

<!-- TOC -->

- [Run tests](#run-tests)
    - [Table of Contents](#table-of-contents)
    - [Staging](#staging)
        - [All tests default](#all-tests-default)
        - [Spec files](#spec-files)
        - [Individual suite](#individual-suite)
        - [Headless](#headless)
        - [Other options](#other-options)
    - [Locally Development Environment](#locally-development-environment)
    - [TeamCity](#teamcity)
    - [Sauce Labs](#sauce-labs)

<!-- /TOC -->

## Staging

By default, end-to-end tests run from the developer's hardware will hit the WPCOM Staging environment.

Prior to executing any end-to-end tests, ensure the steps at [setup](setup.md) have been followed.

### All tests (default)

```
./run.sh -g
```

Configuration values for this command is read from `magellan.json`.

This is the same process used in the CI environment.

Note that this command will search for tests tagged with `@parallel`. If you add new e2e tests, ensure it is tagged with the `@parallel` keyword. For more information, see this page.

### Spec file(s)

Calypso e2e tests use `mocha` as the test runner. 

 
Specify spec file(s) directly to mocha:
```
./node_modules/.bin/mocha <path_to_e2e_spec>
```

eg.

```
./node_modules/.bin/mocha specs/wp-calypso-gutenberg-coblocks-spec.js
```

Using `.only` syntax when writing tests:

eg.

```
describe.only( 'Logging In and Out:', function() {
```

**!NOTE**: ensure this syntax should be removed once the test is to be committed to the repository.
There is an eslint rule that will prevent committing tests with the `.only` syntax, but please also exercise due diligence.

### Individual suite

```
./node_modules/.bin/mocha <path_to_e2e_spec> -g "<test_case_name>"
```

eg.

```
./node_modules/.bin/mocha specs/wp-calypso-gutenberg-coblocks-spec.js -g 'Insert a Pricing Table block'
```

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

## Locally (Development Environment)

Local development environment refers to a locally served instance of the `wp-calypso` frontend.

1. ensure required [dependencies](setup.md#software-environment#steps) are set up.

2. change the `calypsoBaseURL` value in `test/e2e/config/default.json` to `http://calypso.localhost:3000`.

3. start the webapp as follows:

```shell
yarn start
./run.sh -g -u http://calypso.localhost:3000
```

4. ensure requests to `http://calypso.localhost:3000` are registering in your local instance.

When calypso e2e test are now run, they will hit againt the local development server instead of WordPress.com staging environment.

## TeamCity

Calypso end-to-end tests have migrated to TeamCity as of 2021-01. 

Both sets of E2E Tests (desktop, mobile) are run against all branches, PRs and trunk. This process is automatic.

Note that interactions in TeamCity are available only to Automatticians. For OSS Citizens, please request that e2e tests be run in the PR.

## Sauce Labs

To run tests on Sauce Labs, add the following environment variable to CircleCI:

```
export SAUCE_ARG="-l osx-chrome"
```

Note that tests tend to run slower on Sauce Labs and this option should be used sparingly.
