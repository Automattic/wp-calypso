/**
 * Internal dependencies
 */
import { logToLogstash } from 'calypso/state/logstash/actions';
import config from 'calypso/config';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export function logStashLoadErrorEventAction( errorType, errorMessage, additionalData = {} ) {
	return logStashEventAction( 'composite checkout load error', {
		...additionalData,
		type: errorType,
		message: errorMessage,
	} );
}

export function logStashEventAction( message, dataForLog = {} ) {
	return logToLogstash( {
		feature: 'calypso_client',
		message,
		severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
		extra: {
			env: config( 'env_id' ),
			...dataForLog,
		},
	} );
}

export function recordCompositeCheckoutErrorDuringAnalytics( {
	errorObject,
	failureDescription,
	reduxDispatch,
} ) {
	// This is a fallback to catch any errors caused by the analytics code
	// Anything in this block should remain very simple and extremely
	// tolerant of any kind of data. It should make no assumptions about
	// the data it uses. There's no fallback for the fallback!
	reduxDispatch(
		recordTracksEvent( 'calypso_checkout_composite_error', {
			error_message: errorObject.message,
			action_type: failureDescription,
		} )
	);
	reduxDispatch(
		logStashLoadErrorEventAction( 'calypso_checkout_composite_error', errorObject.message, {
			action_type: failureDescription,
		} )
	);
}
