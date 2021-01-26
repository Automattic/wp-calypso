# Setup

This document will cover the environment setup process to run the `wp-calypso` e2e tests.

## Table of contents
<!-- TOC -->

- [Setup](#setup)
    - [Table of contents](#table-of-contents)
    - [Software Environment](#software-environment)
        - [Required software](#required-software)
        - [Steps](#steps)
    - [Configuration](#configuration)
        - [Overview](#overview)
        - [Use in-repo configuration](#use-in-repo-configuration)
        - [Custom configurations](#custom-configurations)
    - [Environment Variables](#environment-variables)
    - [Naming Branches](#naming-branches)

<!-- /TOC -->

## Software Environment

The following instructions are geared towards macOS users.

### Required software

* [Node.js](https://nodejs.org/en/download/package-manager/#macos)
* [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) (optional)
* [yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)

Node.js can also be installed using [brew](https://nodejs.dev/learn/how-to-install-nodejs).

It is strongly recommended to use `nvm` to manage multiple Node.js versions.

### Steps

1. Navigate to the test directory:

```
cd <repo_root>/tests/e2e
```

2. Install dependencies:

```
yarn install
```

**Alternate Steps**

For those that have freshly pulled the repository and have not installed any dependencies previously (eg. trials engineers) the steps above could result in `git pre-commit hooks` errors that prevent commits.

Follow the instructions [here](docs/troubleshooting_debugging.md#git-pre-commit-hookhusky).

## Configuration

### Overview

The tests use the node [config](https://www.npmjs.com/package/config) library to specify config values for the tests.

Under the [tests/e2e/config](test/e2e/config) directory are JSON files for predefined environments:

* `default.json` is for all environments
* `development.json` is for local
* `test.json` for CI

It is also possible to use custom configuration files that are not part of the repo. See next section.

### Use in-repo configuration

There is a 'standard' configuration already in the GitHub repo under `test/e2e/config/`.

This configuation must be decrypted prior to running any e2e tests. To decrypt, please follow the steps outlined in the Field Guide.

### Custom configurations

Custom config files should be added under [tests/e2e/config](test/e2e/config) and should follow the naming scheme: 

```
local-<env>.json
```

`.gitignore` ensures that custom configurations prefixed with `local-` will not be commited to the repository. However, **please ensure username/passwords and other configuration values are not committed by accident!**

Values found in the local configuration file will override ones found in `default.json`. 

This is useful to test various configurations in the local enviroment.
e.g. testing on local Calypso instance, instead of production by setting the `calypsoBaseURL` property to `http://calypso.localhost:3000`.

For the full list of possible configuration values, please see the following page: [config values](docs/config_values.md).

## Environment Variables

Environment Variables are values that are defined at the system level to serve as configuration for programs.

For e2e tests, the following are required environment variables without which e2e tests will not run locally:

```
export CONFIG_KEY='<config_key_from_a8c_store>'
export NODE_CONFIG='<config_name_to_use>'
```

Additionally, see the list of other environment variables [here](docs/environment_variables.md).

## Naming Branches

Please refer to the Automattic [branch naming scheme](https://github.com/Automattic/wp-calypso/blob/HEAD/docs/git-workflow.md#branch-naming-scheme).