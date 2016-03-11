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

	it( 'can access the fake clock', function() {
		assert.equals( Date.now().valueOf(), aLongTimeAgo );
		this.clock.tick( 1000 * 60 * 24 * 365 );
		assert.equals( Date.now().valueOf(), aLongTimeAgo + yearInMillis );
	})
} )

```
