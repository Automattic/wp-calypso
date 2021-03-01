# Sinon Test Helpers

A set of helpers for folks using sinon to fake, mock, spy and bend time.

## Usage

### Full sandbox

```js
import { useSandbox } from 'calypso/test-helpers/use-sinon';

describe( 'my tests that use a sandbox and arrow functions', function () {
	let sandbox = null;

	useSandbox( ( newSandbox ) => {
		sandbox = newSandbox;
	} );

	it( 'should have a full suite of sandbox things available', () => {
		// this will get torn down automatically by the sandbox
		const onWindowClick = sandbox.stub( global.window, 'onclick' );
	} );
} );
```

### Fake Clock

```js
import { useFakeTimers } from 'calypso/test-helpers/use-sinon';

describe( 'my time dependent test', function () {
	let clock;
	const aLongTimeAgo = Date.parse( '1976-09-15T010:00:00Z' ).valueOf();
	const yearInMillis = 1000 * 60 * 60 * 24 * 365;

	useFakeTimers( aLongTimeAgo, ( newClock ) => {
		clock = newClock;
	} );

	it( 'can access the fake clock via this', function () {
		assert.equals( Date.now(), aLongTimeAgo );
		clock.tick( yearInMillis );
		assert.equals( Date.now(), aLongTimeAgo + yearInMillis );
	} );
} );
```
