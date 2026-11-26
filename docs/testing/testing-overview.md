## Server side tests

This test configuration contains unit tests that verify code located in the `client/server` folder.

It supports automatic test discovery. We only need to put a test file into a `test` subfolder, next to the files we want to test.

Tests can be run in 2 different modes:

```bash
> # run the entire server suite
> yarn run test-server
> # run tests in watch mode, by default it executes tests for the modified files only
> yarn run test-server:watch
```

Those tests are executed on every push on continuous integration (we use TeamCity). This is why all individual tests need to be blazing fast. Please note that network connection is disabled for this configuration.

The server tests run on Vitest, as do the `build-tools` tests (`yarn run test-build-tools`). Arguments are Vitest's, for example a path to run a subset of the tests.

_Check also how to write [unit tests](unit-tests.md)._

## Client side tests

This test configuration contains unit and component tests that verify code located in `client` top level folder.

It supports automatic test discovery. We only need to put a test file into a `test` subfolder, next to the files we want to test.

Tests can be run in 2 different modes:

```bash
> # run the entire client suite
> yarn run test-client
> # run tests in watch mode, by default it executes tests for the modified files only
> yarn run test-client:watch
```

They are executed on every push on continuous integration (TeamCity). This is why all individual tests need to be blazing fast. Please note that network connection is disabled for this configuration.

The client tests run on Vitest. Arguments are Vitest's, for example a path to run a subset of the tests. Import `vi` from `vitest` instead of using the `jest` global.

Often your changes will affect other parts of the application, so it's a good idea to run all the unit tests locally before checking in.

_Check also how to write [unit tests](unit-tests.md) and [component tests](component-tests.md)._

## Package tests

This test configuration contains unit tests for the packages in the `packages` top level folder. They run on Vitest: each package with tests has a `vitest.config.*`. Test files go in a `test` subfolder, as in `client`.

```bash
> # run every package's tests; arguments are Vitest's, for example a path
> yarn run test-packages [ path ]
> # watch the packages' tests
> yarn run test-packages:watch [ path ]
> # run one package's tests, if it has a `test` script
> yarn workspace <package name> test
```

## End-to-end tests

End-to-end tests (`e2e` for short) describes the automated functional tests that simulate user interaction with the system under test.

A well-maintained suite of e2e tests, in conjunction with CI (continuous integration) pipelines will ensure that regressions to key user flows are caught as early as possible in the development cycle.

All e2e tests live in the [test/e2e](https://github.com/Automattic/wp-calypso/blob/HEAD/test/e2e) directory. For details on how to write, run, and debug them, see the [e2e documentation](../../test/e2e/README.md).
