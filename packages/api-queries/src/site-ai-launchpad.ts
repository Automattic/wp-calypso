import { fetchSiteAiLaunchpad } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteAiLaunchpadQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'ai-launchpad' ],
		queryFn: () => fetchSiteAiLaunchpad( siteId ),
	} );
