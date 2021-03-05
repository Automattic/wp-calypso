# Async Script Loader

This utility function allows us to use a standardized method of loading remote scripts and injecting them into the `<head>` of our document to bring external functionality into the app.

## Usage

```js
import { loadScript, loadjQueryDependentScript } from '@automattic/load-script';
loadScript( REMOTE_SCRIPT_URL, function ( error ) {
	if ( error ) {
		debug( 'Script ' + error.src + ' failed to load.' );
		return;
	}
	debug( 'Script loaded!' );
} );

// if we need jQuery, this function will load it (if it's not loaded already)
loadjQueryDependentScript( REMOTE_SCRIPT_URL, function ( error ) {
	if ( error ) {
		debug( 'Script ' + error.src + ' failed to load.' );
		return;
	}
	debug( 'Script and jQuery are loaded!' );
} );
```

If the second argument (`callback`) is not provided, then `loadScript()` will return a Promise.

```js
loadScript( REMOTE_SCRIPT_URL )
	.then( function () {
		debug( 'Script loaded!' );
	} )
	.catch( function ( error ) {
		debug( 'Script ' + error.src + ' failed to load.' );
	} );
```

## Error handling

If using the callback, it should expect a single argument, which will be `null` on success or an object on failure. This error object contains the `src` property, which will contain the src url of the script that failed to load. If using the Promise form, the error object will be passed to the nearest `catch` handler as a rejection.
