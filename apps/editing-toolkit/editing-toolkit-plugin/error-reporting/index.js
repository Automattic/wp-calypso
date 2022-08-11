import * as Sentry from '@sentry/browser';
import apiFetch from '@wordpress/api-fetch';
import { addAction } from '@wordpress/hooks';

const shouldActivateSentry = window.A8C_ETK_ErrorReporting_Config?.shouldActivateSentry === 'true';

/**
 * Errors that happened before this script had a chance to load
 * are captured in a global array. See `./index.php`.
 */
const headErrors = window._jsErr || [];
const headErrorHandler = window._headJsErrorHandler;

function activateSentry() {
	const SENTRY_RELEASE_NAME = window.A8C_ETK_ErrorReporting_Config.releaseName;

	Sentry.init( {
		dsn: 'https://658ae291b00242148af6b76494d4a49a@o248881.ingest.sentry.io/5876245',
		release: SENTRY_RELEASE_NAME,
	} );

	// Capture exceptions from Gutenberg React Error Boundaries
	addAction( 'editor.ErrorBoundary.errorLogged', 'etk/error-reporting', ( error ) => {
		// error is the exception's error object
		Sentry.captureException( error );
	} );

	// We still need to report the head errors, if any.
	headErrors.forEach( ( error ) => Sentry.captureException( error ) );
	Sentry.flush().then( () => delete window._jsErr );
}

// Activate the home-brew error-reporting
function activateHomebrewErrorReporting() {
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

	// We still need to report the head errors, if any.
	Promise.allSettled( headErrors.map( reportError ) ).then( () => delete window._jsErr );
}

if ( shouldActivateSentry ) {
	activateSentry();
} else {
	activateHomebrewErrorReporting();
}

// Remove the head handler as it's not needed anymore after we set the main one above (either Sentry or homebrew)
window.removeEventListener( 'error', headErrorHandler );
delete window._headJsErrorHandler;
