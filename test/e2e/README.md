# WordPress.com End to End Tests

Automated end-to-end acceptance tests for the [wp-calypso](https://github.com/Automattic/wp-calypso) client and WordPress.com.

![Image from https://www.vecteezy.com/free-vector/web](docs/resources/free-flat-design-linear-vector-icon-set.jpg)

## Resources

- [Overview](docs/overview.md)
- [Setup](docs/setup.md)
- [Test Environment](docs/test_environment.md)
- [Running tests on your machine](docs/tests_local.md)
- [Running tests on CI](docs/tests_ci.md)
- [Writing tests](docs/writing_tests.md)
- [Library objects](docs/library_objects.md)
- [Style Guide](docs/style_guide.md)
- [Debugging](docs/debugging.md)
- [Troubleshooting](docs/troubleshooting.md)

## Prerequisites

Calypso E2E requires the following:

- [NodeJS 16.11](https://nodejs.org/en/blog/release/v16.11.0/) or higher
- [TypeScript 4.4](https://www.staging-typescript.org/docs/handbook/release-notes/typescript-4-4.html) or higher
- [Playwright 1.14](https://playwright.dev/docs/release-notes#version-114) or higher
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

9. naviagate to e2e directory.

```
cd test/e2e
```

10. transpile the `@automattic/calypso-e2e` package.

```
yarn workspace @automattic/calypso-e2e build
```

11. run test.

```
yarn jest specs/specs-playwright/<spec_name>
```

## Advanced setup

Please refer to the [Advanced Setup](docs/setup.md) page.

## Contribute to E2E tests

Please refer to the [] pages.

## Troubleshooting

Please refer to the [Troubleshooting](docs/troubleshooting.md) page.
