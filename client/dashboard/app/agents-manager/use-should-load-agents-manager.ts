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

const ENABLED_ROUTES: AgentsManagerRoute[] = [
	{ pattern: /^\/sites\/[^/]+\/?$/, isInternalOnly: true },
	{ pattern: /^\/plugins\/?$/, isInternalOnly: false },
	{
		pattern: /^\/plugins\/browse\/[^/]+(?:\/[^/]+)?\/?$/,
		isInternalOnly: false,
	},
	{
		pattern:
			/^\/plugins\/(?!(?:browse|manage|upload|setup|scheduled-updates|active|inactive|updates|plans)(?:\/|$))[^/]+(?:\/[^/]+)?\/?$/,
		isInternalOnly: false,
	},
];

export function getAgentsManagerEligibility(
	currentRoute: string | null | undefined,
	isWordPressAgentEnabled: boolean
): AgentsManagerEligibility {
	const path = currentRoute?.split( '?' )[ 0 ];
	const route = path
		? ENABLED_ROUTES.find( ( candidate ) => candidate.pattern.test( path ) )
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
	siteId?: number | null
): AgentsManagerEligibility {
	const routeEligibility = useMemo(
		() => getAgentsManagerEligibility( currentRoute, true ),
		[ currentRoute ]
	);
	const { data: pluginStatus } = useQuery(
		{
			...bigSkyPluginQuery( siteId ?? 0 ),
			enabled: routeEligibility.routeIsEnabled && !! siteId,
			staleTime: 5 * 60 * 1000,
		},
		queryClient
	);

	return {
		...routeEligibility,
		routeIsEnabled: routeEligibility.routeIsEnabled && !! siteId && pluginStatus?.enabled === true,
	};
}
