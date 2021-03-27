/**
 * Wordpress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * External dependences
 */
import { throttle } from 'lodash';

/**
 * Interval for error reports so we don't flood te endpoint.
 *
 * @type {number} throttling interval (since the last request) in milliseconds.
 */
const REPORT_INTERVAL = 3000; // change to 1 minute

/**
 * Errors that happened before this script had a chance to load
 * are captured in a global array. See `./index.php`.
 */
const headErrors = window._jsErr || [];
const headErrorHandler = window._headJsErrorHandler;

console.log( 'headErrors: ', headErrors );

const reportError = ( { error } ) => {
	// This is debug code and will be removed later.
	console.log( `reportError()`, error );
	if ( ! error ) {
		console.log(
			'Ooopsie, we just got a sanitized "Script Error.". I hope you were expecting it! :)'
		);
		return;
	}
	console.log( 'about to trigger error for: ' + error.message );
	const data = {
		message: error.message,
		trace: error.stack,
		url: document.location.href,
		feature: 'wp-admin',
	};

	return (
		apiFetch( {
			global: true,
			path: '/rest/v1.1/js-error',
			method: 'POST',
			data: { error: JSON.stringify( data ) },
		} )
			.then( () => console.log( 'Reported Error!', error.message ) )
			// eslint-disable-next-line no-console
			.catch( () => console.error( 'Error: Unable to record the error in Logstash.' ) )
	);
};

window.addEventListener( 'error', throttle( reportError, REPORT_INTERVAL ) );
// Remove the head handler as it's not needed anymore after we set the main one above
window.removeEventListener( 'error', headErrorHandler );
delete window._headJsErrorHandler;

// We still need to report the head errors, if any. Since we know we might have more then
// one error at once here, we send them to the API endpoint one at a time after REPORT_INTERVAL has passed
// between each call.
headErrors
	.map( ( e ) => () => reportError( e ) )
	.reduce(
		( p, fn ) =>
			p.then( () => new Promise( ( r ) => setTimeout( r, REPORT_INTERVAL ) ).then( fn ) ),
		Promise.resolve()
	)
	.then( () => delete window._jsErr );

// This will be removed when the testing phase finishes.
/*setInterval( function () {
	throw new Error( 'Throttled error!' );
}, 1000 );*/
