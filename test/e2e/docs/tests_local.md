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
        - [Target local webapp](#target-local-webapp)
        - [Debug mode](#debug-mode)
            - [Notes on TypeScript](#notes-on-typescript)

<!-- /TOC -->

## Prerequisites

Prior to running any tests, transpile TypeScript code:

```
yarn workspace @automattic/calypso-e2e build
```

Alternatively, open a separate Terminal window:

```
yarn workspace @automattic/calypso-e2e build --watch
```

## Running tests

### Individual spec file(s)

Specify the file(s) directly:

```
yarn jest <path_to-File_1> <path_to_file_2>
```

### Test Group

We use [jest-runner-groups](https://github.com/eugene-manuilov/jest-runner-groups) to group and run suites of specs.

Use the `--group` arg to provide a suite to test `Jest`. For example, to run all specs that are executed on CI for a commit:

```
yarn jest --group=calypso-pr
```

See the [list of groups](docs/overview.md#what-is-tested).

## Advanced techniques

### Save authentication cookies

Specify accounts to be pre-authenticated by saving authentication cookies and reusing them for each test that is run against those accounts.

**Enable**

```
export AUTHENTICATE_ACCOUNTS=simpleSitePersonalPlanUser,eCommerceUser,defaultUser
```

### Use the mobile viewport

By default, tests run against the `desktop` viewport size, approximately 1920x1080. The following viewports are currently supported:
- mobile
- desktop

```
VIEWPORT_NAME=mobile yarn jest ...
```

### Target local webapp

Local webapp refers to a locally served instance of the `wp-calypso` frontend.

1. override the `calypsoBaseURL` value to point to `http://calypso.localhost:3000` using one of the following methods:

   a. change the `calypsoBaseURL` value in `test/e2e/config/default.json`.

   b. create a new local configuration. See [Test Environment](./test_environment.md#local-configs).

   c. export `calypsoBaseURL` override as part of environment variable: `export NODE_CONFIG="{\"calypsoBaseURL\":\"${'$'}{URL/}\"}"`

2. start the webapp:

```shell
yarn start
```

3. once webapp is started, open `http://calypso.localhost:3000` in your browser.

<img alt="Local Calypso Webapp" src="https://cldup.com/1WwDmUXWen.png" />
<sup><center>Local webapp start page.</center></sup>

The local environment is now ready for testing. When a test is run, it will hit the locally run webapp instead of the WordPress.com staging environment.

### Debug mode

Refer to the [Debugging](debugging.md) page for techniques on running a test in debug mode.

#### Notes on TypeScript

Because Jest, the test runner, is already to configured to use Babel as a transpiler before executing scripts, there is no extra pre-build command you need to execute to run TypeScript test scripts. You can simply just have Jest run all the scripts in the `specs` directory, and it will automatically take care of running both `.js` and `.ts` files.

Please note: [Babel does not do type-checking as it runs](https://jestjs.io/docs/getting-started#using-typescript), so if you want to do a specific type-check for your test scripts, you can use the local `tsconfig.json` by running `yarn tsc --project ./tsconfig.json`. We run this as part of the Playwright CI script, so all types will be checked before tests are run on TeamCity.

The local `tsconfig.json` also adds global Jest typings, so you do **not** need to explicitly import `describe` or `it` into your TypeScript testing files.
