import wpcom from 'calypso/lib/wp';

export interface EngagementStatsDataPoint {
	visitors: number;
	views: number;
	likes: number;
	comments: number;
}
export interface EngagementStats {
	currentData: EngagementStatsDataPoint;
	previousData: EngagementStatsDataPoint;
}

export async function fetchSiteEngagementStats( siteId: number ) {
	return wpcom.req.get( `/sites/${ siteId }/stats/visits`, {
		unit: 'day',
		quantity: 14,
		stat_fields: [ 'visitors', 'views', 'likes', 'comments' ].join( ',' ),
	} );
}
