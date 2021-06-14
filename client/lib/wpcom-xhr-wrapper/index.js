/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import { redirectToLogout } from 'calypso/lib/user/shared-utils';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:wpcom-xhr-wrapper' );

export default async function ( params, callback ) {
	const xhr = ( await import( /* webpackChunkName: "wpcom-xhr-request" */ 'wpcom-xhr-request' ) )
		.default;

	return xhr( params, function ( error, response, headers ) {
		if ( error && error.name === 'InvalidTokenError' ) {
			debug( 'Invalid token error detected, authorisation probably revoked - logging out' );
			redirectToLogout();
		}

		callback( error, response, headers );
	} );
}
