import { ssoAuthorize } from '@automattic/api-core';
import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

export interface SsoBridgeSearchParams {
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
		site_id: search.site_id != null ? String( search.site_id ) : undefined,
		sso_nonce: search.sso_nonce != null ? String( search.sso_nonce ) : undefined,
		action: search.action != null ? String( search.action ) : undefined,
		calypso_auth: search.calypso_auth != null ? String( search.calypso_auth ) : undefined,
		'broker-sso-auth-redirect':
			search[ 'broker-sso-auth-redirect' ] != null
				? String( search[ 'broker-sso-auth-redirect' ] )
				: undefined,
	} ),
	beforeLoad: async ( { search, cause } ) => {
		if ( cause !== 'enter' ) {
			return;
		}

		if ( search[ 'broker-sso-auth-redirect' ] === '1' ) {
			return;
		}

		const siteId = search.site_id;
		const ssoNonce = search.sso_nonce;

		if ( ! siteId || ! ssoNonce ) {
			throw new Error( 'Missing required parameters: site_id and sso_nonce' );
		}

		if ( ! /^\d+$/.test( siteId ) ) {
			throw new Error( 'Invalid site_id format' );
		}

		const data = await ssoAuthorize( Number( siteId ), ssoNonce );

		if ( ! data.sso_url ) {
			throw new Error( 'Received invalid SSO redirect URL' );
		}

		let ssoUrl: URL;
		try {
			ssoUrl = new URL( data.sso_url );
		} catch {
			throw new Error( 'Received invalid SSO redirect URL' );
		}

		if ( ssoUrl.protocol !== 'https:' ) {
			throw new Error( 'Received invalid SSO redirect URL' );
		}

		window.location.replace( ssoUrl.toString() );
		return new Promise( () => {} );
	},
} ).lazy( () =>
	import( '../sso-bridge' ).then( ( d ) =>
		createLazyRoute( 'sso-bridge' )( {
			component: d.default,
		} )
	)
);
