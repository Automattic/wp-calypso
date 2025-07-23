import { fetchSiteLaunchpad } from '../../data/site-launchpad';

export const siteLaunchpadQuery = ( siteId: number, checklistSlug: string ) => ( {
	queryKey: [ 'site', siteId, 'launchpad', checklistSlug ],
	queryFn: () => fetchSiteLaunchpad( siteId, checklistSlug ),
} );
