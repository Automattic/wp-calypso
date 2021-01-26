# Unit Tests

This guide is intended as a quick reference of common tools and conventions we use for Calypso unit testing. You'll be able to glean a great deal from browsing through Calypso's existing tests, but we'll try to keep this page up to date with the most recent standards.

## Table of contents

- [Unit Tests](#unit-tests)
  - [Table of contents](#table-of-contents)
  - [Why unit test?](#why-unit-test)
  - [Running tests](#running-tests)
  - [Writing tests](#writing-tests)
  - [Folder structure](#folder-structure)
    - [Importing tests](#importing-tests)
    - [Describing tests](#describing-tests)
    - [Snapshot testing](#snapshot-testing)
    - [Setup and Teardown methods](#setup-and-teardown-methods)
    - [Mocking dependencies](#mocking-dependencies)
      - [Dependency injection](#dependency-injection)
      - [Imported dependencies](#imported-dependencies)
    - [Testing globals](#testing-globals)
    - [Testing legacy code](#testing-legacy-code)
  - [Further reading](#further-reading)

## Why unit test?

Aside from the joy unit testing will bring to your life, unit tests are important not only because they help to ensure that our application behaves as it should, but also because they provide concise examples of how to use a piece of code.

Tests are also part of our code base, which means we apply to them the same standards we apply to all our application code.

As with all code, tests have to be maintained. Writing tests for the sake of having a test isn't the goal – rather we should try to strike the right balance between covering expected and unexpected behaviours, speedy execution and code maintenance.

Unit tests test **units** of behavior, and should contain relatively few abstractions. If our tests are failing in response to legitimate changes, it could be a sign that we have coupled our tests too closely to the internals of our code.

When writing unit tests consider the following:

- What behaviour(s) are we testing?
- What errors are likely to occur when we run this code?
- Does the test test what we think it is testing? Or are we introducing false positives/negatives?
- Is it readable? Will other contributors be able to understand how our code behaves by looking at its corresponding test?

## Running tests

See [testing-overview.md](testing-overview.md) on how to run Calypso tests.

## Writing tests

We use [Jest](https://facebook.github.io/jest) testing framework for unit tests, and [Enzyme](https://github.com/airbnb/enzyme) for testing React components. You can find more information on testing components at [component tests](component-tests.md).

Though you'll still see Chai assertions and Sinon spies/mocks throughout the code base, for all new tests we use the Jest API for [globals](https://facebook.github.io/jest/docs/en/api.html) (`describe`, `test`, `beforeEach` and so on) [assertions](http://facebook.github.io/jest/docs/en/expect.html), [mocks](http://facebook.github.io/jest/docs/en/mock-functions.html), [spies](http://facebook.github.io/jest/docs/en/jest-object.html#jestspyonobject-methodname) and [mock functions](https://facebook.github.io/jest/docs/en/mock-function-api.html).

## Folder structure

Keep your tests in a `test` folder in your working directory. The test file should have the same name as the test subject file.

```
+-- test
|   +-- bar.js
+-- bar.jsx
```

Only test files (with at least one test case) should live directly under `/test`. If you need to add external mocks or fixtures, place them in a sub folder, for example:

- `test/mocks/[file-name.js`
- `test/fixtures/[file-name].js`

### Importing tests

Given the previous folder structure, try to use relative paths when importing of the **code you're testing**, as opposed to using project paths.

#### Good

`import { bar } from '../bar';`

#### Not so good

`import { bar } from 'components/foo/bar';`

It will make your life easier should you decide to relocate your code to another position in the application directory.

### Describing tests

Use a `describe` block to group test cases. Each test case should ideally describe one behaviour only.

In test cases, try to describe in plain words the expected behaviour. For UI components, this might entail describing expected behaviour from a user perspective rather than explaining code internals.

**Good**

```javascript
describe( 'CheckboxWithLabel', () => {
	test( 'checking checkbox should disable the form submit button', () => {
		/*...*/
	} );
} );
```

**Not so good**

```javascript
describe( 'CheckboxWithLabel', () => {
	test( 'checking checkbox should set this.state.disableButton to `true`', () => {
		/*...*/
	} );
} );
```

### Snapshot testing

Snapshot testing is useful for verifying that any data produced during a test is not inadvertently changed. This is especially useful for large and complex data structures like component or state trees. See the [our full reference](snapshot-testing.md) for more information.

### Setup and Teardown methods

The Jest API includes some nifty [setup and teardown methods](https://facebook.github.io/jest/docs/en/setup-teardown.html) that allow you to perform tasks _before_ and _after_ each or all of your tests, or tests within a specific `describe` block.

These methods can handle asynchronous code to allow setup that you normally cannot do inline. As with [individual test cases](https://facebook.github.io/jest/docs/en/asynchronous.html#promises), you can return a Promise and Jest will wait for it to resolve:

```javascript
// one-time setup for *all* tests
beforeAll( () =>
	someAsyncAction().then( ( resp ) => {
		window.someGlobal = resp;
	} )
);

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
import VALID_VALUES_LIST from './constants';

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

Because we're passing the list as an argument, we can pass mock `validValuesList` values in our tests and, as a bonus, test a few more scenarios:

`expect( isValueValid( 'hulk', [ 'batman', 'superman' ] ) ).toBe( false );`

`expect( isValueValid( 'hulk', null ) ).toBe( false );`

`expect( isValueValid( 'hulk', [] ) ).toBe( false );`

`expect( isValueValid( 'hulk', [ 'iron man', 'hulk' ] ) ).toBe( true );`

#### Imported dependencies

Often our code will use methods and properties from imported external and internal libraries in multiple places, which makes passing around arguments messy and impracticable. For these cases `jest.mock` offers a neat way to stub these dependencies.

For instance, in Calypso, we use the ['config'](https://github.com/Automattic/wp-calypso/tree/HEAD/client/config) module to control a great deal of functionality via feature flags.

```javascript
// bilbo.js
import config from '@automattic/calypso-config';
export const isBilboVisible = () => ( config.isEnabled( 'the-ring' ) ? false : true );
```

To test the behaviour under each condition, we stub the config object and use a jest mocking function to control the return value of `isEnabled`.

```javascript
// test/bilbo.js
import { isEnabled } from '@automattic/calypso-config';
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
		isEnabled.mockImplementationOnce( ( name ) => name === 'the-ring' );
		expect( isBilboVisible() ).toBe( false );
	} );
} );
```

### Testing globals

We can use [Jest spies](http://facebook.github.io/jest/docs/en/jest-object.html#jestspyonobject-methodname) to test code that calls global methods.

When stubbing DOM properties or methods in the global scope, make sure to include the `@jest-environment jsdom` comment to ensure there's a DOM to stub :)

```javascript
/**
 * @jest-environment jsdom
 */
import { myModuleFunctionThatOpensANewWindow } from '../my-module';

describe( 'my module', () => {
	beforeAll( () => {
		jest.spyOn( global, 'open' ).mockImplementation( () => true );
	} );

	test( 'something', () => {
		myModuleFunctionThatOpensANewWindow();
		expect( global.open ).toHaveBeenCalled();
	} );
} );
```

### Testing legacy code

Calypso is an amorphous, ever-changing creature, so you might find yourself having to extend or edit tests for legacy code.

For example, the current preference for manage fetching and updating data remotely/asynchronously is via the [data layer](https://github.com/Automattic/wp-calypso/tree/HEAD/client/state/data-layer).

Still, you may come across components and actions containing calls to [lib/wp](https://github.com/Automattic/wp-calypso/tree/HEAD/client/lib/wp):

```javascript
wpcom.someWpComMethod().then( ( error, data ) => {
	// do something with the response
} );
```

In this case you can use Jest to stub out such libraries:

```javascript
//
jest.mock( 'lib/wp', () => ( {
	someWpComMethod: jest.fn(),
} ) );
```

## Further reading

- [React testing with Jest](https://facebook.github.io/jest/docs/en/tutorial-react.html)
- [Enyzme API](https://github.com/airbnb/enzyme/tree/HEAD/docs/api)
- [Test Contra-variance](http://blog.cleancoder.com/uncle-bob/2017/10/03/TestContravariance.html)
- [The Failures of "Into to TDD"](http://blog.testdouble.com/posts/2014-01-25-the-failures-of-intro-to-tdd.html)
