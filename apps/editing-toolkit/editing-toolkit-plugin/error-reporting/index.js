/**
 * External dependencies
 */
import TraceKit from 'tracekit';

/**
 * Internal dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Module variables
 */

/**
 * Interval for error reports so we don't flood te endpoint. More frequent
 * reports get throttled.
 *
 * @type {number}
 */
const REPORT_INTERVAL = 60000;

const diagnosticData = {
	user_id: 'todo-get-the-user-id',
	blog_id: 'todo-get-the-blog-id',
	extra: {
		throttled: 0,
	},
};

let lastReport = 0;

if ( ! window.onerror ) {
	TraceKit.report.subscribe( ( errorReport ) => {
		debugger;
		const error = {
			message: errorReport.message,
			url: document.location.href,
		};

		if ( Array.isArray( errorReport.stack ) ) {
			const trace = errorReport.stack.slice( 0, 10 );
			trace.forEach( ( report ) =>
				Object.keys( report ).forEach( ( key ) => {
					if ( key === 'context' && report[ key ] ) {
						report[ key ] = JSON.stringify( report[ key ] ).substring( 0, 256 );
					} else if ( typeof report[ key ] === 'string' && report[ key ].length > 512 ) {
						report[ key ] = report[ key ].substring( 0, 512 );
					} else if ( Array.isArray( report[ key ] ) ) {
						report[ key ] = report[ key ].slice( 0, 3 );
					}
				} )
			);
			if ( JSON.stringify( trace ).length < 8192 ) {
				error.trace = trace;
			}
		}

		const now = Date.now();
		if ( lastReport + REPORT_INTERVAL < now ) {
			lastReport = now;
			const data = new window.FormData();
			data.append( 'error', JSON.stringify( error ) );
			debugger;

			// https://public-api.wordpress.com/rest/v1.1/js-error'
			apiFetch( { path: '/rest/v1.1/js-error', method: 'POST', data } )
				.then( ( foo ) => {
					debugger;
					diagnosticData.extra.throttled = 0;
				} )
				.catch( () => console.error( 'Error: Unable to record the error in Logstash.' ) );
		} else {
			diagnosticData.extra.throttled++;
		}
	} );
}

throw new Error( 'BOOM!' );
