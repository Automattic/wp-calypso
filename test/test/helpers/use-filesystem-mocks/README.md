# Use Filesystem Mocks

##### Load mocks from the filesystem

Setting up test doubles using `mockery` can be a bit of a pain. This utility loads mocks based on path from the filesystem. It looks for `js` or `jsx` files in folders under the specified directory and sets them up as substitutes

## Usage

Assume we have a directory layout of
```
my-thing
- index.js
- test
  - my-test.js
	- lib
	  - network.js
```

##### my-thing/index.js
```js
import network from 'lib/network';

export function doThingThatUsesLibNetwork() {
	return network.fetch().then( ... );
}
```

##### test/lib/network.js
```js
// my fake fetcher that always works
export function fetch( url ) {
	return Promise.resolve( { success: true } );
}
```

##### test/my-test.js
```js
import useFilesystemMocks from 'test/helpers/use-filesystem-mocks';

describe('my test suite', () = {
	let myThing;
	useFilesystemMocks( __dirname ); // have to pass the current directory!

	before( function() {
		// have to re-require this after mockery has loaded
		myThing = require( '../' );
	} );

	it ( 'should have network access', () = {
		myThing.doThingThatUsesLibNetwork();
	} );

} );
```
