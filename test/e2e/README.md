# WordPress.com End to End Tests

Automated end-to-end acceptance tests for the [wp-calypso](https://github.com/Automattic/wp-calypso) client and WordPress.com.

Tests run on Playwright Test. The [documentation index](docs/overview.md) lists every page.

## Prerequisites

Calypso E2E requires the following:

- [NodeJS](https://nodejs.org/) at the version in the root package.json "engines" field. (Typically latest LTS.)
- The [yarn](https://github.com/yarnpkg/berry) version available in the repo.
- Dependencies such as [Typescript](https://typescript.org) and [Playwright](https://playwright.dev) are installed via yarn, and you can find information about the versions we use in ./package.json.

## Quick start

Follow [Setup](docs/setup.md), then [Running tests on your machine](docs/tests_local.md).

## Contribute to E2E tests

Please refer to the [Writing Tests](docs/writing_tests.md) and [Style Guide](docs/style_guide.md) pages.

## Troubleshooting

Please refer to the [Troubleshooting](docs/troubleshooting.md) page.
