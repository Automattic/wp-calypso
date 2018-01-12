# Unit Tests

Unit tests are important because they help ensure correctness. A good unit test also provides a concise example of the usage and expected behavior of code in an isolated context. It's therefore important to maintain high standards to maximize the effectiveness of our tests.

This guide is intended as a quick reference of common tools and conventions we use for Calypso unit testing. You'll be able to glean a great deal from browsing through Calypso's existing tests, but we'll try to keep this page up to date with the most recent standards.

## Table of contents
* [Running tests](running-tests)
* [Writing tests](writing-tests)
    * [Folder structure](#folder-structure)
    * [Importing tests](#importing-tests)
    * [Describing tests](#describing-tests)
    * [Snapshot testing](#snapshot-testing)
* [Examples](#examples)

## Running tests

See [testing-overview.md](testing-overview.md) on how to run Calypso tests.

## Writing tests

We use [Jest](https://facebook.github.io/jest) testing framework for unit tests, and [Enzyme](https://github.com/airbnb/enzyme) for testing React components. You can find more information on testing components at [component tests](component-tests.md).

Though you'll still see Chai assertions and Sinon spies/mocks throughout the code base, for all new tests we use the Jest API for [globals](https://facebook.github.io/jest/docs/en/api.html) (`describe`, `test`, `beforeEach` and so on) [assertions](http://facebook.github.io/jest/docs/en/expect.html), [mocks](http://facebook.github.io/jest/docs/en/mock-functions.html), [spies](http://facebook.github.io/jest/docs/en/jest-object.html#jestspyonobject-methodname) and [mock functions](https://facebook.github.io/jest/docs/en/mock-function-api.html).

## Folder structure
Keep your tests in a `test` folder in your working directory. The test file should have the same name as the test subject file, and use the extension `.js`.

```
+-- test
|   +-- bar.js
+-- bar.jsx
```

Only test files (with at least one test case) should live directly under `/test`. If you need to add external mocks or fixtures, place them in a sub folder, for example:

* `test/mocks/[file-name.js`
* `test/fixtures/[file-name].js` 

### Importing tests

Given the previous folder structure, try to use relative paths when importing of the __code you're testing__, as opposed to using project paths.

**Good**

`import { bar } from '../bar';`

**Not so good**

`import { bar } from 'components/foo/bar';`

It will make your life easier should you decide to relocate your code to another position in the application directory.

### Describing tests
Use a 'describe' block to group test cases. Each test case should ideally describe one behaviour only.

In test cases, try to describe in plain words the expected behaviour. For UI components, this might entail describing expected behaviour from a user perspective rather than explaining code internals.

**Good**

```javascript
describe( 'CheckboxWithLabel', () => {
    test('checking checkbox should disable the form submit button', () => {
        ...
    } );
} );
```

**Not so good**

```javascript
describe( 'CheckboxWithLabel', () => {
    test('checking checkbox should set this.state.disableButton to `true`', () => {
        ...
    } );
} );
```

### Snapshot testing
Snapshot testing is useful for verifying that any data produced during a test is not inadvertently changed. This is especially useful for large and complex data structures like component or state trees. See the [our full reference](snapshot-testing.md) for more information.

### Examples

### Setup and Teardown methods

The Jest API includes some nifty [setup and teardown methods](https://facebook.github.io/jest/docs/en/setup-teardown.html) that allow you to perform tasks *before* and *after* each or all of your tests, or tests within a specific `describe` block.

These methods can handle asynchronous code to allow setup that you normally cannot do inline.

For example, you 

```javascript

// one-time setup for *all* tests
beforeAll( done => {
    someAsyncAction()
        .then( resp => {
        	window.someGlobal = resp;
        	done();
        } );
} );

// one-time teardown for *all* tests
afterAll( () => {
    window.someGlobal = null;
} );

// one-time setup for *each* test
beforeEach( () => {
    
} );

// one-time teardown for *each* test
afterEach( () => {
    
} );

```

Though it is good practice to clean up after your tests suites, Jest tests are run in isolation so changes to things such as global values won't effect other Calypso tests.

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

For instance, in Calypso, we use the ['config'](https://github.com/Automattic/wp-calypso/tree/master/client/config) module to control a great deal of functionality via feature flags. 

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

When stubbing DOM properties or methods in the global scope, make sure to include `@jest-environment jsdom` the comment

```javascript

/**
 * @format
 * @jest-environment jsdom
 */
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

### Testing legacy code

Calypso is an amorphous, ever-changing creature, so you might find yourself having to extend or edit tests for legacy code.

For example, the current preference for manage fetching and updating data remotely/asynchronously is via the [data layer](https://github.com/Automattic/wp-calypso/tree/master/client/state/data-layer).

Still, you may come across components and actions containing calls to [lib/wp](https://github.com/Automattic/wp-calypso/tree/master/client/lib/wp):

```javascript
wpcom
    .someWpComMethod()
    .then( ( error, data ) => {
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
