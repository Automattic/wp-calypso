( function() {
	var savedWindowOnError = window.onerror;

	// Props http://stackoverflow.com/a/20405830/379063
	function stringifyErrorForUrlParams( error ) {
		var simpleObject = {};
		Object.getOwnPropertyNames( error ).forEach( function( key ) {
			simpleObject[ key ] = encodeURIComponent( error[ key ] );
		} );
		return JSON.stringify( simpleObject );
	};

	// Props http://stackoverflow.com/a/17604754/379063
	function isLocalStorageNameSupported() {
		var testKey = 'test',
			storage = window.localStorage;
		try {
			storage.setItem( testKey, '1' );
			storage.removeItem( testKey );
			return true;
		} catch ( error ) {
			return false;
		}
	}

	/**
	 * Throttle function by delay ms
	 *
	 * @param {function} fn wrapped function
	 * @param {number} delay minimum debounce time in ms
	 * @returns {function} a callback
	 */
	function debounce( fn, delay ) {
		var lastCall = Date.now();

		return function() {
			var now = Date.now();

			if ( ( now - lastCall ) < delay ) {
				return;
			}

			lastCall = now;
			fn.apply( null, arguments );
		}
	}

	function sendErrorsToApi( message, scriptUrl, lineNumber, columnNumber, error ) {
		var xhr = new XMLHttpRequest(),
			params;

		error = error || new Error( message );

		// Add user agent if we have it
		if ( navigator && navigator.userAgent ) {
			error.userAgent = navigator.userAgent;
		}

		// POST to the API
		xhr.open( 'POST', 'https://public-api.wordpress.com/rest/v1.1/js-error?http_envelope=1', true );
		xhr.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );

		params = 'client_id=39911&client_secret=cOaYKdrkgXz8xY7aysv4fU6wL6sK5J8a6ojReEIAPwggsznj4Cb6mW0nffTxtYT8&error=' + stringifyErrorForUrlParams( error );
		xhr.send( params );
	}

	if ( isLocalStorageNameSupported() ) {
		// Randomly assign 1% of users to log errors
		if ( localStorage.getItem( 'log-errors' ) === undefined && Math.random() <= 0.01 ) {
			localStorage.setItem( 'log-errors', 'true' );
		} else {
			localStorage.setItem( 'log-errors', 'false' );
		}

		if ( localStorage.getItem( 'log-errors' ) !== undefined && localStorage.getItem( 'log-errors' ) === 'true' ) {
			// set up handler to POST errors
			window.onerror = debounce( function( message, scriptUrl, lineNumber, columnNumber, error ) {
				sendErrorsToApi( message, scriptUrl, lineNumber, columnNumber, error );
				savedWindowOnError();
			}, 100 );
		}
	}
}() );
