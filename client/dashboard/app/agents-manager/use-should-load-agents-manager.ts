import { isFullscreenRequested } from '@automattic/agents-manager/src/utils/is-fullscreen-requested';
import { bigSkyPluginQuery, queryClient } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

interface AgentsManagerRoute {
	pattern: RegExp;
	isInternalOnly: boolean;
}

export interface AgentsManagerEligibility {
	routeIsEnabled: boolean;
	isInternalOnly: boolean;
}

function isMarketplaceRoute( route?: string | null ): boolean {
	const path = route?.split( '?' )[ 0 ];
	if (
		! path ||
		/^\/plugins\/(manage|upload|setup|scheduled-updates|active|inactive|updates|plans)(\/|$)/.test(
			path
		)
	) {
		return false;
	}

	return (
		/^\/plugins\/?$/.test( path ) ||
		/^\/plugins\/browse\/[^/]+(?:\/[^/]+)?\/?$/.test( path ) ||
		/^\/plugins\/(?!browse(?:\/|$))[^/]+(?:\/[^/]+)?\/?$/.test( path )
	);
}

const ENABLED_ROUTES: AgentsManagerRoute[] = [
	{ pattern: /^\/sites\/[^/]+\/?$/, isInternalOnly: true },
];

export function getAgentsManagerEligibility(
	currentRoute: string | null | undefined,
	isWordPressAgentEnabled: boolean,
	isMarketplace = false
): AgentsManagerEligibility {
	if ( isMarketplace && isMarketplaceRoute( currentRoute ) ) {
		return { routeIsEnabled: true, isInternalOnly: false };
	}

	const route = currentRoute
		? ENABLED_ROUTES.find( ( candidate ) => candidate.pattern.test( currentRoute ) )
		: undefined;
	const isInternalOnly = route?.isInternalOnly ?? false;

	return {
		routeIsEnabled:
			!! route &&
			isWordPressAgentEnabled &&
			( ! isInternalOnly || isEnabled( 'calypso/agents-manager-internal' ) ),
		isInternalOnly,
	};
}

export default function useShouldLoadAgentsManager(
	currentRoute?: string | null,
	siteId?: number | null,
	isMarketplace = false
): AgentsManagerEligibility {
	const isFullscreen =
		isFullscreenRequested() && isEnabled( 'calypso/agents-manager-internal' ) && !! siteId;
	const routeEligibility = useMemo(
		() => getAgentsManagerEligibility( currentRoute, true, isMarketplace ),
		[ currentRoute, isMarketplace ]
	);
	const { data: pluginStatus } = useQuery(
		{
			...bigSkyPluginQuery( siteId ?? 0 ),
			enabled:
				! isFullscreen &&
				routeEligibility.routeIsEnabled &&
				! isMarketplaceRoute( currentRoute ) &&
				!! siteId,
			staleTime: 5 * 60 * 1000,
		},
		queryClient
	);

	if ( isFullscreen ) {
		return { routeIsEnabled: true, isInternalOnly: true };
	}

	return {
		...routeEligibility,
		routeIsEnabled:
			routeEligibility.routeIsEnabled &&
			( isMarketplaceRoute( currentRoute ) || pluginStatus?.enabled === true ),
	};
}
