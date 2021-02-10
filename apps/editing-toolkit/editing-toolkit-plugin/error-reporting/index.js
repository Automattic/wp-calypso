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
const REPORT_INTERVAL = 1000; // 1 minute

/**
 * Errors that happened before this script had a chance to load
 * are captured in a global array. See `./index.php`.
 */
const headErrors = window._jsErr || [];
const headErrorHandler = window._headJsErrorHandler;

const reportError = throttle( ( { error } ) => {
	debugger;
	console.log( 'reporting error!', error.message );
	const data = {
		message: error.message,
		trace: error.stack,
		url: document.location.href,
		feature: 'wp-admin',
	};

	apiFetch( {
		global: true,
		path: '/rest/v1.1/js-error',
		method: 'POST',
		data: { error: JSON.stringify( data ) },
	} )
		// eslint-disable-next-line no-console
		.catch( () => console.error( 'Error: Unable to record the error in Logstash.' ) );
}, REPORT_INTERVAL );

window.addEventListener( 'error', reportError );
// Remove the head handler as it's not needed anymore after we set the main one above
window.removeEventListener( 'error', headErrorHandler );
// We still need to report the head errors, if any. If more than one, they will be throttled.
Promise.all( headErrors.map( reportError ) ).then( () => {
	// Cleanup the global head error variables
	delete window._jsErr;
	delete window._headJsErrorHandler;
} );

throw new Error( 'CORS error?' );
