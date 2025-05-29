<img alt="Abstract concept" src="https://cldup.com/gBB3Y0iOWl.jpg" />

# WordPress.com End to End Tests

Automated end-to-end acceptance tests for the [wp-calypso](https://github.com/Automattic/wp-calypso) client and WordPress.com.

## Resources

- [Overview](docs/overview.md)
- [Setup](docs/setup.md)
- [Test Environment](docs/test_environment.md)
- [Running tests on your machine](docs/tests_local.md)
- [Running tests on CI](docs/tests_ci.md)
- [Writing tests](docs/writing_tests.md)
- [Library objects](docs/library_objects.md)
- [Style Guide](docs/style_guide.md)
- [Patterns, Tricks, and Gotchas](docs/patterns_tricks_gotchas.md)
- [Debugging](docs/debugging.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Environment Variable](docs/environment_variables.md)

## Prerequisites

Calypso E2E requires the following:

- [NodeJS](https://nodejs.org/) at the version in the root package.json "engines" field. (Typically latest LTS.)
- The [yarn](https://github.com/yarnpkg/berry) version available in the repo.
- Dependencies such as [Typescript](https://typescript.org) and [Playwright](https://playwright.dev) are installed via yarn, and you can find information about the versions we use in ./package.json.

## Quick start

1. install `homebrew`.

```bash
mkdir homebrew && curl -L https://github.com/Homebrew/brew/tarball/master | tar xz --strip 1 -C homebrew
```

2. install `nvm`.

```bash
brew install nvm
```

3. install the required nodeJS version.

```bash
nvm install <node_version>
```

4. use the installed nodeJS version.

```bash
nvm use <node_version>
```

5. enable `yarn` package manager.

```bash
corepack enable
```

6. clone this repository

```bash
git clone https://github.com/Automattic/wp-calypso.git
```

7. navigate to the cloned directory.

```bash
cd wp-calypso
```

_From this point on, all commands are executed within the `wp-calypso` root directory._

8. install project dependencies.

```bash
yarn install
```

9. obtain the secrets decryption key.

```bash
export E2E_SECRETS_KEY='Calypso E2E Config decode key from the Automattic secret store>'
```

10. [decrypt](docs/test_environment.md) the secrets file.

```bash
yarn workspace wp-e2e-tests decrypt-secrets
```

11. transpile the packages.

```bash
yarn workspace wp-e2e-tests build --watch
```

12. run test.

```bash
yarn workspace wp-e2e-tests test -- <test_path>
```

To run on calypso.localhost, don't forget the environment variable:

```bash
CALYPSO_BASE_URL=http://calypso.localhost:3000 yarn workspace wp-e2e-tests test -- <test_path>
```

## Advanced setup

Please refer to the [Advanced Setup](docs/setup.md) page.

## Contribute to E2E tests

Please refer to the [Writing Tests](docs/writing_tests.md) and [Style Guide](docs/style_guide.md) pages.

## Troubleshooting

Please refer to the [Troubleshooting](docs/troubleshooting.md) page.
