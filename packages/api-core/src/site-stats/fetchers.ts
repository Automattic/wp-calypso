import { wpcom } from '../wpcom-fetcher';
import type { SiteEngagementStatsResponse } from './types';

export async function fetchSiteEngagementStats(
	siteId: number
): Promise< SiteEngagementStatsResponse > {
	return wpcom.req.get( `/sites/${ siteId }/stats/visits`, {
		unit: 'day',
		quantity: 14,
		stat_fields: [ 'visitors', 'views', 'likes', 'comments' ].join( ',' ),
	} );
}
