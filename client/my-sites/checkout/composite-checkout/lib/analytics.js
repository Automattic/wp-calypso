/**
 * Internal dependencies
 */
import { logToLogstash } from 'calypso/state/logstash/actions';
import config from 'calypso/config';

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
