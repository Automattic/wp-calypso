## FAQ

### What tools and libraries are used?

We use [Jest](https://facebook.github.io/jest/) testing tool to execute all test configurations located in Calypso repository. It's highly recommended to use Jest's very flexible [API](https://facebook.github.io/jest/docs/en/api.html) together with [expect matchers](https://facebook.github.io/jest/docs/en/expect.html) and [mock functions](https://facebook.github.io/jest/docs/en/mock-function-api.html).

Historically we have been using [Mocha](https://mochajs.org/) with [Chai assertions](http://chaijs.com/) and [Sinon mocks](http://sinonjs.org/). We still support Chai and Sinon for backward compatibility reasons, but Jest equivalents should be used whenever new tests are added.

End-to-end tests use [Playwright](https://playwright.dev/docs/intro) to interact with the browser, and Jest to write and drive the testing scripts.

### How to run all tests?

Executing `yarn test` from the root folder will run all test suites.
Behind the scenes we maintain 3 test configuration. This is because each of them (`client`, `server`, and `integration`) has their own requirements.

### How to run a smaller subset of test files?

We have a yarn run script for each tests type: `yarn run test-client`, `yarn run test-server`, `yarn run test-integration`.
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
It works with `describe` and `it` functions. More details in [Jest documentation](https://facebook.github.io/jest/docs/api.html).

Using `only` is a little bit dangerous, as you may end up committing the `only`, which would cause the test suite to only run your test on the build server. So be sure to look for stray only calls when reviewing a test. We have [ESLint rules](https://github.com/jest-community/eslint-plugin-jest) that should catch them for you.

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
