# Testing Overview

Gutenberg contains both PHP and JavaScript code, and encourages testing and code style linting for both.

## Why test?

Aside from the joy testing will bring to your life, tests are important not only because they help to ensure that our application behaves as it should, but also because they provide concise examples of how to use a piece of code.

Tests are also part of our code base, which means we apply to them the same standards we apply to all our application code.

As with all code, tests have to be maintained. Writing tests for the sake of having a test isn't the goal – rather we should try to strike the right balance between covering expected and unexpected behaviours, speedy execution and code maintenance.

When writing tests consider the following:

* What behaviour(s) are we testing?
* What errors are likely to occur when we run this code?
* Does the test test what we think it is testing? Or are we introducing false positives/negatives?
* Is it readable? Will other contributors be able to understand how our code behaves by looking at its corresponding test?

## JavaScript Testing

Tests for JavaScript use [Jest](http://facebook.github.io/jest/) as the test runner and its API for [globals](https://facebook.github.io/jest/docs/en/api.html) (`describe`, `test`, `beforeEach` and so on) [assertions](http://facebook.github.io/jest/docs/en/expect.html), [mocks](http://facebook.github.io/jest/docs/en/mock-functions.html), [spies](http://facebook.github.io/jest/docs/en/jest-object.html#jestspyonobject-methodname) and [mock functions](https://facebook.github.io/jest/docs/en/mock-function-api.html). If needed, you can also use [Enzyme](https://github.com/airbnb/enzyme) for React component testing.

Assuming you've followed the [instructions](https://github.com/WordPress/gutenberg/blob/master/CONTRIBUTING.md) to install Node and project dependencies, tests can be run from the command-line with NPM:

```
npm test
```

Code style in JavaScript is enforced using [ESLint](http://eslint.org/). The above `npm test` will execute both unit tests and code linting. Code linting can be verified independently by running `npm run lint`. ESLint can also fix not all, but many issues automatically by running `npm run lint:fix`. To reduce the likelihood of unexpected build failures caused by code styling issues, you're encouraged to [install an ESLint integration for your editor](https://eslint.org/docs/user-guide/integrations) and/or create a [git pre-commit hook](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) containing the `npm run lint:fix` command.

To run unit tests only, without the linter, use `npm run test-unit` instead.

### Folder structure

Keep your tests in a `test` folder in your working directory. The test file should have the same name as the test subject file.

```
+-- test
|   +-- bar.js
+-- bar.js
```

Only test files (with at least one test case) should live directly under `/test`. If you need to add external mocks or fixtures, place them in a sub folder, for example:

* `test/mocks/[file-name].js`
* `test/fixtures/[file-name].js`

### Importing tests

Given the previous folder structure, try to use relative paths when importing of the __code you're testing__, as opposed to using project paths.

**Good**

`import { bar } from '../bar';`

**Not so good**

`import { bar } from 'components/foo/bar';`

It will make your life easier should you decide to relocate your code to another position in the application directory.

### Describing tests

Use a `describe` block to group test cases. Each test case should ideally describe one behaviour only.

In test cases, try to describe in plain words the expected behaviour. For UI components, this might entail describing expected behaviour from a user perspective rather than explaining code internals.

**Good**

```javascript
describe( 'CheckboxWithLabel', () => {
    test( 'checking checkbox should disable the form submit button', () => {
        ...
    } );
} );
```

**Not so good**

```javascript
describe( 'CheckboxWithLabel', () => {
    test( 'checking checkbox should set this.state.disableButton to `true`', () => {
        ...
    } );
} );
```

### Setup and Teardown methods

The Jest API includes some nifty [setup and teardown methods](https://facebook.github.io/jest/docs/en/setup-teardown.html) that allow you to perform tasks *before* and *after* each or all of your tests, or tests within a specific `describe` block.

These methods can handle asynchronous code to allow setup that you normally cannot do inline. As with [individual test cases](https://facebook.github.io/jest/docs/en/asynchronous.html#promises), you can return a Promise and Jest will wait for it to resolve:

```javascript
// one-time setup for *all* tests
beforeAll( () =>  someAsyncAction().then( resp => {
    window.someGlobal = resp;
} ) );

// one-time teardown for *all* tests
afterAll( () => {
    window.someGlobal = null;
} );
```

`afterEach` and `afterAll` provide a perfect (and preferred) way to 'clean up' after our tests, for example, by resetting state data.

Avoid placing clean up code after assertions since, if any of those tests fail, the clean up won't take place and may cause failures in unrelated tests.

### Mocking dependencies

#### Dependency injection

Passing dependencies to a function as arguments can often make your code simpler to test. Where possible, avoid referencing dependencies in a higher scope.

**Not so good**

```javascript
import VALID_VALUES_LIST from './constants'

function isValueValid( value ) {
	return VALID_VALUES_LIST.includes( value );
}
```

Here we'd have to import and use a value from `VALID_VALUES_LIST` in order to pass:

`expect( isValueValid( VALID_VALUES_LIST[ 0 ] ) ).toBe( true );`

The above assertion is testing two behaviours: 1) that the function can detect an item in a list, and 2) that it can detect an item in `VALID_VALUES_LIST`.

But what if we don't care what's stored in `VALID_VALUES_LIST`, or if the list is fetched via an HTTP request, and we only want to test whether `isValueValid` can detect an item in a list?

**Good**

```javascript
function isValueValid( value, validValuesList = [] ) {
	return validValuesList.includes( value );
}
```

Because we're passing the list as an argument, we can pass mock  `validValuesList` values in our tests and, as a bonus, test a few more scenarios:

`expect( isValueValid( 'hulk', [ 'batman', 'superman' ] ) ).toBe( false );`

`expect( isValueValid( 'hulk', null ) ).toBe( false );`

`expect( isValueValid( 'hulk', [] ) ).toBe( false );`

`expect( isValueValid( 'hulk', [ 'iron man', 'hulk' ] ) ).toBe( true );`

#### Imported dependencies

Often our code will use methods and properties from imported external and internal libraries in multiple places, which makes passing around arguments messy and impracticable. For these cases `jest.mock` offers a neat way to stub these dependencies.

For instance, lets assume we have `config` module to control a great deal of functionality via feature flags.

```javascript
// bilbo.js
import config from 'config';
export const isBilboVisible = () => config.isEnabled( 'the-ring' ) ? false : true;
```

To test the behaviour under each condition, we stub the config object and use a jest mocking function to control the return value of `isEnabled`.

```javascript
// test/bilbo.js
import { isEnabled } from 'config';
import { isBilboVisible } from '../bilbo';

jest.mock( 'config', () => ( {
	// bilbo is visible by default
	isEnabled: jest.fn( () => false ),
} ) );

describe( 'The bilbo module', () => {
	test( 'bilbo should be visible by default', () => {
		expect( isBilboVisible() ).toBe( true );
	} );

	test( 'bilbo should be invisible when the `the-ring` config feature flag is enabled', () => {
		isEnabled.mockImplementationOnce( name => name === 'the-ring' );
		expect( isBilboVisible() ).toBe( false );
	} );
} );
```

### Testing globals

We can use [Jest spies](http://facebook.github.io/jest/docs/en/jest-object.html#jestspyonobject-methodname) to test code that calls global methods.

```javascript
import { myModuleFunctionThatOpensANewWindow } from '../my-module';

describe( 'my module', () => {
	beforeAll( () => {
		jest.spyOn( global, 'open' )
			.mockImplementation( () => true );
	} );

	test( 'something', () => {
		myModuleFunctionThatOpensANewWindow();
		expect( global.open ).toHaveBeenCalled();
	} );
} );
```

### Snapshot testing

This is an overview of [snapshot testing] and how to best leverage snapshot tests.

#### TL;DR Broken snapshots

When a snapshot test fails, it just means that a component's rendering has changed. If that was unintended, then the snapshot test just prevented a bug 😊

However, if the change was intentional, follow these steps to update the snapshot. Run the following to update the snapshots:
   ```sh
   # --testPathPattern is optional but will be much faster by only running matching tests
   npm run test-unit -- --updateSnapshot --testPathPattern path/to/tests
   ```
1. Review the diff and ensure the changes are expected and intentional.
1. Commit.

#### What are snapshots?

Snapshots are just a representation of some data structure generated by tests. Snapshots are stored in files and committed alongside the tests. When the tests are run, the data structure generated is compared with the snapshot on file.

It's very easy to make a snapshot:

```js
test( 'foobar test', () => {
  const foobar = { foo: 'bar' };

  expect( foobar ).toMatchSnapshot();
} );
```

This is the produced snapshot:

```js
exports[`test foobar test 1`] = `
  Object {
    "foo": "bar",
  }
`;
```

You should never create or modify a snapshot directly, they are generated and updated by tests.

#### Advantages

* Trivial and concise to add tests.
* Protect against unintentional changes.
* Simple to work with.
* Reveal internal structures without running the application.

#### Disadvantages

* Not expressive.
* Only catch issues when changes are introduced.
* Are problematic for anything non-deterministic.

#### Use cases

Snapshot are mostly targeted at component testing. They make us conscious of changes to a component's structure which makes them _ideal_ for refactoring. If a snapshot is kept up to date over the course of a series of commits, the snapshot diffs record the evolution of a component's structure. Pretty cool 😎

```js
import { shallow } from 'enzyme';
import SolarSystem from 'solar-system';
import { Mars } from 'planets';

describe( 'SolarSystem', () => {
  test( 'should render', () => {
    const wrapper = shallow( <SolarSystem /> );

    expect( wrapper ).toMatchSnapshot();
  } );

  test( 'should contain mars if planets is true', () => {
    const wrapper = shallow( <SolarSystem planets /> );

    expect( wrapper ).toMatchSnapshot();
    expect( wrapper.find( Mars ) ).toHaveLength( 1 );
  } );
} );
```

Reducer tests are also be a great fit for snapshots. They are often large, complex data structures that shouldn't change unexpectedly, exactly what snapshots excel at!

#### Working with snapshots

You might be blindsided by CI tests failing when snapshots don't match. You'll need to [update snapshots] if the changes are expected. The quick and dirty solution is to invoke Jest with `--updateSnapshot`. That can be done as follows:

```sh
npm run test-unit -- --updateSnapshot --testPathPattern path/to/tests
```

`--testPathPattern` is not required, but specifying a path will speed things up by running a subset of tests.

It's a great idea to keep `npm run test-unit:watch` running in the background as you work. Jest will run only the relevant tests for changed files, and when snapshot tests fail, just hit `u` to update a snapshot!

#### Pain points

Non-deterministic tests may not make consistent snapshots, so beware. When working with anything random, time-based, or otherwise non-deterministic, snapshots will be problematic.

Connected components are tricky to work with. To snapshot a connected component you'll probably want to export the unconnected component:

```js
// my-component.js
export { MyComponent };
export default connect( mapStateToProps )( MyComponent );

// test/my-component.js
import { MyComponent } from '..';
// run those MyComponent tests…
```

The connected props will need need to be manually provided. This is a good opportunity to audit the connected state.

#### Best practices

If you're starting a refactor, snapshots are quite nice, you can add them as the first commit on a branch and watch as they evolve.

Snapshots themselves don't express anything about what we expect. Snapshots are best used in conjunction with other tests that describe our expectations, like in the example above:

```js
test( 'should contain mars if planets is true', () => {
  const wrapper = shallow( <SolarSystem planets /> );

  // Snapshot will catch unintended changes
  expect( wrapper ).toMatchSnapshot();

  // This is what we actually expect to find in our test
  expect( wrapper.find( Mars ) ).toHaveLength( 1 );
} );
```

[`shallow`](http://airbnb.io/enzyme/docs/api/shallow.html) rendering is your friend:

> Shallow rendering is useful to constrain yourself to testing a component as a unit, and to ensure that your tests aren't indirectly asserting on behavior of child components.

It's tempting to snapshot deep renders, but that makes for huge snapshots. Additionally, deep renders no longer test a single component, but an entire tree. With `shallow`, we snapshot just the components that are directly rendered by the component we want to test.

### Code Coverage

Code coverage is measured for each PR using the [codecov.io](https://codecov.io/gh/WordPress/gutenberg) tool.
[Code coverage](https://en.wikipedia.org/wiki/Code_coverage) is a way of measuring the amount of code covered by the tests in the test suite of a project.  In Gutenberg, it is currently measured for JavaScript code only.

## End to end Testing

If you're using the built-in [local environment](https://github.com/WordPress/gutenberg/blob/master/CONTRIBUTING.md#local-environment), you can run the e2e tests locally using this command:

```bash
npm run test-e2e
```

or interactively

```bash
npm run test-e2e:watch
```

If you're using a different setup, you can provide the base URL, username and password like this:

```bash
WP_BASE_URL=http://localhost:8888 WP_USERNAME=admin WP_PASSWORD=password npm run test-e2e
```

## PHP Testing

Tests for PHP use [PHPUnit](https://phpunit.de/) as the testing framework. If you're using the built-in [local environment](https://github.com/WordPress/gutenberg/blob/master/CONTRIBUTING.md#local-environment), you can run the PHP tests locally using this command:

```bash
npm run test-php
```

Code style in PHP is enforced using [PHP_CodeSniffer](https://github.com/squizlabs/PHP_CodeSniffer). It is recommended that you install PHP_CodeSniffer and the [WordPress Coding Standards for PHP_CodeSniffer](https://github.com/WordPress-Coding-Standards/WordPress-Coding-Standards#installation) ruleset using [Composer](https://getcomposer.org/). With Composer installed, run `composer install` from the project directory to install dependencies. The above `npm run test-php` will execute both unit tests and code linting. Code linting can be verified independently by running `npm run lint-php`.

To run unit tests only, without the linter, use `npm run test-unit-php` instead.

[snapshot testing]: https://facebook.github.io/jest/docs/en/snapshot-testing.html
[update snapshots]: https://facebook.github.io/jest/docs/en/snapshot-testing.html#updating-snapshots
