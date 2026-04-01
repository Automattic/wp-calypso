import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { rootRoute } from './root';

export interface SsoBridgeSearchParams {
	sso_error?: string;
}

export const ssoBridgeRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sso-bridge',
	validateSearch: ( search: Record< string, unknown > ): SsoBridgeSearchParams => ( {
		sso_error: search.sso_error != null ? String( search.sso_error ) : undefined,
	} ),
	component: lazyRouteComponent( () => import( '../sso-bridge' ) ),
} );
