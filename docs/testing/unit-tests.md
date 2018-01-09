# Unit Tests

As well fostering code quality, well-written unit tests provide a fine way for developers to quickly understand how to run a piece of code, and what it does under various conditions. It's important therefore to maintain high standards not just in our source code, but in our tests as well. 

This guide is intended as a quick reference of common tools and conventions we use for Calypso unit testing. You'll be able to glean a great deal from browsing through Calypso's existing tests, but we'll try to keep this page up to date with the most recent standards.

## Table of contents
* [Running tests](running-tests)
* [Writing tests](writing-tests)
    * [Folder structure](#folder-structure)
    * [Describing tests](#describing-tests)
    * [Mocking HTTP requests with nock](#mocking-http-requests-with nock)
    * [Snapshot testing](#snapshot-testing)
* [Examples](#examples)

## Running tests

See [testing-overview.md](testing-overview.md).

## Writing tests

We use [Jest](https://facebook.github.io/jest) testing framework for unit tests, and [Enzyme](https://github.com/airbnb/enzyme) for testing React components. You can find more information on testing components at [component tests](component-tests.md)._

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
See [Snapshot testing](snapshot-testing.md)

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

Passing dependencies to a function as arguments can often make your code simpler to test. As a basic example, we have a utility function that checks whether a value exists in a list:

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

#### Global objects

When stubbing properties or methods in the global scope, make sure to cache the original value and reinstate it after the tests have completed. This way we avoid breaking other test suites that may rely on them.

```javascript
	describe( 'suggested languages', () => {
		const browserLanguages = [ 'en-GB', 'en', 'en-US', 'en-AU', 'it' ];
		let _navigator;

		beforeEach( () => {
			_navigator = global.navigator;
			Object.defineProperty( global.navigator, 'languages', {
				get: () => browserLanguages,
				configurable: true,
			} );
		} );

		afterEach( () => {
			global.navigator = _navigator;
		} );
	    
	    // some test cases ...
	} );	
```
