# Use fake DOM

##### Simulate DOM existence 

When React is loaded, it performs a check to detect whether it's executing in the context of a document.
Therefore, when testing React components or otherwise simulating a DOM using JSDOM, you must ensure that the document is initialized prior to loading React.
The purpose of this helper is to reduce this boilerplate and create the expected global variables in a single call.
This helper also takes care about cleaning DOM when test suite is finished.

## Usage

```js
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'my test suite', () => {

	useFakeDom();

	it ( 'should work with DOM', () = {
		// code here can interact with DOM
	} );

} );

describe( 'my second suite', () => {
	it ( 'should not work with DOM', () = {
		// no DOM access in this suite
	} );
} );
```
