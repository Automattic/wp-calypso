( function() {
	var savedWindowOnError = window.onerror,
		assignment = 1,
		errorLogger = 'false',
		savedErrors = [],
		lastTimeSent = 0,
		packTimeout = null,
		THROTTLE_DURATION = 10000,
		MAX_BUFFER_SIZE = 10000;

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
			url = ( window.location && window.location.href ) ? window.location.href + ' ' : '',
			params;

		if ( savedErrors.length > 0 ) {
			// POST to the API
			xhr.open( 'POST', 'https://public-api.wordpress.com/rest/v1.1/js-error?http_envelope=1', true );
			xhr.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );

			params = 'client_id=39911&client_secret=cOaYKdrkgXz8xY7aysv4fU6wL6sK5J8a6ojReEIAPwggsznj4Cb6mW0nffTxtYT8&error=';
			params += encodeURIComponent( url + JSON.stringify( savedErrors ) );
			//Window.location.href is hached in here, because backend has a char limit for now.

			xhr.send( params );

			savedErrors = [];
		}
	}

	function errorToPlainObject( error ) {
		var simpleObject = {};
		Object.getOwnPropertyNames( error ).forEach( function( key ) {
			simpleObject[ key ] = error[ key ];
		} );
		return simpleObject;
	}

	function handleError( error ) {
		var canSendNow;

		// if we have packed too much messages, it's probably good to stop stacking more and drop new messages while the buffer is flushed
		if ( savedErrors.length > MAX_BUFFER_SIZE ) {
			return;
		}

		// we can send a message we have waited long enough (because we are throttling)
		canSendNow = +new Date() - lastTimeSent > THROTTLE_DURATION;

		// add the message to the pack and reset flush timeout
		clearTimeout( packTimeout );
		savedErrors.push( errorToPlainObject( error ) );

		// if we can send the pack now, let's do it
		if ( canSendNow ) {
			flushErrors();
		} else {
			// else set a timeout to ensure message is sent at least THROTTLE_DURATION after it happened
			// This is needed as a message could otherwise stay in the pack forever if no message comes afterwards
			packTimeout = setTimeout( function() {
				flushErrors();
			}, THROTTLE_DURATION );
		}
	}

	function flushErrors() {
		lastTimeSent = +new Date();
		sendErrorsToApi();
	}

	function saveError( message, scriptUrl, lineNumber, columnNumber, error ) {
		error = error || new Error( message );

		// Add user agent if we have it
		if ( navigator && navigator.userAgent ) {
			error.userAgent = navigator.userAgent;
		}

		handleError( error );
	}

	if ( isLocalStorageNameSupported() ) {
		assignment = Math.random();
		errorLogger = localStorage.getItem( 'log-errors' );
		// Randomly assign 1% of users to log errors
		if ( ! errorLogger ) {
			if ( assignment <= 0.01 ) {
				localStorage.setItem( 'log-errors', 'rest-api' );
				errorLogger = 'rest-api';
			} else if ( assignment <= 0.02 ) {
				localStorage.setItem( 'log-errors', 'analytics' );
				errorLogger = 'analytics';
			} else if ( assignment <= 0.03 ) {
				localStorage.setItem( 'log-errors', 'external' );
				//Prep the stage up for Google Stackdriver or other service experiment
			} else {
				localStorage.setItem( 'log-errors', 'false' );
			}
		}

		if ( errorLogger === 'true' ) {
			//Fix up any outstanding old settings
			localStorage.setItem( 'log-errors', 'rest-api' );
			errorLogger = 'rest-api';
		}

		if ( errorLogger === 'rest-api' ) {
			// set up handler to POST errors
			window.onerror = function( message, scriptUrl, lineNumber, columnNumber, error ) {
				saveError( message, scriptUrl, lineNumber, columnNumber, error );
				if ( savedWindowOnError ) {
					savedWindowOnError();
				}
			};
		} else if ( errorLogger === 'analytics' ) {
			window.onerror = function( message, scriptUrl, lineNumber ) {
				if ( typeof window.ga === 'function' ) {
					window.ga(
						'send',
						'event',
						'JS Error',
						message,
						'URL: ' + document.location.href + '| ' + scriptUrl + ':' + lineNumber,
						0,
						{ nonInteraction: true }
					);
				}
				if ( savedWindowOnError ) {
					savedWindowOnError();
				}
			};
		}
	}
}() );
