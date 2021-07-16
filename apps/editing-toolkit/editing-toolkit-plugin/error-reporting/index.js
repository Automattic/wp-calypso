/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';

const shouldActivateSentry = window.dataFromPHP?.shouldActivateSentry === 'true';

function activateSentry() {
	console.debug( '[error-reporting] Activating Sentry!' );
	Sentry.init( {
		dsn: 'https://732ae01df1fe4974820b55d2c14028fa@o892859.ingest.sentry.io/5840079',
		integrations: [ new Integrations.BrowserTracing() ],

		// Set tracesSampleRate to 1.0 to capture 100%
		// of transactions for performance monitoring.
		// We recommend adjusting this value in production
		tracesSampleRate: 1.0,
	} );
}

// Activate the home-brew error-reporting
function activateHomebrewErrorReporting() {
	console.debug( '[error-reporting] Activating homebrew error-reporting!' );
	/**
	 * Errors that happened before this script had a chance to load
	 * are captured in a global array. See `./index.php`.
	 */
	const headErrors = window._jsErr || [];
	const headErrorHandler = window._headJsErrorHandler;

	const reportError = ( { error } ) => {
		// Sanitized error event objects do not include a nested error attribute. In
		// that case, we return early to prevent a needless TypeError when defining
		// `data`, below. Also, sanitized errors don't include any useful information,
		// so the sensible thing to do is to completely ignore them.
		if ( ! error ) {
			return;
		}

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
				// eslint-disable-next-line no-console
				.catch( () => console.error( 'Error: Unable to record the error in Logstash.' ) )
		);
	};

	window.addEventListener( 'error', reportError );

	// Remove the head handler as it's not needed anymore after we set the main one above
	window.removeEventListener( 'error', headErrorHandler );
	delete window._headJsErrorHandler;

	// We still need to report the head errors, if any.
	Promise.allSettled( headErrors.map( reportError ) ).then( () => delete window._jsErr );
}

if ( shouldActivateSentry ) {
	activateSentry();
} else {
	activateHomebrewErrorReporting();
}
