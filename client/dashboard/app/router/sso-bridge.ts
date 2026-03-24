import { ssoAuthorize } from '@automattic/api-core';
import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

interface SsoBridgeSearchParams {
	site_id?: string;
	sso_nonce?: string;
	action?: string;
	calypso_auth?: string;
	'broker-sso-auth-redirect'?: string;
}

export const ssoBridgeRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sso-bridge',
	validateSearch: ( search: Record< string, unknown > ): SsoBridgeSearchParams => ( {
		site_id: typeof search.site_id === 'string' ? search.site_id : undefined,
		sso_nonce: typeof search.sso_nonce === 'string' ? search.sso_nonce : undefined,
		action: typeof search.action === 'string' ? search.action : undefined,
		calypso_auth: typeof search.calypso_auth === 'string' ? search.calypso_auth : undefined,
		'broker-sso-auth-redirect':
			typeof search[ 'broker-sso-auth-redirect' ] === 'string'
				? search[ 'broker-sso-auth-redirect' ]
				: undefined,
	} ),
	beforeLoad: async ( { search } ) => {
		if ( search[ 'broker-sso-auth-redirect' ] === '1' ) {
			return;
		}

		const siteId = search.site_id;
		const ssoNonce = search.sso_nonce;

		if ( ! siteId || ! ssoNonce ) {
			throw new Error( 'Missing required parameters: site_id and sso_nonce' );
		}

		const data = await ssoAuthorize( siteId, ssoNonce );

		if ( ! data.sso_url || ! data.sso_url.startsWith( 'https://' ) ) {
			throw new Error( 'Received invalid SSO redirect URL' );
		}

		window.location.replace( data.sso_url );
		return new Promise( () => {} );
	},
} ).lazy( () =>
	import( '../sso-bridge' ).then( ( d ) =>
		createLazyRoute( '/sso-bridge' )( {
			component: d.default,
		} )
	)
);
