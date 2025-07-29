import wpcom from 'calypso/lib/wp';

export interface SiteEngagementStatsResponse {
	/**
	 * Array of tuples in the format: [date, visitors, views, likes, comments],
	 * e.g. `[ '2025-04-13', 1, 3, 0, 0 ]`.
	 */
	data: Array< [ string, number, number, number, number ] >;
}

export async function fetchSiteEngagementStats(
	siteId: number
): Promise< SiteEngagementStatsResponse > {
	return wpcom.req.get( `/sites/${ siteId }/stats/visits`, {
		unit: 'day',
		quantity: 14,
		stat_fields: [ 'visitors', 'views', 'likes', 'comments' ].join( ',' ),
	} );
}
