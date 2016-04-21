## Single test runner

### How to add a new test file

Single test runner supports automatic test discovery. You only need to put your test file into `test` subfolder next to file under test.
Runner uses this `glob` pattern `@(client|server|test)/**/test/*.@(js|jsx)` to find test files.

We should use the same name for test file like we named test we want to cover with tests.

If we ever need to add non-test files to `test` folder we should put them on a deeper level. Common choices are:
* `test/mocks/name.js` for test mocks
* `test/fixtures/name.js` for test data

### How to run single test runner

You can run all tests from the root folder using the `npm test` command.

We provide three single test runners because of different node path rules applied. They contain files located in:
* `client/` folder
* `server/` folder
* `test/` folder

We have an `npm run` script for each of them: `npm run test-client`, `npm run test-server` and `npm run test-test`. You can pass a filename or set of files to these scripts to isolate your test run to just your set of files.

Example for client:

```bash
> # run the entire client suite
> npm run test-client
> # if you want to use different test reporter
> npm run test-client -- --reporter=dot #notice the -- separating out the params to pass to the runner
> # runner knows about Mocha --grep flag
> npm run test-client -- --grep "state ui" # to just run the state/ui tests
> # run single test suite from server folder
> npm run test-server server/config/test/parser.js
> # run single test suite from test folder
> npm run test-test test/helpers/use-nock/test/index.js
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
