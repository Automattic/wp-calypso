import { fetchSiteEngagementStats } from '../../data/site-stats';

export const siteEngagementStatsQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'engagement-stats' ],
	queryFn: () => fetchSiteEngagementStats( siteId ),
} );
