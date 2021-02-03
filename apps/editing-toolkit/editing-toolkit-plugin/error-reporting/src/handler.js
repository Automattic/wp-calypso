/**
 * Module variables
 */

/**
 * Interval for error reports so we don't flood te endpoint. More frequent
 * reports get throttled. If a request is made within this ms window, then
 * it will be ignored and not sent, and the throttled counter will be incremented.
 *
 * @type {number} throttling interval (since the last request) in milliseconds.
 */
const REPORT_INTERVAL = 60000; //1 minute

let throttled = 0;
let lastReport = 0;

/**
 * Returns a callback handler for use with the window.onerror event.-white
 *
 * The fetch function is injected. This makes it easier to test the handler.
 *
 * TODO Better document the shape of apiFetch here
 *
 * @param apiFetch
 */
export default function ( apiFetch ) {
	return function ( message, scriptUrl, lineNo, columnNo ) {
		const error = {
			message,
			script: `${ scriptUrl }:${ lineNo }:${ columnNo }`,
			url: document.location.href,
			feature: 'wp-admin',
			extra: {
				throttled,
			},
		};

		const now = Date.now();
		if ( lastReport + REPORT_INTERVAL < now ) {
			lastReport = now;

			console.log( 'foo' );

			apiFetch( {
				global: true,
				path: '/rest/v1.1/js-error',
				method: 'POST',
				data: { error: JSON.stringify( error ) },
			} )
				.then( () => {
					throttled = 0;
				} )
				// eslint-disable-next-line no-console
				.catch( () => console.error( 'Error: Unable to record the error in Logstash.' ) );
		} else {
			console.log( 'Throttled!', throttled );

			throttled++;
		}
	};
}
