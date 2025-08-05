import { queryOptions } from '@tanstack/react-query';
import { fetchSiteEngagementStats } from '../../data/site-stats';

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

export const siteEngagementStatsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'engagement-stats' ],
		queryFn: () => fetchSiteEngagementStats( siteId ),
		select: ( { data: stats } ) => {
			// We need to normalize the returned data. We ask for 14 days of data (quantity:14)
			// and we get a response with an array of data like: `[ '2025-04-13', 1, 3, 0, 0 ]`.
			// Each number in the response is referring to the order of the field provided in `stat_fields`.
			// The returned array is sorted with ascending date order, so we need to use the last 7 entries
			// for our current data and the first 7 entries for the previous data.
			// Noting that we can't use `unit:'week'` because the API has a specific behavior for start/end of weeks.
			const calculateStats = ( data: typeof stats ) =>
				data.reduce(
					( accumulator, [ , visitors, views, likes, comments ] ) => {
						accumulator.visitors += Number( visitors );
						accumulator.views += Number( views );
						accumulator.likes += Number( likes );
						accumulator.comments += Number( comments );
						return accumulator;
					},
					{ visitors: 0, views: 0, likes: 0, comments: 0 } as EngagementStatsDataPoint
				);

			const dataLength = stats.length;
			const currentData = calculateStats( stats.slice( Math.max( 0, dataLength - 7 ) ) );
			const previousData = calculateStats( stats.slice( 0, Math.max( 0, dataLength - 7 ) ) );
			return { previousData, currentData };
		},
	} );
