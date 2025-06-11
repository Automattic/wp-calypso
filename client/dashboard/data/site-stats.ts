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

export async function fetchSiteEngagementStats( siteIdOrSlug: string ) {
	const response = await wpcom.req.get( `/sites/${ siteIdOrSlug }/stats/visits`, {
		unit: 'day',
		quantity: 14,
		stat_fields: [ 'visitors', 'views', 'likes', 'comments' ].join( ',' ),
	} );
	// We need to normalize the returned data. We ask for 14 days of data (quantity:14)
	// and we get a response with an array of data like: `[ '2025-04-13', 1, 3, 0, 0 ]`.
	// Each number in the response is referring to the order of the field provided in `stat_fields`.
	// The returend array is sorted with ascending date order, so we need to use the last 7 entries
	// for our current data and the first 7 entries for the previous data.
	// Noting that we can't use `unit:'week'` because the API has a specific behavior for start/end of weeks.
	const calculateStats = ( data: Array< [ string, number, number, number, number ] > ) =>
		data.reduce(
			( accumulator: EngagementStatsDataPoint, [ , visitors, views, likes, comments ] ) => {
				accumulator.visitors += Number( visitors );
				accumulator.views += Number( views );
				accumulator.likes += Number( likes );
				accumulator.comments += Number( comments );
				return accumulator;
			},
			{ visitors: 0, views: 0, likes: 0, comments: 0 }
		);
	const dataLength = response.data.length;
	const currentData = calculateStats( response.data.slice( Math.max( 0, dataLength - 7 ) ) );
	const previousData = calculateStats( response.data.slice( 0, Math.max( 0, dataLength - 7 ) ) );
	return { previousData, currentData };
}
