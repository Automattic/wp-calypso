[<-- Test Environment](./test_environment.md) | [Top](./../README.md) | [Running tests on CI -->](./tests_ci.md)

# Running tests on your machine

<!-- TOC -->

- [Running tests on your machine](#running-tests-on-your-machine)
  - [Prerequisites](#prerequisites)
  - [Running tests](#running-tests)
    - [Individual spec files](#individual-spec-files)
    - [Test tag](#test-tag)
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
yarn test:pw -- <path_to_file_1> <path_to_file_2>
```

### Test tag

Specs are grouped by the tags declared on their `test.describe` block. Use Playwright's
`--grep` to run a suite. For example, to run all specs that are executed on CI for a commit:

```bash
# If within test/e2e directory
yarn test:pw:calypso-pr

# If at repo root
yarn workspace wp-e2e-tests test:pw:calypso-pr
```

See the [list of tags](tests_ci.md#featuretest-tags).

## Advanced techniques

### Save authentication cookies

The `prime-logins` setup project logs in as a list of accounts before the main test suite runs and saves their cookies to be re-used until expiry (typically 3 days). Every project except `authentication` waits for it, so the specs read those cookies instead of logging in themselves.

By default it primes the list in [`setup/prime-logins.setup.ts`](../setup/prime-logins.setup.ts). To prime a different set, name the accounts found in [Secret Manager](../../../packages/calypso-e2e/src/secrets/secrets-manager.ts), separated by commas:

```bash
export AUTHENTICATE_ACCOUNTS=simpleSitePersonalPlanUser,atomicUser,defaultUser
```

Either list is primed alongside the account the current environment variables select, the one behind the `accountGivenByEnvironment` fixture.

Set it to an empty value to skip priming altogether; whatever needs an account then logs in when it first runs.

### Use the mobile viewport

By default, tests run against the `desktop` viewport size, approximately 1920x1080. The following viewports are currently supported:

- mobile
- desktop

To launch a spec with mobile viewport:

```bash
yarn test:pw:mobile <path_to_spec>
```

To use the manual method, either:

a. set the viewport size to persist in the shell: `export VIEWPORT_NAME=<viewport>`

b. set the viewport size for the command only: `VIEWPORT_NAME=<viewport> yarn test:pw -- <test_path>`

### Target a different environment

By default these tests target <http://calypso.localhost:3000>. To target a webapp running in a different environment:

1. determine the base URL to use for the appropriate environment.

   - for staging/production webapp: `https://wordpress.com`
   - for wpcalypso webapp: `https://wpcalypso.wordpress.com`
   - for horizon webapp: `https://horizon.wordpress.com`

2. set the `CALYPSO_BASE_URL` environment variable:

   a. set the variable to persist in the shell: `export CALYPSO_BASE_URL=<url>`

   b. set the variable for the command only: `CALYPSO_BASE_URL=<url> yarn test:pw -- <test_path>`

<img alt="Local Calypso Webapp" src="https://cldup.com/1WwDmUXWen.png" />
<sup><center>Example: webapp running on localhost.</center></sup>

### Debug mode

Refer to the [Debugging](debugging.md) page for techniques on running a test in debug mode.

#### Notes on TypeScript

Playwright Test transpiles TypeScript specs itself, so there is no extra pre-build command needed to run them.

It does not type-check as it runs. To type-check the specs, use the local `tsconfig.json`: `yarn tsc --project ./tsconfig.json`.
