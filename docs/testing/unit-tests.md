# Unit Tests

As well fostering code quality, well-written unit tests provide a fine way for developers to quickly understand how to run a piece of code, and what it does under various conditions. It's important therefore to maintain high standards not just in our source code, but in our tests as well. 

This guide is intended as a quick reference of common tools and conventions we use for Calypso unit testing. You'll be able to glean a great deal from browsing through Calypso's existing tests, but we'll try to keep this page up to date with the most recent standards.

## Table of contents
* [Running tests](running-tests)
* [Writing tests](writing-tests)
    * [Describing tests](#describing-tests)
    * [Folder structure](#folder-structure)
    * [Mocking HTTP requests with nock](#mocking-http-requests-with nock)

## What should I unit test?
We assume you've Googled the 'why' of unit testing, but sometimes deciding __what__ to unit test is more difficult. 

If your code were to break or receive unexpected input, what side-effects would the rest of the application experience?

## Running tests

To execute all client side tests, run the following command in the root of the project folder:

```bash
npm run test-client
```

You can also run all tests in a specific directory or matching pattern, for example:

```bash
# run test suites for all files in a specific folder
npm run test-client client/lib/domains

# run test suites for all files matching pattern
npm run test-client client/*/domains
```

To run a __specific suite or test__, append `.only() ` to the `describe` and `test` functions:

```javascript
describe.only( 'just run this suite', function() {
	test( 'should run these tests', function() {
		// your test
	} );

	test.only( 'should only run this one test', function() {
		// just run this test if the only is present
	} );
} );
```
**Note:** Be careful not to check in tests when using the `only()` feature, otherwise the build server will __only__ run those suites or tests.

[eslint-plugin-jest](https://github.com/jest-community/eslint-plugin-jest) runs over all tests files, and will catch common errors. Often your changes will affect other parts of the application, so it's a good idea to run all the unit tests locally before checking in.

## Writing tests
We use [Jest](https://facebook.github.io/jest) for testing our client-side application, and [Enzyme](https://github.com/airbnb/enzyme) for testing React components.

Though you'll still see Chai assertions and Sinon spies/mocks throughout the code base, for all new tests we use the Jest API for [globals](https://facebook.github.io/jest/docs/en/mock-function-api.html#content) (`describe`, `test`, `beforeEach` and so on) [assertions](http://facebook.github.io/jest/docs/en/expect.html#content), [mocks](http://facebook.github.io/jest/docs/en/mock-functions.html#content) and [mock function/spies](https://facebook.github.io/jest/docs/en/mock-function-api.html#content).


## Folder structure
Keep your tests in a `test` folder in your working directory. The test file should have the same name as the test subject file, and use the extension `.js`.

```
+-- test
|   +-- index.js
+-- index.jsx
```

### Describing tests
Use 'describe' block to group test cases. Each test case should ideally describe one behaviour only.

In test cases, try to describe in plain words the expected behaviour For UI components, this might entail describing expected behaviour from a user perspective rather than explaining code internals.

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
See[Snapshot testing](snapshot-testing.md)

### Examples

#### Mocking HTTP requests with Nock

[Nock](https://github.com/node-nock/nock) allows us to override HTTP requests, and unit test code in isolation. For example, you might have an action  that returns a GET request in a thunk:

```javascript
// action.js
export function requestSomeData() {
	return dispatch => {
		return wpcom
            .getSomeData()
            .then( data => {
				dispatch( {
					type: SOME_DATA_SUCCESS,
					data,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: SOME_DATA_FAILURE,
					error,
				} );
			} );
	};
}
```

To mock this response, we can specify the nock parameters in a describe block and use `persist()` to intercept all requests in that block.

Here's a simple example:

```javascript
import { requestSomeData } from '../actions';
import useNock from 'test/helpers/use-nock';

describe( 'requestSomeData', () => {
	describe( 'successful response', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/some-endpoint' )
				.reply( 200, { hoo: 'ray!' } );
		} );

		test( 'dispatches success action object when successful request is completed', () => {
			const mockDispatchCallback = jest.fn();
            // Trigger the action to return the thunk
			requestSomeData()( mockDispatchCallback ).then( () => {
                expect( mockDispatchCallback.mock.calls[ 0 ][ 0 ] ).toEqual( {
                    type: SOME_DATA_SUCCESS,
                    data: { hoo: 'ray!' }
                } );
            } );
		} );
     } );
} );
```

### Mocking dependencies

#### Dependency injection

Passing dependencies to a function as arguments can often make your code simpler to test. A a basic example, we have a utility function that checks whether a value exists in a list.

One way to do it would be to reference a dependency in a higher scope:

```javascript
import VALID_VALUES_LIST from './constants'

function isValueValid( value ) {
	return VALID_VALUES_LIST.includes( value );
}

```

Our happy path test would therefore have to import and use a value from `VALID_VALUES_LIST` in order to pass:

`expect( isValueValid( VALID_VALUES_LIST[ 0 ] ) ).toBe( true );`


The above assertion is testing two behaviours: 1) that the function can detect an item in a list, and 2) that it can detect an item in `VALID_VALUES_LIST`.

But what if we don't care what's stored in `VALID_VALUES_LIST`, or if the list is fetched via an HTTP request, and we only want to test whether `isValueValid` can detect an item in a list?

Let's refactor the original function so that it accepts the target list as an argument:

```javascript
function isValueValid( value, validValuesList = [] ) {
	return validValuesList.includes( value );
}
```

Now we can pass mock lists, and, as a bonus, test a few more scenarios:

`expect( isValueValid( 'hulk', [ 'batman', 'superman' ] ) ).toBe( false );`

`expect( isValueValid( 'hulk', null ) ).toBe( false );`

`expect( isValueValid( 'hulk', [] ) ).toBe( false );`

`expect( isValueValid( 'hulk', [ 'iron man', 'hulk' ] ) ).toBe( true );`


#### Imported dependencies

Often our code will use methods and properties from imported external and internal libraries in multiple places, which makes passing around arguments messy and impracticable. For these cases `jest.mock` offers a neat way to stub these dependencies. 

For instance, in Calypso, we use the ['config'](https://github.com/Automattic/wp-calypso/tree/master/client/config) module to control a great deal of functionality via feature flags. 

```javascript
// bilbo.js
if ( config.isEnabled( 'the-ring' ) ) {
    isBilboVisible = false;
} else {
	isBilboVisible = true;
}
```

To test the behaviour under each condition, we stub the config object and use a jest mocking function to control the return value of `isEnabled`.

```javascript
// test/bilbo.js
import { isEnabled } from 'config';

jest.mock( 'config', () => {
	const config = () => 'development';
    
	// default value is true
	config.isEnabled = jest.fn( true );

	return config;
} );


test( 'bilbo should be invisible when the `the-ring` config feature flag is disabled', () => {
	isEnabled.mockReturnValue( false );
	expect( isBilboVisible ).toBe( false );
} );

```

We can use this approach to test all of Calypso's common, established libraries:

[WP](https://github.com/Automattic/wp-calypso/tree/master/client/lib/wp) 

```javascript
// 
jest.mock( 'lib/wp', () => ( {
	me: () => ( {
		get: () => {},
	} ),
	undocumented: () => {},
} ) );
```

Or event just stub out libraries whose effects we might not care about:

`jest.mock( 'lib/abtest', () => ( { abtest: () => {} } ) );`

`jest.mock( 'lib/analytics', () => ( {} ) );`

### Mocking global objects

### Debugging tests (?)
