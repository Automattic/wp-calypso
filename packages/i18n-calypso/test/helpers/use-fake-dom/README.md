# Use fake DOM

##### Simulate DOM existence

When React is loaded, it performs a check to detect whether it's executing in
the context of a document.  Other libraries such as page.js also have code
specific to a document environment.

Therefore, when testing React components, using page.js routes, or otherwise
simulating a DOM using JSDOM, you must ensure that the document is initialized
prior to loading these libraries.

The purpose of this helper is to reduce this boilerplate and create the
expected global variables in a single call.  This helper also takes care of
cleaning the DOM when test suite is finished.

## Usage

```js
var useFakeDom = require( './helpers/use-fake-dom' );

describe( 'my test suite', function() {

	useFakeDom();

	it ( 'should work with DOM', function() {
		// code here can interact with DOM
	} );

} );

describe( 'my second suite', function() {
	it ( 'should not work with DOM', function() {
		// no DOM access in this suite
	} );
} );
```
