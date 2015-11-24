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
	return xhr( params, function( error, response ) {
		if ( error ) {
			if ( error.response && typeof error.response.body ) {
				// Extend the error object in a way to match wpcom-proxy-request
				error.httpMessage = error.message;
				error.message = error.response.body.message;
				error.error = error.response.body.error;
				error.statusCode = error.status;
			}

			if ( error.error === 'invalid_token' ) {
				debug( 'Invalid token error detected, authorisation probably revoked - logging out' );
				require( 'lib/user/utils' ).logout();
			}
		}

		callback( error, response );
	} );
}
