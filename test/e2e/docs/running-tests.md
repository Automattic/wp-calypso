# Run tests

## Table of Contents

- [Getting started](#getting-started)
- [To run the default specs](#to-run-the-default-specs-in-parallel-in-default-browser-sizes---mobile-and-desktop)
- [To run an individual spec](#to-run-an-individual-spec)
- [To run with different modes](#to-run-with-different-modes)
- [To run a specific suite of specs](#to-run-a-specific-suite-of-specs)
- [To run headlessly](#to-run-headlessly)

## Getting started

You will need to generate a `config/local-decrypted.json` file by following these [fieldguide steps](https://fieldguide.automattic.com/automated-end-to-end-testing/).

```bash
# in another terminal session/tab:
# install dependencies.
yarn
# start the devlopment server
yarn start

# in the e2e tests tab
cd test/e2e
# Follow these instructions to get the secret (https://fieldguide.automattic.com/automated-end-to-end-testing/
export CONFIG_KEY='<SECRET_FROM_SECRET_STORE>'
export NODE_CONFIG_ENV='decrypted'
yarn run decryptconfig
# a file `config/local-decrypted.json` will be generated and ignored by git. Make sure to set the `NODE_CONFIG_ENV` variable on every bash/zsh session

# now run tests
./run.sh -g
```

## To run the default specs in parallel (in default browser sizes - mobile and desktop)

`./run.sh -g`

- or -

`./node_modules/.bin/magellan`

See the magellan.json file for the default parameters. This is the process used in CI.

**NOTE!** - The magellan mocha plugin will search for all suites tagged with `@parallel`. If you add a new test to this repo, you MUST add that tag to ensure that your test is run via CircleCI.

## To run an individual spec

`./node_modules/.bin/mocha specs/wp-log-in-out-spec.js`

Note: you can also change the spec _temporarily_ the use the `.only` syntax so it is the only spec that runs (making sure this isn't committed)

eg.

`describe.only( 'Logging In and Out:', function() {`

## To run with different modes

All tests should be written to work in three modes: desktop (1440 wide), tablet (1024 wide) and mobile (375 wide).

You can run tests in different modes by setting an environment variable `BROWSERSIZE` to either `desktop`, `tablet` or `mobile`.

Eg:

`env BROWSERSIZE=tablet ./node_modules/.bin/mocha specs`

Or you can use the -s option on the run.sh script:

`./run.sh -g -s mobile`
`./run.sh -g -s desktop,tablet`

## To run a specific suite of specs

The `run.sh` script takes the following parameters, which can be combined to execute a variety of suites

```text
-a [workers]  - Number of parallel workers in Magellan (defaults to 3)
-R  - Use custom Slack/Spec/XUnit reporter, otherwise just use Spec reporter
-p  - Execute the tests in parallel via CircleCI envvars (implies -g -s mobile,desktop)
-S [commitHash]   - Run tests against given commit via https://calypso.live
-B [branch]  - Run Jetpack tests on given Jetpack branch via https://jurassic.ninja
-s  - Screensizes in a comma-separated list (defaults to mobile,desktop)
-g  - Execute general tests in the specs/ directory
-j  - Execute Jetpack tests in the specs-jetpack-calypso/ directory (desktop and mobile)
-W  - Execute WooCommerce tests in the specs-woocommerce/ directory (desktop and mobile)
-C  - Execute tests tagged with @canary
-J  - Execute Jetpack connect tests tagged with @canary
-H [host]  - Specify an alternate host for Jetpack tests
-w - Only execute signup tests on Windows/IE11, not compatible with -g flag
-z  - Only execute canary tests on Windows/IE11, not compatible with -g flag
-y  - Only execute canary tests on Safari 10 on Mac, not compatible with -g flag
-l [config]  - Execute the tests via Sauce Labs with the given configuration
-c  - Exit with status code 0 regardless of test results
-m [browsers]  - Execute the multi-browser visual-diff tests with the given list of browsers via grunt.  Specify browsers in comma-separated list or 'all'
-i  - Execute i18n NUX screenshot tests, not compatible with -g flag
-I  - Execute tests in specs-i18n/ directory
-x  - Execute the tests from the context of xvfb-run
-u [baseUrl]  - Override the calypsoBaseURL config
-h  - This help listing
```

## To run headlessly

By default the tests start their own Selenium server in the background, which in turn launches a Chrome browser on your desktop where you can watch the tests execute. This can be a bit of a headache if you're trying to do other work while the tests are running, as the browser may occasionally steal focus back (although that's mostly been resolved).

The easiest way to run "headlessly" without a visible window is to add the `-x` flag when running `run.sh` or using the `HEADLESS=1` environment variable which will run Chrome with the --headless flag.

1. `./run.sh -g -x`

or

1. `export HEADLESS=1`
1. `./node_modules/.bin/mocha specs/wp-log-in-out-spec.js`
