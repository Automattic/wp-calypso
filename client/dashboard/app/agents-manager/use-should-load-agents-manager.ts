import { bigSkyPluginQuery, queryClient } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const ENABLED_ROUTES: RegExp[] = [ /^\/sites\/[^/]+\/?$/ ];

export function shouldLoadAgentsManager(
	currentRoute: string | null | undefined,
	isWordPressAgentEnabled: boolean
): boolean {
	return (
		isEnabled( 'calypso/agents-manager' ) &&
		isWordPressAgentEnabled &&
		!! currentRoute &&
		ENABLED_ROUTES.some( ( route ) => route.test( currentRoute ) )
	);
}

export default function useShouldLoadAgentsManager(
	currentRoute?: string | null,
	siteId?: number | null
): boolean {
	const routeIsEnabled = useMemo(
		() => shouldLoadAgentsManager( currentRoute, true ),
		[ currentRoute ]
	);
	const { data: pluginStatus } = useQuery(
		{
			...bigSkyPluginQuery( siteId ?? 0 ),
			enabled: routeIsEnabled && !! siteId,
			staleTime: 5 * 60 * 1000,
		},
		queryClient
	);

	return routeIsEnabled && pluginStatus?.enabled === true;
}
