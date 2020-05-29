/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:wpcom-xhr-wrapper' );

export default async function ( params, callback ) {
	const xhr = ( await import( /* webpackChunkName: "wpcom-xhr-request" */ 'wpcom-xhr-request' ) )
		.default;
	const userUtils = ( await import( /* webpackChunkName: "lib-user-utils" */ 'lib/user/utils' ) )
		.default;

	return xhr( params, function ( error, response, headers ) {
		if ( error && error.name === 'InvalidTokenError' ) {
			debug( 'Invalid token error detected, authorisation probably revoked - logging out' );
			userUtils.logout();
		}

		callback( error, response, headers );
	} );
}
