import { fetchSiteLaunchpad } from '../api/site-launchpad';

export const siteLaunchpadQuery = ( siteId: number, checklistSlug: string ) => ( {
	queryKey: [ 'site', siteId, 'launchpad', checklistSlug ],
	queryFn: () => fetchSiteLaunchpad( siteId, checklistSlug ),
} );
