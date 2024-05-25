# Async Script Loader

This utility function allows us to use a standardized method of loading remote scripts and injecting them into the `<head>` of our document to bring external functionality into the app.

WARNING: external scripts might break the entire application in unpredictable ways. Please, make sure to read the **Error handling** section below and take the appropriate actions while developing and after deploying code that loads an external script.

## Usage

```js
import { loadScript, loadjQueryDependentScript } from '@automattic/load-script';

loadScript(
	REMOTE_SCRIPT_URL,
	function ( error ) {
		if ( error ) {
			debug( 'Script ' + error.src + ' failed to load.' );
			return;
		}
		debug( 'Script loaded!' );
	},
	{ id: 'my-script-tag-id' }
);

// if we need jQuery, this function will load it (if it's not loaded already)
loadjQueryDependentScript(
	REMOTE_SCRIPT_URL,
	function ( error ) {
		if ( error ) {
			debug( 'Script ' + error.src + ' failed to load.' );
			return;
		}
		debug( 'Script and jQuery are loaded!' );
	},
	{ id: 'my-script-tag-id' }
);
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

Use the optional third argument to pass arbitrary params for the script tag.

```js
await loadScript( REMOTE_SCRIPT_URL, undefined, { id: 'my-script-tag-id' } );
// Script tag id will be set to 'my-script-tag-id';
```

## Error handling

If using the callback, it should expect a single argument, which will be `null` on success or an object on failure. This error object contains the `src` property, which will contain the src url of the script that failed to load. If using the Promise form, the error object will be passed to the nearest `catch` handler as a rejection.

Important: we've historically had cases when external scripts broke the entire application. To prevent this from happening, there are a few things we could do:

### Implementing an error boundary

Wrapping the external script loading into an error boundary could help catch some of the errors. See [#62483](https://github.com/Automattic/wp-calypso/pull/62483) for prior art and ideally, use that technique when implementing the loading of the external script.

### Keep an eye on the logs

Since many error types wouldn't be caught by the error boundary, we should keep an eye on the logs for at least a few days after deploying a change related to loading an external script, especially when it's about a new script that we previously didn't load. See p58i-ch2-p2 for more details.
