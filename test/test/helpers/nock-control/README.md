# Nock Control

##### A small utility to control `nock` during a test run.

We wrap all tests in the single test runner with nock to disable network access.
On occasion, we require network access as part of a test. This package includes one
function, `allowNetworkAccess`, which will enable network access for the duration of the describe block.

## Usage

```js
import { allowNetworkAccess } from 'test/helpers/nock-control';

describe( 'my test suite', () => {

	allowNetworkAccess();

	it ( 'should have network access', () = {
		// code here can touch the network
	} );

} );

describe( 'my second suite', () => {
	it ( 'should not have network access', () = {
		// no network access in this suite
	} );
} );
```
