( function() {
	var savedWindowOnError = window.onerror,
		savedErrors = [],
		sendingErrorsToApi;

	// Props http://stackoverflow.com/a/20405830/379063
	function stringifyErrorForUrlParams( error, index ) {
		var simpleObject = {};
		Object.getOwnPropertyNames( error ).forEach( function( key ) {
			simpleObject[ key + index ] = encodeURIComponent( error[ key ] );
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

	function sendErrorsToApi() {
		var xhr = new XMLHttpRequest(),
			params;

		if ( savedErrors.length > 0 ) {
			// POST to the API
			xhr.open( 'POST', 'https://public-api.wordpress.com/rest/v1.1/js-error?http_envelope=1', true );
			xhr.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );

			params = 'client_id=39911&client_secret=cOaYKdrkgXz8xY7aysv4fU6wL6sK5J8a6ojReEIAPwggsznj4Cb6mW0nffTxtYT8&error=';

			params += savedErrors.map( function( error, index ) {
				return stringifyErrorForUrlParams( error, index );
			} );

			xhr.setRequestHeader( 'Content-length', params.length );
			xhr.setRequestHeader( 'Connection', 'close' );
			xhr.send( params );

			savedErrors = [];
		}
	}

	function startSendingErrorsToApi() {
		if ( ! sendingErrorsToApi ) {
			sendingErrorsToApi = setInterval( function() {
				sendErrorsToApi();
			}, 10000 );
		}
	}

	function saveError( message, scriptUrl, lineNumber, columnNumber, error ) {
		error = error || new Error( message );

		// Add user agent if we have it
		if ( navigator && navigator.userAgent ) {
			error.userAgent = navigator.userAgent;
		}

		savedErrors.push( error );
	}

	if ( isLocalStorageNameSupported() ) {
		// Randomly assign 1% of users to log errors
		if ( localStorage.getItem( 'log-errors' ) === undefined ) {
			if ( Math.random() <= 0.01 ) {
				localStorage.setItem( 'log-errors', 'true' );
			} else {
				localStorage.setItem( 'log-errors', 'false' );
			}
		}

		if ( localStorage.getItem( 'log-errors' ) !== undefined && localStorage.getItem( 'log-errors' ) === 'true' ) {
			// set up handler to POST errors
			window.onerror = function( message, scriptUrl, lineNumber, columnNumber, error ) {
				saveError( message, scriptUrl, lineNumber, columnNumber, error );
				startSendingErrorsToApi();
				if ( savedWindowOnError ) {
					savedWindowOnError();
				}
			}
		}
	}
}() );
