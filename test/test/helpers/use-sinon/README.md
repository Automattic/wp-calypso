# Sinon Test Helpers
A set of helpers for folks using sinon to fake, mock, spy and bend time.

## Usage

### Full sandbox
```js
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'my tests that use a sandbox', function() {
	useSandbox();

	it( 'should have a full suite of sandbox things available', function() {
		// this will get torn down automatically by the sandbox
		const onWindowClick = this.sandbox.stub( global.window, 'onclick' );
	} );
} );

describe( 'my tests that use a sandbox and arrow functions', function() {
	let sandbox = null;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
	});

	it( 'should have a full suite of sandbox things available', () => {
		// this will get torn down automatically by the sandbox
		const onWindowClick = sandbox.stub( global.window, 'onclick' );
	} );
} );
```

### Fake Clock
```js
import { useFakeTimers } from 'test/helpers/use-sinon';

describe( 'my time dependent test', function() {
	const aLongTimeAgo = Date.parse( '1976-09-15T010:00:00Z' ).valueOf(),
		yearInMillis = 1000 * 60 * 60 * 24 * 365;

	useFakeTimers( aLongTimeAgo );

	it( 'can access the fake clock via this', function() {
		assert.equals( Date.now(), aLongTimeAgo );
		this.clock.tick( yearInMillis );
		assert.equals( Date.now(), aLongTimeAgo + yearInMillis );
	} );
} );

describe( 'my time dependent test that use a sandbox and arrow functions', () => {
	let clock;

	useFakeTimers( Date.now(), newClock => {
		clock = newClock;
	} );

	it( 'can use the clock via closure', () => {
		clock.tick( -5 );
	} );
} )

```
