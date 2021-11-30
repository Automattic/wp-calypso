# Test Environment

<!-- TOC -->

- [Test Environment](#test-environment)
    - [Environment Variables](#environment-variables)
    - [Secrets file](#secrets-file)
    - [Non-secret configuration file](#non-secret-configuration-file)
        - [Default config](#default-config)
        - [Custom configs](#custom-configs)

<!-- /TOC -->

## Environment Variables

Required:

```
export NODE_CONFIG_ENV=<name_of_decrypted_config_to_use>
export CONFIG_KEY=<decryption_key_from_a8c_store>
```

Optional:

```
export SAVE_AUTH_COOKIES=<true/false>
```

For a list of supported environment variables, please refer to [this page](environment_variables.md).

## Secrets file

Within `test/e2e/config` is an encrypted file that holds test account credentials. This must be decrypted prior to use.

**Automatticians**: please refer to the Field Guide page for instructions on decrypting this file.

**Trialmatticians**: please contact a team member in your Slack chat for the decryption key.

## Non-secret configuration file

The node [config](https://www.npmjs.com/package/config) library is used to automatically load the appropriate configuration file depending on the execution environment.

Under the `tests/e2e/config` directory are JSON files for predefined environments:

- `default.json` contains common values that should persist across environments.
- `development.json` is for local.
- `test.json` for CI.

### Default config

The default configuration will suffice for most purposes. To use the default configuration, nothing needs to be changed.

### Custom configs

> :warning: **ensure username/passwords and other configuration values are not committed by accident!**

Custom config files should be added under `test/e2e/config/` and should follow the naming scheme:

```
local-<whatever>.json
```

The `local-` prefix ensures that custom configurations [will be ignored][https://github.com/automattic/wp-calypso/blob/trunk/test/e2e/.gitignore#l12].

Values found in the local configuration file will override ones found in `default.json`.

For the full list of possible configuration values, refer to the following page: [config values](config_values.md).
