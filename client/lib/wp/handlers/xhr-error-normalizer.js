/**
 * External dependencies
 */
import wpcomXhrRequest from 'wpcom-xhr-request';
import debugFactory from 'debug';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:wpcom-handler' );

/**
 * Provides a wrapper around the `wpcom-xhr-request` library
 * so it returns errors in the same format as `wpcom-proxy-request`.
 *
 * @param {Object} params - request parameters
 * @param {Function} callback - request response callback
 * @return {Function} handler wrapper
 */
export function xhrErrorNormalizer( params, callback ) {
	return wpcomXhrRequest( params, ( error, response ) => {
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
