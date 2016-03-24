# Use Mockery

##### Load and unload mockery in a safe manner

Lots of tests use `mockery` to mock out the underlying requirements of a module under test. Loading and using `mockery` can be tricky with a lot of tests. You have to remember to unload it after use, use a clean cache, etc. This module takes care of automating those tasks for you.

Generally, we see `mockery` based mocking as a last resort. We prefer passing dependencies when we can, as `mockery` can be slow and invasive.

When using mockery, to avoid subtle problems it is recommended to require any non-test-utility modules in either the `useMockery` callback or subsequent `before` blocks. For example, because of the `useCleanCache` setting, any React dependencies (including `react-addons-test-utils`) _must_ be required after the `useMockery()` call to avoid invariant errors

## Format:
```js
	useMockery( beforeHookCallback, afterHookCallback )
```
`beforeHookCallback` and `afterHookCallback` are called with one argument: The `mockery` instance.

## Usage

```js
import useMockery from 'test/helpers/use-mockery';

// THINGS REQUIRED HERE WILL NOT HAVE MOCKED DEPENDENCIES

describe('my test suite', () = {

	before( () => {
		// THINGS REQUIRED HERE WILL NOT HAVE MOCKED DEPENDENCIES
	} );

	useMockery( mockery => {
		// attached to before hook
		mockery.registerMock( 'lib/network', {
			fetch() {
				return Promise.resolve( { success: true } );
			}
		} );
		// you can require things that have mocked dependencies now!
		const myNetworkThing = require( 'thing/that/uses/lib/network' );
	}, mockery => {
		// attached to after hook
	});

	it ( 'mockery is alive now', () => {
		mockery.registerMock( 'lib/best-number', function() {
			return 42;
		} );
		// you can require things that have mocked dependencies here too
		const myThingUnderTest = require( '../' );
		assert.equals( myThingUnderTest.addFourToBestNumber(), 46 );
	} );

} );

describe( 'my second suite', () => {
	it ('should not have anything mocked', () = {
		// no mocks here
	} );
} );
```
