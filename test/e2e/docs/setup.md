# Setup

This document will cover the environment setup process to run the `wp-calypso` e2e tests.

## Table of contents

<!-- TOC -->

- [Setup](#setup)
  - [Table of contents](#table-of-contents)
  - [Software Environment](#software-environment)
    - [Required software](#required-software)
    - [Steps](#steps)
      - [Intel-based macOS](#intel-based-macos)
      - [Apple Silicon-based macOS](#apple-silicon-based-macos)
  - [Configuration](#configuration)
    - [Overview](#overview)
    - [In-repo configuration](#in-repo-configuration)
    - [Custom configurations](#custom-configurations)
  - [Environment Variables](#environment-variables)
  - [Naming Branches](#naming-branches)

<!-- /TOC -->

## Software Environment

The following instructions are geared towards macOS users.

### Required software

- [Node.js](https://nodejs.org/en/download/package-manager/#macos)
- [yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)
- [npm](https://www.npmjs.com/get-npm)
- (optional) [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Node.js can also be installed using [brew](https://nodejs.dev/learn/how-to-install-nodejs).

It is strongly recommended to use `nvm` to manage multiple Node.js versions.

### Steps

#### Intel-based macOS

Once the prerequisite software are installed, simply execute the following:

1. navigate to the test directory:

```
cd <repo_root>/tests/e2e
```

2. install dependencies:

```
yarn install
```

#### Apple Silicon-based macOS

It appears that key dependencies do not support ARM64 yet, notably `mocha`.
This means we must install and run a parallel Intel-based set of dependencies.

1. install i386 Homebrew:

```
arch -x86_64 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
```

2. install `nvm` using i386 Homebrew:

```
arch -x86_64 /usr/local/bin/brew install nvm
```

3. using `nvm`, install the current version of node used in `wp-calypso`:

```
nvm install <node_version>
```

4. use the version of node installed:

```
nvm use <node_version>
```

5. update `npm` version:

```
arch -x86_64 npm install -g npm@latest
```

6. install `yarn`:

```
arch -x86_64 npm install yarn
```

7. install all dependencies from repo root:

```
arch -x86_64 yarn install --frozen-lockfile
```

8. verify that mocha runs in `test/e2e/` directory:

```
./node_modules/.bin/mocha
```

At any point, run `arch` to verify whether shell is running with Rosetta 2 emulation.

## Configuration

### Overview

The tests use the node [config](https://www.npmjs.com/package/config) library to specify config values for the tests.

Under the [tests/e2e/config](test/e2e/config) directory are JSON files for predefined environments:

- `default.json` is for all environments
- `development.json` is for local
- `test.json` for CI

It is also possible to use custom configuration files that are not part of the repo. See next section.

### In-repo configuration

There is a 'standard' configuration already in the GitHub repo under `test/e2e/config/`.

This configuration must be decrypted prior to running any e2e tests. To decrypt, please follow the steps outlined in the Field Guide.

### Custom configurations

Custom config files should be added under `test/e2e/config/` and should follow the naming scheme:

```
local-<env>.json
```

`.gitignore` ensures that custom configurations prefixed with `local-` will not be commited to the repository. However, **please ensure username/passwords and other configuration values are not committed by accident!**

Values found in the local configuration file will override ones found in `default.json`.

This is useful to test various configurations in the local environment.
e.g. testing on local Calypso instance, instead of production by setting the `calypsoBaseURL` property to `http://calypso.localhost:3000`.

For the full list of possible configuration values, please see the following page: [config values](docs/config_values.md).

## Environment Variables

Environment Variables are values that are defined at the system level to serve as configuration for programs.

For e2e tests, the following are required environment variables without which e2e tests will not run locally:

```
export CONFIG_KEY='<config_key_from_a8c_store>'
export NODE_CONFIG='<config_name_to_use>'
```

Additionally, see the list of other environment variables [here](environment_variables.md).

## Naming Branches

Please refer to the Automattic [branch naming scheme](https://github.com/Automattic/wp-calypso/blob/HEAD/docs/git-workflow.md#branch-naming-scheme).
