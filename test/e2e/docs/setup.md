# Setup

This document will cover the environment setup process to run the `wp-calypso` e2e tests.

## Table of contents

<!-- TOC -->

- [Setup](#setup)
  - [Table of contents](#table-of-contents)
  - [Software Environment](#software-environment)
    - [Required software](#required-software)
  - [Setup steps macOS 10.15 and 11.0](#setup-steps-macos-1015-and-110)
    - [Intel architecture](#intel-architecture)
    - [Apple Silicon architecture](#apple-silicon-architecture)
  - [Environment Variables](#environment-variables)
  - [Configuration File](#configuration-file)
    - [Overview](#overview)
    - [Quick start](#quick-start)
    - [Custom configuration](#custom-configuration)
  - [Credentials File](#credentials-file)

<!-- /TOC -->

## Software Environment

### Required software

- [Node.js](https://nodejs.org/en/download/package-manager/#macos)
- [yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)
- [npm](https://www.npmjs.com/get-npm)
- (optional) [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Node.js can also be installed using [brew](https://nodejs.dev/learn/how-to-install-nodejs).

It is strongly recommended to use `nvm` to manage multiple Node.js versions.

## Setup steps (macOS 10.15 and 11.0)

### Intel architecture

Install the list of software listed under [Required software](#required-software).

Up-to-date instructions on installing individual pieces of required software can be found on their respective sites.

Once installed, open a Terminal instance and execute the following:

1. navigate to the test directory:

```
cd <repo_root>/tests/e2e
```

2. install dependencies:

```
yarn install
```

### Apple Silicon architecture

It appears that as of 2021-01, key NodeJS modules do not support ARM64 yet, notably `mocha`.
As with any cutting-edge software, this is subject to change in the coming weeks and months.

To work around compatibility issues, we will install Intel architecture binaries.

1. install i386 Homebrew:

```
arch -x86_64 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
```

2. install `nvm` using i386 Homebrew:

```
arch -x86_64 /usr/local/bin/brew install nvm
```

**This is critical! If nvm is installed using ARM64 Homebrew, installed Node versions will also be the ARM64 variant and nothing will work!**

3. using `nvm`, install the current version of NodeJS used in `wp-calypso`:

```
nvm install <node_version>
```

4. instruct `nvm` to use the version of NodeJS installed in previous step:

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

8. verify that mocha can run under `test/e2e/` directory:

```
./test/e2e/node_modules/.bin/mocha
```

At any point, run `arch` to verify whether shell is running with Rosetta 2 emulation.

## Environment Variables

Environment Variables are values that are defined at the system level to serve as configuration for programs.

For e2e tests, the following are required environment variables without which e2e tests will not run:

```
export NODE_CONFIG_ENV=<name_of_decrypted_config_to_use>
export CONFIG_KEY=<decryption_key_from_a8c_store>
```

Each of these variables serve a specific purpose and will be covered in the next sections.

Additionally, see the list of other environment variables [here](environment_variables.md).

## Configuration File

### Overview

The tests use the node [config](https://www.npmjs.com/package/config) library to automatically load the appropriate configuration file depending on the execution environment.

Under the `tests/e2e/config` directory are JSON files for predefined environments:

- `default.json` contains common values that should persist across environments.
- `development.json` is for local.
- `test.json` for CI.

### Quick start

The default configuration will suffice for most purposes. To use the default configuration, nothing needs to be changed.

### Custom configuration

> :warning: **ensure username/passwords and other configuration values are not committed by accident!**

Custom config files should be added under `test/e2e/config/` and should follow the naming scheme:

```
local-<whatever>.json
```

The `local-` prefix ensures that custom configurations will not be commited to the repository.

Values found in the local configuration file will override ones found in `default.json`.

For the full list of possible configuration values, refer to the following page: [config values](config_values.md).

## Credentials File

In addition to the configuration files, there is an encrypted file that holds test account credentials. This must be decrypted prior to use. For instructions on how to decrypt this file, please refer to the Field Guide page.

**Trialmatticians**: please contact a team member in your Slack chat for the decryption key.
