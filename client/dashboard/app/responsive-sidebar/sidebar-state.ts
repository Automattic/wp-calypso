import type { AnyRouteMatch } from '@tanstack/react-router';

export type ScreenId = 'root' | 'site' | 'domain' | 'me';

export interface SidebarState {
	screen: ScreenId;
	param?: string;
}

const ROUTE_TO_SCREEN: Record< string, { screen: ScreenId; paramKey?: string } > = {
	'/sites/$siteSlug': { screen: 'site', paramKey: 'siteSlug' },
	'/domains/$domainName': { screen: 'domain', paramKey: 'domainName' },
	'/me': { screen: 'me' },
};

/**
 * Derives the active sidebar screen from the current router matches.
 */
export function getSidebarState( matches: AnyRouteMatch[], hasError: boolean ): SidebarState {
	if ( ! hasError ) {
		for ( const { routeId, params } of matches ) {
			const mapping = ROUTE_TO_SCREEN[ routeId ];
			if ( mapping ) {
				return {
					screen: mapping.screen,
					param: mapping.paramKey
						? ( params as Record< string, string > )[ mapping.paramKey ]
						: undefined,
				};
			}
		}
	}

	return { screen: 'root' };
}
