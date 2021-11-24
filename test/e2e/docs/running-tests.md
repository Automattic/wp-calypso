# Run tests

## Table of Contents

<!-- TOC -->

- [Run tests](#run-tests)
    - [Table of Contents](#table-of-contents)
    - [Run a spec](#run-a-spec)
        - [A suite of specs](#a-suite-of-specs)
        - [Individual spec files](#individual-spec-files)
    - [TeamCity](#teamcity)
- [Advanced](#advanced)
    - [Override default target](#override-default-target)
        - [Staging](#staging)
        - [Local webapp](#local-webapp)

<!-- /TOC -->

## Run a spec

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

## TeamCity

Calypso end-to-end tests have migrated to TeamCity as of 2021-01.

Both sets of E2E Tests (desktop, mobile) are run against all branches, PRs and trunk. This process is automatic.

> :lock: Unfortunately, access to TeamCity is available only to Automatticians at this time. OSS Citizens (including Trialmatticians), please request an Automattician to execute the required e2e tests in the PR.

# Advanced

## Override default target

### Staging

By default, end-to-end tests run from the developer's hardware will hit the WPCOM Staging environment, defined by the value `calypsoBaseUrl` within [`default.json`](config/default.json) file.

### Local webapp

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
