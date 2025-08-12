import { queryOptions } from '@tanstack/react-query';
import { fetchSiteLaunchpad } from '../../data/site-launchpad';

export const siteLaunchpadQuery = ( siteId: number, checklistSlug: string ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'launchpad', checklistSlug ],
		queryFn: () => fetchSiteLaunchpad( siteId, checklistSlug ),
	} );
