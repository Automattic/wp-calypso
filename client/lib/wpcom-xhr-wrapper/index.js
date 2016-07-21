/**
 * External dependencies
 */
import xhr from 'wpcom-xhr-request';
import debugModule from 'debug';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:wpcom-xhr-wrapper' );

export default function( params, callback ) {
	return xhr( params, function( error, response, headers ) {
		if ( error && error.error === 'invalid_token' ) {
			debug( 'Invalid token error detected, authorisation probably revoked - logging out' );
			require( 'lib/user/utils' ).logout();
		}

		callback( error, response, headers );
	} );
}
