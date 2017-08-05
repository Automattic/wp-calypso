### How to add a new test file
The single test runner supports automatic test discovery. We only need to put a test file into a `test` or `integration` subfolder, next to the files we want to test.
The runner uses this glob pattern `@(client|server|test|integration)/**/test/*.@(js|jsx)` to find test files.

We should use the same file names as the implementation files for the tests.
Example: if we want to write unit tests covering the file `hello-world/index.jsx`, we should name a test file `hello-world/test/index.jsx`.

If we ever need to add non-test files to a `test` folder, we should put them in a deeper level. Common choices are:

* `test/mocks/name.js` for test mocks
* `test/fixtures/name.js` for test data

### How to run single test runner

Executing `npm test` from the root folder will run all test suites.
Behind the scenes we maintain 3 test configuration. This is because each of them (`client`, `server`, and `integration`) has their own requirements.

We have also an npm run script for each tests type: `npm run test-client`, `npm run test-server`, `npm run test-integration`.
We can pass a filename or folder name to these scripts to narrow down number of executed tests.

Example for client:

```bash
> # run the entire client suite
> npm run test-client
> # run the entire server suite
> npm run test-server
> # run integration tests (these run daily on CI)
< npm run test-integration
> # run test suite for a specific test file
> npm run test-client client/state/selectors/test/get-media.js
> npm run test-server server/config/test/parser.js
> # run test suite for all files in a specific folder
> npm run test-client client/state
> npm run test-server server/config
```

### How to watch files for test running
```bash
> # run all client tests on file changes
> npm run test-client:watch
> # run tests for a specific folder on file changes
> npm run test-client:watch client/state
```

### How to run specified suite or test-case

The exclusivity feature allows you to run only the specified suite or test-case by appending `.only()` to the function.
It works with `describe` and `it` functions. More details in [Mocha documentation](https://mochajs.org/#exclusive-tests).

Using `only` is a little bit dangerous, as you may end up committing the `only`, which would cause the test suite to only run your test on the build server. So be sure to look for stray only calls when reviewing a test. We have an `eslint` rule in the works that should catch them for you.

Example:

```js
describe.only( 'just run this suite', function() {
	it( 'should run these tests', function() {
		// your test
	} );

	it.only( 'should only run this one test', function() {
		// just run this test if the only is present
	} );
} );
```

### How to run Mocha directly

You can run Mocha directly by using `run-mocha.js` as the entry point for Mocha. Note that this only works for tests 
inside single test runner. This gives you more flexibility to integrate with different toolings.

Example:
```shell
# Run all client tests within the single test runner
$ NODE_ENV=test NODE_PATH=client:test node_modules/.bin/mocha test/run-mocha.js 

# Run all server tests within the single test runner
$ NODE_ENV=test NODE_PATH=server:client:test node_modules/.bin/mocha test/run-mocha.js
```
