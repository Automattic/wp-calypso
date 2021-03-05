# calypso-doctor

This package is used to detect if the developer's system is configured to run Calypso optimally.
It works by running some evaluations and proposing fixes if the results are not expected.

## Available evaluations

- **Docker > CPUs allocated**: Ensures Docker is configured to run with 4 cores (OSX only).
- **Docker > Memory allocated**: Ensures Docker is configured to run with 8 gb of memory or more (OSX only).
- **Node.js > Node memory**: Ensure Node.js processes run with up to 75% of available system memory.
- **Node.js > npm cache**: Configure npm to store some caches in the same folder than yarn's cache.
- **Node.js > Skip chromedriver download**: Do not download chromedriver when running `yarn install`.
- **Node.js > Skip Puppeteer download**: Do not download puppeteer when running `yarn install`.

## Add new evaluations

1. Create a file in `./evaulations/` using the pattern `<group-name>-<title>.js`.
2. The evaluation must export an object with the following properties:
   - `title`: Title of the evaluation
   - `group`: Group of the evaluation, will be used to group them. Examples: `Docker`, `Node.js`. Feel free to create new groups as needed.
   - `description`: Description of the evaluation
   - `test`: async method that receives an object with three functions, `pass`, `fail` and `ignored`. It is expected to run the evaluation and call one of those methods with the result. See the example below.
   - `fix`: async method that returns a string with the suggestion to fix the problem.
3. Declare your file in the array of available evaluations in `index.js`

Example:

```js
module.exports = {
	title: 'Valid username',
	group: 'System',
	description: 'Example evaluation',
	test: async ( { pass, fail, ignored } ) => {
		if ( process.platform === 'win32' ) {
			ignored( 'I do not know how to check usernames in Windows' );
		} else if ( process.env.USER === 'foo' ) {
			pass();
		} else {
			fail( 'Invalid username found, only "foo" is allowed!' );
		}
	},
	fix: () => {
		return `Run "usermod --login foo --move-home --home /home/foo ${ process.env.USER }"`;
	},
};
```

Note that the returned value of `test()` is ingored. If it returns (or throws an error) before calling `pass`, `fail` or `ignored`, the evaluation will be considered as a "fail".
