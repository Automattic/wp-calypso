/**
 * External dependencies
 */
import debugFactory from 'debug';
import { get } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import { getSavedPath } from 'lib/restore-last-path';

const debug = debugFactory( 'calypso:restore-last-location' );

export function sessionRestore( context, next ) {
	const querystring = get( context, 'querystring', '' );
	if ( querystring.length ) {
		debug( 'cannot restore: has query string' );
		return next();
	}

	// Attempt to restore the last path on the first run
	getSavedPath()
		.then( ( lastPath ) => {
			debug( 'restoring: ' + lastPath );
			page( lastPath );
		} )
		.catch( ( reason ) => {
			debug( 'cannot restore', reason );
			next();
		} );
}
