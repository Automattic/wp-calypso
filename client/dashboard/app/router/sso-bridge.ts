import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
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
	beforeLoad: ( { search, cause } ) => {
		if ( cause !== 'enter' ) {
			return;
		}

		if ( search[ 'broker-sso-auth-redirect' ] === '1' ) {
			throw new Error( 'SSO authentication redirect is not supported.' );
		}

		const siteId = search.site_id;
		const ssoNonce = search.sso_nonce;

		if ( ! siteId || ! ssoNonce ) {
			throw new Error( 'Missing required parameters: site_id and sso_nonce' );
		}

		if ( ! /^\d+$/.test( siteId ) ) {
			throw new Error( 'Invalid site_id format' );
		}
	},
	component: lazyRouteComponent( () => import( '../sso-bridge' ) ),
	errorComponent: lazyRouteComponent( () => import( '../sso-bridge/error' ) ),
} );
