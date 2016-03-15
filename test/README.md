## Single test runner

Single test runner loads only test files that are listed in `tests.json` file in top level directory. Configuration reflects folders structure.

### Extending tests.json

Config file location: `client/tests.json`

Example folder: `client/state/plugins/wporg/test/`

Test files we want to add to the runner:
* `actions`
* `selectors`
* `reducer.js`

It translates into the following code in the config file:
```js
{
	"state": {
		"plugins": {
			"wporg": {
				"test": [ "actions", "selectors", "reducer" ]
			}
		}
}
```

Test output for added files:
```
...
state
	plugins
		wporg
			reducer (taken from describe inside the file)
				√ Test name
			test-actions
				√ Test name
			test-selectors
				√ Test name
...
```

### How to run single test runner

We provide two single test runners because of different node path rules applied. They contain files located in:
* `client/` folder
* `server/` folder

We have an `npm run` script for each: `npm run test-client` and `npm run test-server`. You can pass a filename or set of files to these scripts to isolate your test run to just your set of files.

Example for client:

```bash
> # run the entire client suite
> npm run test-client
> # if you want to use different test reporter
> npm run test-client -- --reporter=dot #notice the -- separating out the params to pass to the runner
> # runner knows about Mocha --grep flag
> npm run test-client -- --grep "state ui" # to just run the state/ui tests
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
