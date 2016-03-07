## Single test runner

Single test runner loads only test files that are listed in config.json file. Configuration reflects folders structure.

### Extending config.json

Example folder: `client/state/plugins/wporg/test/`

Test files we want to add to the runner:
* `reducer.js`
* `test-actions`
* `test-selectors`

It translates into the following code in the config file:
```json
{
	...
	"state": {
		"plugins": {
			"wporg": {
				"test": [ "reducer", "test-actions", "test-selectors" ]
			}
		},
	...
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

### How to run specified suite or test-case

The exclusivity feature allows you to run only the specified suite or test-case by appending `.only()` to the function.
It works with `describe` and `it` functions. More details in [Mocha documentation](https://mochajs.org/#exclusive-tests).
