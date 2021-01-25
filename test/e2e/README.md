# WordPress.com End to End Tests

Automated end-to-end acceptance tests for the [wp-calypso](https://github.com/Automattic/wp-calypso) client and WordPress.com in general.

## Table of contents

- [Setup](docs/setup.md)
  - [software environment](https://github.com/worldomonation/wp-calypso/blob/update/e2e-documentation/test/e2e/docs/setup.md#software-environment)
  - [configuration file](https://github.com/worldomonation/wp-calypso/blob/update/e2e-documentation/test/e2e/docs/setup.md#configuration)
  - [environment variables](https://github.com/worldomonation/wp-calypso/blob/update/e2e-documentation/test/e2e/docs/setup.md#environment-variables)
  - [branch naming](https://github.com/worldomonation/wp-calypso/blob/update/e2e-documentation/test/e2e/docs/setup.md#naming-branches)
  - [set up user (optional)]()
- [Running tests](#running-tests)
  - [How to run tests](docs/running-tests.md)
    - [To run the default specs](docs/running-tests.md#to-run-the-default-specs-in-parallel-in-default-browser-sizes---mobile-and-desktop)
    - [To run an individual spec](docs/running-tests.md#to-run-an-individual-spec)
    - [To run with different modes](docs/running-tests.md#to-run-with-different-modes)
    - [To run a specific suite of specs](docs/running-tests.md#to-run-a-specific-suite-of-specs)
    - [To run headlessly](docs/running-tests.md#to-run-headlessly)
  - [How to disable tests](docs/disabling-tests.md)
- [Writing tests](#)
  - [Gutenberg blocks](docs/gutenberg.md)
- [Style Guide](docs/style-guide.md)
- [Other information](#other-information)
  - [NodeJS Version](docs/miscellaneous.md#nodejs-version)
  - [Git Pre-Commit Hook](docs/miscellaneous.md#git-pre-commit-hook)
  - [Launch Logged-In Window](docs/miscellaneous.md#launch-logged-in-window)
  - [User account requirements](docs/miscellaneous.md#user-account-requirements)
  - [List of wrapper repos & friends](docs/miscellaneous.md#list-of-wrapper-repos--friends)
  - [How to fix the `chromedriver not found` error when running e2e tests locally](docs/miscellaneous.md#how-to-fix-the-chromedriver-not-found-error-when-running-e2e-tests-locally)


## Pre-requisites

Make sure you are in the /test/e2e directory

### Install NodeJS

```bash
brew install node #MacOS
```

Or use [nvm](https://github.com/creationix/nvm) (Recommended)

### Install dependencies

```bash
yarn install
```

### Configuration

See the [configuration documentation](docs/config.md) for details on setting configuration values and environment variables.

## Running tests

See the information on [how to run tests](docs/running-tests.md) where you'll find information on the flags and commands used to run the tests.

## Other information

See the [other information](docs/miscellaneous.md) documentation for other details that may be of interest.
