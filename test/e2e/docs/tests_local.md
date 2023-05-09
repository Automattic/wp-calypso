<div style="width:45%; float:left" align="left"><a href="./test_environment.md"><-- Test Environment</a> </div>
<div style="width: 5%; float:left" align="center"><a href="./../README.md">Top</a></div>
<div style="width: 45%; float:right"align="right"><a href="./tests_ci.md">Running tests on CI --></a> </div>

<br><br>

# Running tests on your machine

<!-- TOC -->

- [Running tests on your machine](#running-tests-on-your-machine)
  - [Prerequisites](#prerequisites)
  - [Running tests](#running-tests)
    - [Individual spec files](#individual-spec-files)
    - [Test Group](#test-group)
  - [Advanced techniques](#advanced-techniques)
    - [Save authentication cookies](#save-authentication-cookies)
    - [Use the mobile viewport](#use-the-mobile-viewport)
    - [Target a different environment](#target-a-different-environment)
    - [Debug mode](#debug-mode)
      - [Notes on TypeScript](#notes-on-typescript)

<!-- /TOC -->

## Prerequisites

Prior to running any tests, transpile TypeScript code:

```bash
# If within test/e2e directory
yarn build

# If at repo root
yarn workspace wp-e2e-tests build
```

Alternatively, open a separate Terminal window:

```bash
# If within test/e2e directory
yarn build --watch

# If at repo root
yarn workspace wp-e2e-tests build --watch
```

## Running tests

### Individual spec file(s)

Specify the file(s) directly:

```bash
yarn test -- <path_to-File_1> <path_to_file_2>
```

### Test Group

We use [jest-runner-groups](https://github.com/eugene-manuilov/jest-runner-groups) to group and run suites of specs.

Use the `--group` arg to provide a suite to test `Jest`. For example, to run all specs that are executed on CI for a commit:

```bash
# If within test/e2e directory
yarn test --group=calypso-pr

# If at repo root
yarn workspace wp-e2e-tests test --group=calypso-pr
```

See the [list of groups](tests_ci.md#featuretest-groups).

## Advanced techniques

### Save authentication cookies

Specified accounts will be pre-authenticated prior to the main test suite executions and their cookies saved to be re-used until expiry (typically 3 days).

Specify a list of user accounts found in [Secret Manager](packages/calypso-e2e/src/secrets/secrets-manager.ts), separated by commas:

```bash
export AUTHENTICATE_ACCOUNTS=simpleSitePersonalPlanUser,atomicUser,defaultUser
```

### Use the mobile viewport

By default, tests run against the `desktop` viewport size, approximately 1920x1080. The following viewports are currently supported:

- mobile
- desktop

To launch a spec with mobile viewport:

```bash
yarn test:mobile -- <path_to_spec>
```

To use the manual method, either:

a. set the viewport size to persist in the shell: `export VIEWPORT_NAME=<viewport>`

b. set the viewport size for the command only: `VIEWPORT_NAME=<viewport> yarn jest <test_path>`

### Target a different environment

To target a webapp running in a different environment:

1. determine the base URL to use for the appropriate environment.

   - for local webapp: `http://calypso.localhost:3000`
   - for staging webapp: `https://wordpress.com`
   - for wpcalypso webapp: `https://wpcalypso.wordpress.com`

2. set the `CALYPSO_BASE_URL` environment variable:

   a. set the variable to persist in the shell: `export CALYPSO_BASE_URL=<url>`

   b. set the variable for the command only: `CALYPSO_BASE_URL=<url> yarn jest <test_path>`

<img alt="Local Calypso Webapp" src="https://cldup.com/1WwDmUXWen.png" />
<sup><center>Example: webapp running on localhost.</center></sup>

### Debug mode

Refer to the [Debugging](debugging.md) page for techniques on running a test in debug mode.

#### Notes on TypeScript

Because Jest, the test runner, is already to configured to use Babel as a transpiler before executing scripts, there is no extra pre-build command you need to execute to run TypeScript test scripts. You can simply just have Jest run all the scripts in the `specs` directory, and it will automatically take care of running both `.js` and `.ts` files.

Please note: [Babel does not do type-checking as it runs](https://jestjs.io/docs/getting-started#using-typescript), so if you want to do a specific type-check for your test scripts, you can use the local `tsconfig.json` by running `yarn tsc --project ./tsconfig.json`. We run this as part of the Playwright CI script, so all types will be checked before tests are run on TeamCity.

The local `tsconfig.json` also adds global Jest typings, so you do **not** need to explicitly import `describe` or `it` into your TypeScript testing files.
