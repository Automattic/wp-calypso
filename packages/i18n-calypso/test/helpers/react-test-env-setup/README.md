React Test Environment Setup
============================

When React is loaded, it performs a check to detect whether it's executing in the context of a document. Therefore, when testing React components or otherwise simulating a DOM using JSDOM, you must ensure that the document is initialized prior to loading React. The purpose of this module is to reduce this boilerplate and create the expected global variables in a single call.

## Usage

The module exports a single function which accepts an optional markup string to be passed to JSDOM. You'll likely want to require the module as the first line of your script, so that the globals are available to any subsequent modules that may depend on their existance.

```js
require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var React = require( 'react' );

// ...
```

By default, a fully functional `localStorage` and noop `XMLHttpRequest` will be added to the global scope. One or both of these can be disabled by passing an additional `features` option when calling the module.

```js
require( 'lib/react-test-env-setup' )( null, {
	localStorage: false
} );
```
