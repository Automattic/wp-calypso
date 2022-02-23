<div style="width: 45%; float:left" align="left"><a href="./setup.md"><-- Setup</a> </div>
<div style="width: 5%; float:left" align="center"><a href="./../README.md">Top</a></div>
<div style="width: 45%; float:right"align="right"><a href="./tests_local.md">Running tests on your machine --></a> </div>

<br><br>

# Test Environment

<!-- TOC -->

- [Test Environment](#test-environment)
  - [Environment Variables](#environment-variables)
  - [Secrets file](#secrets-file)
  - [Non-secret configuration file](#non-secret-configuration-file)
    - [Default config](#default-config)
    - [Local configs](#local-configs)

<!-- /TOC -->

## Environment Variables

Required:

```
export NODE_CONFIG_ENV=<name_of_decrypted_config_to_use>
export CONFIG_KEY=<decryption_key_from_a8c_store>
```

Optional:

```
export AUTHENTICATE_ACCOUNTS=p2User,i18nUser
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

### Local configs

> :warning: **ensure username/passwords and other secret values are not committed by accident!**

Local config files are optional and should be added under `test/e2e/config/` using the following naming scheme:

```
test/e2e/config/local-<whatever_you_want>.json
```

The `local-` prefix ensure these custom configurations [are ignored by git](https://github.com/automattic/wp-calypso/blob/trunk/test/e2e/.gitignore#l12).

Using local configs, values found in the default configs can be overridden without modifying (and thus accidentally committing) the default config files.

Example

In `test/e2e/config/default.json`:

```json
{
	"calypsoBaseURL": "https://wordpress.com"
}
```

In `test/e2e/config/local-custom-base-url.json`:

```json
{
	"calypsoBaseURL": "https://some-custom-base-url.com"
}
```

For the full list of possible configuration values, refer to the following page: [config values](config_values.md) or the files under `test/e2e/config`.
