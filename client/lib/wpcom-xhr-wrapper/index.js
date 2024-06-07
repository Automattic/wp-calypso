import config from '@automattic/calypso-config';
import { getLogoutUrl } from 'calypso/lib/user/shared-utils';
import { clearStore } from 'calypso/lib/user/store';

// For Calypso in Jetpack, these API namespaces are accessed from the site, not from wp.com.
const LOCAL_API_NAMESPACES = [ 'jetpack/v4', 'my-jetpack/v1', 'jetpack/v4/blaze-app' ];

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

export async function jetpack_site_xhr_wrapper( params, callback ) {
	const xhr = ( await import( /* webpackChunkName: "wpcom-xhr-request" */ 'wpcom-xhr-request' ) )
		.default;

	params = {
		...params,
		proxyOrigin: config( 'api_root' ),
		headers: {
			'X-WP-Nonce': config( 'nonce' ),
		},
		isRestAPI: false,
		apiNamespace:
			LOCAL_API_NAMESPACES.includes( params.apiNamespace ) || params.isLocalApiCall
				? params.apiNamespace
				: 'jetpack/v4/stats-app',
	};

	return xhr( params, async function ( error, response, headers ) {
		if ( error && error.name === 'InvalidTokenError' ) {
			await clearStore();
		}

		callback( error, response, headers );
	} );
}
