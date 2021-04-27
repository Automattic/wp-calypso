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
const REPORT_INTERVAL = 60000; // 1 minute

window.addEventListener(
	'error',
	throttle( ( { error } ) => {
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
	}, REPORT_INTERVAL )
);
