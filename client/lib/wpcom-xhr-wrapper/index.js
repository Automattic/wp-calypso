/**
 * Internal dependencies
 */
import { getLogoutUrl } from 'calypso/lib/user/shared-utils';

export default async function ( params, callback ) {
	const xhr = ( await import( /* webpackChunkName: "wpcom-xhr-request" */ 'wpcom-xhr-request' ) )
		.default;

	return xhr( params, function ( error, response, headers ) {
		if ( error && error.name === 'InvalidTokenError' ) {
			window.location.href = getLogoutUrl();
		}

		callback( error, response, headers );
	} );
}
