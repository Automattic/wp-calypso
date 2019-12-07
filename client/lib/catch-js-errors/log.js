/**
 * External dependencies
 */

import debugFactory from 'debug';

const debug = debugFactory( 'calypso:catch-js-errors:log' );
let logger = null;

/**
 * Save errorLogger Object to be used in log.
 * This is all tied together by `boot/index`. That lets us pull this file easily without importing
 * Everything from ./index on environments that don't support remote error logging or in SSR
 * @param  { Object } loggerObject
 */
export function registerLogger( loggerObject ) {
	logger = loggerObject;
}

export default function log( msg, data ) {
	debug( msg, data );
	if ( logger && logger.log ) {
		logger.log( msg, data );
	}
}
