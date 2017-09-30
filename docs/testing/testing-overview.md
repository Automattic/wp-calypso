# Testing Overview

Software testing helps protect code from incoming bugs and improves general quality of the functionalities exposed to the users. When you look at it from the developer's standpoint the first thing that comes to mind is unit testing. However it turns out tests come in many flavors. Robert C. Martin in his [The Clean Coder book](https://www.amazon.com/Clean-Coder-Conduct-Professional-Programmers/dp/0137081073) shares what kinds of tests a professional team should use to ensure that the application remains intact. The following items create a hierarchy:
* __Unit tests__ (coverage nearly 100%, done by developers) – part of CI.
* __Component tests__ (~50%, business analysts & QA) – part of CI.
* __Integration tests__ (~20%, architects) – they should care only about a couple of layers at the time, executed once a night in dev environment.
* __System tests__ (~10%, Business analysts & architects) – run in staging, at that level you can test 3rd parties.
* __Manual tests__ (~5%, people) – exploratory, you never follow a handbook.

All of this might feel confusing and overwhelming even for seasoned developers. That's why the short talk [What We Can Learn About Testing From The Wheel](https://www.youtube.com/watch?v=Da9wfQ0frGA) by _Kent C. Dodds_ from _Ignite Fluent 2016_ might help understand differences. The author uses a car metaphor to make it easier to distinguish some of the most popular types of testing.

Next paragraphs explain how all those different types of testing are used to keep Calypso healthy.

### Server side tests

This test configuration contains unit tests that verify code located in `server` top level folder. 

It supports automatic test discovery. We only need to put a test file into a `test` subfolder, next to the files we want to test.

Tests can be run in 3 different modes:
```bash
> # run the entire server suite
> npm run test-server
> # run a configuration customized to work with continuous integration 
> npm run test-server:ci
> # run tests in watch mode, by default it executes tests for the modified files only
> npm run test-client:watch
```

Those tests are executed on every push on continuous integration (we use CircleCi). This is why all individual tests need to be blazing fast. Please note that network connection is disabled for this configuration.

_Check also how to write [unit components](unit-tests.md)._

### Client side tests

This test configuration contains unit and component tests that verify code located in `client` top level folder. 

It supports automatic test discovery. We only need to put a test file into a `test` subfolder, next to the files we want to test. 

Tests can be run in 3 different modes:
```bash
> # run the entire client suite
> npm run test-client
> # run a configuration customized to work with continuous integration
> npm run test-server:ci
> # run tests in watch mode, by default it executes tests for the modified files only
> npm run test-client:watch
```

They are executed on every push on continuous integration (CircleCI). This is why all individual tests need to be blazing fast. Please note that network connection is disabled for this configuration.

_Check also how to write [unit tests](unit-tests.md) and [component tests](component-tests.md)._

### Integration tests

This test configuration contains integration tests that verify code located in `bin`, `client`, `server` and `test` top level folders. They should test how a group of components or a larger part of business logic works together.

It supports automatic test discovery. We only need to put a test file into a `integration` subfolder, next to the files we want to test.

Tests can be run in 2 different modes:
```bash
> # run the entire integration suite
> npm run test-integration
> # run a configuration customized to work with continuous integration
> npm run test-integration:ci
```

They run daily on continuous integration (CircleCI), because they can use network connection or memory intensive processing and therefore can have longer runtime.

### End-to-end tests

They play role of system tests, because they are executed against the entire integrated WordPress.com system.

All those tests can't be found in this repository, but they live in [Automattic/wp-e2e-tests](https://github.com/Automattic/wp-e2e-tests) instead. See also [Introducing our WordPress.com Automated e2e Tests](https://developer.wordpress.com/2016/05/12/automated-e2e-tests/) post to find out more.

They are executed after every deploy. A small subset of acceptance tests is executed as a prerequisite for every deploy.

## FAQ

##### What tools and libraries are used?

We use [Jest](https://facebook.github.io/jest/) testing tool to execute all test configurations located in Calypso repository. It's highly recommended to use Jest's very flexible [API](https://facebook.github.io/jest/docs/en/api.html) together with [expect matchers](https://facebook.github.io/jest/docs/en/expect.html) and [mock functions](https://facebook.github.io/jest/docs/en/mock-function-api.html).

Historically we have been using [Mocha](https://mochajs.org/) with [Chai assertions](http://chaijs.com/) and [Sinon mocks](http://sinonjs.org/). We still support Chai and Sinon for backward compatibility reasons, but Jest equivalents should be used whenever new tests are added.

End-to-end tests are still using Mocha to run tests.
 
##### How to add a new test file?

We should use the same file names as the implementation files for the tests.
Example: if we want to write unit tests covering the file `hello-world/index.jsx`, we should name a test file `hello-world/test/index.jsx`.

If we ever need to add non-test files to a `test` folder, we should put them in a deeper level. Common choices are:

* `test/mocks/name.js` for test mocks
* `test/fixtures/name.js` for test data

##### How to run all tests?

Executing `npm test` from the root folder will run all test suites.
Behind the scenes we maintain 3 test configuration. This is because each of them (`client`, `server`, and `integration`) has their own requirements.

##### How to run a smaller subset of test files?

We have a npm run script for each tests type: `npm run test-client`, `npm run test-server`, `npm run test-integration`.
You can pass a filename, folder name or matching pattern to these scripts to narrow down number of executed tests.

Example for client:

```bash
> # run test suite for a specific test file
> npm run test-client client/state/selectors/test/get-media.js
> # run test suites for all files in a specific folder
> npm run test-server server/config
> # run test suites for all files matching pattern
> npm run test-client client/*/domains
```

##### How to run specified suite or test-case

The exclusivity feature allows you to run only the specified suite or test-case by appending `.only()` to the function.
It works with `describe` and `it` functions. More details in [Jest documentation](https://facebook.github.io/jest/docs/api.html).

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
