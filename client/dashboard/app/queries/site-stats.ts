import { fetchSiteEngagementStats } from '../../data/site-stats';

export const siteEngagementStatsQuery = ( siteId: string ) => ( {
	queryKey: [ 'site', siteId, 'engagement-stats' ],
	queryFn: () => fetchSiteEngagementStats( siteId ),
} );
