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
```json
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

To execute one of the single test runners go to its top folder and execute `make test` command.

Example for client:

```bash
> cd `client`
> make test
> # if you want to use different test reporter
> env REPORTER=dot make test
> # runner knows about Mocha --grep flag
> make test-post-norm
```

### How to run specified suite or test-case

The exclusivity feature allows you to run only the specified suite or test-case by appending `.only()` to the function.
It works with `describe` and `it` functions. More details in [Mocha documentation](https://mochajs.org/#exclusive-tests).
