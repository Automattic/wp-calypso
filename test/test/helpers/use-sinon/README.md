# Sinon Test Helpers
A set of helpers for folks using sinon to fake, mock, spy and bend time

## Usage

### Fake Clock
```js
import { useFakeTimers } from 'test/helpers/use-sinon';

describe( function() {
	const aLongTimeAgo = Date.parse( '1976-09-15T010:00:00Z' ).valueOf(),
		yearInMillis = 1000 * 60 * 60 * 24 * 365;
	useFakeTimers( aLongTimeAgo );

	it( 'can access the fake clock via this', function() {
		assert.equals( Date.now(), aLongTimeAgo );
		this.clock.tick( yearInMillis );
		assert.equals( Date.now(), aLongTimeAgo + yearInMillis );
	} );

	context( 'if I want to use arrow functions', () => {
		let clock;
		useFakeTimers( Date.now() ) newClock => {
			clock = newClock;
		} );

		it( 'can use the clock via closure', () => {
			clock.tick( -5 );
		} );
	} );
} )

```
