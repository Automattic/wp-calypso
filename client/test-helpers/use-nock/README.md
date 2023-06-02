# Use Nock

## Ensure `nock` unloads properly after tests are finished

`nock` allows you to intercept and mock network requests through a variety of filters and functions, providing such abilities as setting custom headers, HTTP response codes, and content.

Because it's possible to allow `nock` interceptions and modifiers to persist beyond a single test, this helper ensures that all of the changes are cleared out after the current tests finish.

`nock` is re-exported as a convenience so you don't have to import both `nock` and this module.

## Usage

```js
import useNock, { nock } from 'calypso/test-helpers/use-nock';

/*
//or
import { useNock, nock } from 'test-helpers/use-nock';

//or
import useNock from 'test-helpers/use-nock';
import nock from 'nock';
*/

describe( 'my test suite', () => {
	// call at the beginning of a describe block to
	// ensure a proper clean-up at the end
	useNock();

	it( 'is sloppy with a persistent nock', () => {
		nock( 'wordpress.com' ).persist().get( '/me' ).reply( 200, {
			id: 42,
			name: 'Leeroy Jenkins',
		} );

		expect( nock.isDone() ).to.be.false;
	} );

	it( 'persists beyond where it was used', () => {
		expect( nock.isDone() ).to.be.false;
	} );
} );

describe( 'my second suite', () => {
	it( 'has cleared out any remaining nock interceptions', () => {
		expect( nock.isDone() ).to.be.true;
	} );
} );
```
