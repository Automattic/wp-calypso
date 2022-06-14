<div style="width: 45%; float:left" align="left"><a href="./setup.md"><-- Setup</a> </div>
<div style="width: 5%; float:left" align="center"><a href="./../README.md">Top</a></div>
<div style="width: 45%; float:right"align="right"><a href="./tests_local.md">Running tests on your machine --></a> </div>

<br><br>

# Test Environment

<!-- TOC -->

- [Test Environment](#test-environment)
  - [Environment Variables](#environment-variables)
  - [Secrets File](#secrets-file)
    - [Decrypting the Secrets](#decrypting-the-secrets)
    - [Using the Secrets](#using-the-secrets)

<!-- /TOC -->

The environment configuration for these tests comes from two different sources: environment variables and an encrypted secrets file.

## Environment Variables

Most non-sensitive runtime configuration comes from environment variables. All of our environment variables have fallback defaults.

For example:

```
VIEWPORT_NAME=mobile yarn jest specs/<etc>
```

The list of supported environment variables are found in [`env-variables.ts`](../../../packages/calypso-e2e//src/env-variables.ts). This file also adds static type checking and is the most up-to-date resource. The [Envionment Variables](./environment_variables.md) page may be out of date but will contain explanations of what the individual variables mean.

To use:

```typescript
import { envVariables } from '@automattic/calypso-e2e';

// Later

if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
	// Do x ;
}
```

## Secrets File

### Decrypting the Secrets

Within `@automattic/calypso-e2e/src/secrets` is an encrypted file that holds various sensitive secrets, such as API keys and test account information. This must be decrypted prior to use.

To decrypt the secrets, set the environment variable `E2E_SECRETS_KEY` to the secret from the Automattic secret store.

```
export E2E_SECRETS_KEY='<secret key from the secret store>'
```

Then, either here or in the `@automattic/calypso-e2e` workspace, run `yarn decrypt-secrets`.

The decrypted version of these secrets must **NEVER be committed.** There are .gitignore rules to protect against this, but be vigilant nonetheless!

**Automatticians**: please refer to the Field Guide page for instructions on decrypting/encrypting this file.

**Trialmatticians**: please contact a team member in your Slack chat for the decryption key.

### Using the Secrets

The secrets are read and validated at runtime. They are accessed through the [`SecretsManager`](../../../packages/calypso-e2e/src/secrets/secrets-manager.ts) static class, which presents the secrets with static typings.

To use:

```typescript
import { SecretsManager } from '@automattic/calypso-e2e';

// Later

const x = SecretsManager.secrets.keyName;
```
