import { fetchSiteLaunchpad } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteLaunchpadQuery = ( siteId: number, checklistSlug: string ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'launchpad', checklistSlug ],
		queryFn: () => fetchSiteLaunchpad( siteId, checklistSlug ),
	} );
