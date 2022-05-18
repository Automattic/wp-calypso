## Server side tests

This test configuration contains unit tests that verify code located in `server` top level folder.

It supports automatic test discovery. We only need to put a test file into a `test` subfolder, next to the files we want to test.

Tests can be run in 3 different modes:

```bash
> # run the entire server suite
> yarn run test-server
> # run a configuration customized to work with continuous integration
> yarn run test-server:ci
> # run tests in watch mode, by default it executes tests for the modified files only
> yarn run test-client:watch
```

Those tests are executed on every push on continuous integration (we use TeamCity). This is why all individual tests need to be blazing fast. Please note that network connection is disabled for this configuration.

_Check also how to write [unit tests](unit-tests.md)._

## Client side tests

This test configuration contains unit and component tests that verify code located in `client` top level folder.

It supports automatic test discovery. We only need to put a test file into a `test` subfolder, next to the files we want to test.

Tests can be run in 3 different modes:

```bash
> # run the entire client suite
> yarn run test-client
> # run a configuration customized to work with continuous integration
> yarn run test-server:ci
> # run tests in watch mode, by default it executes tests for the modified files only
> yarn run test-client:watch
```

They are executed on every push on continuous integration (TeamCity). This is why all individual tests need to be blazing fast. Please note that network connection is disabled for this configuration.

Often your changes will affect other parts of the application, so it's a good idea to run all the unit tests locally before checking in.

_Check also how to write [unit tests](unit-tests.md) and [component tests](component-tests.md)._

## Integration tests

This test configuration contains integration tests that verify code located in `bin`, `client`, `server` and `test` top level folders. They should test how a group of components or a larger part of business logic works together.

It supports automatic test discovery. We only need to put a test file into a `integration` subfolder, next to the files we want to test.

Tests can be run in 2 different modes:

```bash
> # run the entire integration suite
> yarn run test-integration
> # run a configuration customized to work with continuous integration
> yarn run test-integration:ci
```

They run daily on continuous integration (TeamCity), because they can use network connection or memory intensive processing and therefore can have longer runtime.

## End-to-end tests

End-to-end tests (`e2e` for short) describes the automated functional tests that simulate user interaction with the system under test.

A well-maintained suite of e2e tests, in conjunction with CI (continuous integration) pipelines will ensure that regressions to key user flows are caught as early as possible in the development cycle.

All e2e tests live in the [test/e2e](https://github.com/Automattic/wp-calypso/blob/HEAD/test/e2e) directory. For details on how to write, run, and debug them, see the [e2e documentation](../../test/e2e/README.md).
