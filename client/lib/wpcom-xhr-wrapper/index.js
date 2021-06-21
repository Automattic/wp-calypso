/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import user from 'calypso/lib/user';
import { getLogoutUrl } from 'calypso/lib/user/shared-utils';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:wpcom-xhr-wrapper' );

export default async function ( params, callback ) {
	const xhr = ( await import( /* webpackChunkName: "wpcom-xhr-request" */ 'wpcom-xhr-request' ) )
		.default;

	return xhr( params, function ( error, response, headers ) {
		if ( error && error.name === 'InvalidTokenError' ) {
			debug( 'Invalid token error detected, authorization probably revoked - logging out' );

			const logoutUrl = getLogoutUrl( user().get() );
			// Clear any data stored locally within the user data module or localStorage
			user()
				.clear()
				.then( () => {
					window.location.href = logoutUrl;
				} );
		}

		callback( error, response, headers );
	} );
}
