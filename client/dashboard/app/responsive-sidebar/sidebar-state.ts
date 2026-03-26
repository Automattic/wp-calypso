import type { AnyRouteMatch } from '@tanstack/react-router';

export type ScreenId = 'root' | 'site' | 'domain' | 'me';

export interface SidebarState {
	screen: ScreenId;
	param?: string;
}

// Route IDs match the paths defined in the router (e.g., createRoute({ path: 'sites/$siteSlug' })).
const SITE_ROUTE_ID = '/sites/$siteSlug';
const DOMAIN_ROUTE_ID = '/domains/$domainName';
const ME_ROUTE_ID = '/me';

/**
 * Derives the active sidebar screen from the current router matches.
 *
 * When `hasError` is true the sidebar falls back to the root screen so the
 * user can navigate away from the broken route.
 */
export function getSidebarState( matches: AnyRouteMatch[], hasError: boolean ): SidebarState {
	if ( hasError ) {
		return { screen: 'root' };
	}

	for ( const match of matches ) {
		if ( match.routeId === SITE_ROUTE_ID ) {
			return { screen: 'site', param: ( match.params as { siteSlug: string } ).siteSlug };
		}
		if ( match.routeId === DOMAIN_ROUTE_ID ) {
			return { screen: 'domain', param: ( match.params as { domainName: string } ).domainName };
		}
		if ( match.routeId === ME_ROUTE_ID ) {
			return { screen: 'me' };
		}
	}

	return { screen: 'root' };
}
