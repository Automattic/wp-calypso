# Overview

End-to-end tests (`e2e` for short) are the automated functional tests that drive a browser
through the system under test the way a person would.

A well-maintained suite of e2e tests, in conjunction with CI pipelines, catches regressions
to key user flows as early as possible in the development cycle.

Every spec here runs on [Playwright Test](https://playwright.dev/docs/intro).

## What is tested?

- Calypso features.
- interaction between Calypso and the Gutenberg editor.
- internationalization and localization.
- Gutenberg blocks added by WordPress.com.

## Documentation pages

Getting set up:

- [Setup](./setup.md)
- [Test environment](./test_environment.md)
- [Environment variables](./environment_variables.md)

Running specs:

- [Running tests on your machine](./tests_local.md)
- [Running tests on CI](./tests_ci.md)
- [Debugging](./debugging.md)
- [Troubleshooting](./troubleshooting.md)

Writing specs:

- [Writing tests](./writing_tests.md)
- [Style guide](./style_guide.md)
- [Library objects](./library_objects.md)
- [Custom fixtures](./custom_fixtures.md)
- [Creating reliable tests](./creating_reliable_tests.md)
- [Patterns, tricks and gotchas](./patterns_tricks_gotchas.md)
- [Block smoke testing](./block_smoke_testing.md)

Reference:

- [Flowcharts](./flowcharts.md)
- [AI agents](./ai_agents.md)
