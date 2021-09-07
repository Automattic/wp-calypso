import { getLogoutUrl } from 'calypso/lib/user/shared-utils';
import { clearStore } from 'calypso/lib/user/store';

export default async function ( params, callback ) {
	const xhr = ( await import( /* webpackChunkName: "wpcom-xhr-request" */ 'wpcom-xhr-request' ) )
		.default;

	return xhr( params, async function ( error, response, headers ) {
		if ( error && error.name === 'InvalidTokenError' ) {
			await clearStore();
			window.location.href = getLogoutUrl();
		}

		callback( error, response, headers );
	} );
}
