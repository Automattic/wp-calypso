/**
 * External dependencies
 */
import debugModule from 'debug';
import xhr from 'wpcom-xhr-request';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:wpcom-xhr-wrapper' );

export default function( params, callback ) {
	return xhr( params, function( error, response, headers ) {
		if ( error && error.name === 'InvalidTokenError' ) {
			debug( 'Invalid token error detected, authorisation probably revoked - logging out' );
			require( 'lib/user/utils' ).logout();
		}

		callback( error, response, headers );
	} );
}
