## FAQ

### What tools and libraries are used?

We use [Vitest](https://vitest.dev/) to run the unit tests in the Calypso repository. Use its [test API](https://vitest.dev/api/) together with its [expect matchers](https://vitest.dev/api/expect.html) and [mock functions](https://vitest.dev/api/mock.html), imported from `vitest`.

Historically we have been using [Mocha](https://mochajs.org/) with [Chai assertions](http://chaijs.com/) and [Sinon mocks](http://sinonjs.org/). We no longer support Chai and Sinon, so Vitest equivalents must be used whenever new tests are added.

End-to-end tests use [Playwright Test](https://playwright.dev/docs/intro) to drive the browser and write the testing scripts.

### How to run all tests?

Executing `yarn test` from the root folder will run all test suites.
Behind the scenes we maintain a test configuration for each part of the repository (for example `client` and `server`), because each has its own requirements.

### How to run a smaller subset of test files?

We have a yarn run script for each tests type: `yarn run test-client`, `yarn run test-server`, `yarn run test-packages`.
You can pass a filename, folder name or matching pattern to these scripts to narrow down number of executed tests.

Example for client:

```bash
> # run test suite for a specific test file
> yarn run test-client client/state/selectors/test/get-media.js
> # run test suites for all files in a specific folder
> yarn run test-server server/config
> # run test suites for all files matching pattern
> yarn run test-client client/*/domains
```

### How to run specified suite or test-case

The exclusivity feature allows you to run only the specified suite or test-case by appending `.only()` to the function.
It works with `describe` and `it` functions. More details in [Vitest documentation](https://vitest.dev/api/#test-only).

Using `only` is a little bit dangerous, as you may end up committing the `only`, which would cause the test suite to only run your test on the build server. So be sure to look for stray only calls when reviewing a test. We have ESLint rules that should catch them for you.

Example:

```js
describe.only( 'just run this suite', function () {
	test( 'should run these tests', function () {
		// your test
	} );

	test.only( 'should only run this one test', function () {
		// just run this test if the only is present
	} );
} );
```
