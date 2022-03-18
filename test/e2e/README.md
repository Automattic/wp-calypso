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

- [NodeJS 16.13](https://nodejs.org/en/blog/release/v16.13.2/) or higher
- [TypeScript 4.5](https://www.staging-typescript.org/docs/handbook/release-notes/typescript-4-5.html) or higher
- [Playwright 1.18](https://playwright.dev/docs/release-notes#version-118) or higher
- [yarn 3.1](https://github.com/yarnpkg/berry) or higher

## Quick start

1. install `homebrew`.

```
mkdir homebrew && curl -L https://github.com/Homebrew/brew/tarball/master | tar xz --strip 1 -C homebrew
```

2. install `nvm`.

```
brew install nvm
```

3. install the required nodeJS version.

```
nvm install <node_version>
```

4. use the installed nodeJS version.

```
nvm use <node_version>
```

5. install `yarn`.

```
npm install yarn
```

6. clone this repository

```
git clone https://github.com/Automattic/wp-calypso.git
```

7. navigate to top source directory.

```
cd wp-calypso
```

8. install project dependencies.

```
yarn install
```

9. export required [environment variables](docs/test_environment.md).

```
export NODE_CONFIG_ENV=<name_of_decrypted_config_to_use>
export CONFIG_KEY=<decryption_key_from_a8c_store>
```

10. navigate to e2e directory.

```
cd test/e2e
```

11. [decrypt](docs/test_environment.md) the secrets file.

```
npm run decryptconfig
```

12. transpile the `@automattic/calypso-e2e` package.

```
yarn workspace @automattic/calypso-e2e build
```

13. run test.

```
yarn jest specs/specs-playwright/<spec_name>
```

## Advanced setup

Please refer to the [Advanced Setup](docs/setup.md) page.

## Contribute to E2E tests

Please refer to the [Writing Tests](docs/writing_tests.md) and [Style Guide](docs/style_guide.md) pages.

## Troubleshooting

Please refer to the [Troubleshooting](docs/troubleshooting.md) page.
