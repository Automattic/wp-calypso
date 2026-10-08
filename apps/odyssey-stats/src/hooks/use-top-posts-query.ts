import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from 'calypso/my-sites/stats/hooks/default-query-params';
import type { ResolvedDateRange } from '../lib/date-ranges';

interface QueryTopPostsParams {
	period: string;
	start_date: string;
	date: string;
	summarize?: number;
	max?: number;
}

interface TopPostsResponse {
	summary: { postviews: number | null };
}

function queryTopPosts( siteId: number, params: QueryTopPostsParams ) {
	return wpcom.req.get( `/sites/${ siteId }/stats/top-posts`, params );
}

/**
 * Top posts and pages over a range's days, totalled rather than broken down by day.
 * @param siteId The site to query.
 * @param days   The range's first and last day.
 */
export default function useTopPostsQuery(
	siteId: number,
	days: Pick< ResolvedDateRange, 'startDate' | 'endDate' >
) {
	const { startDate, endDate } = days;
	return useQuery( {
		...getDefaultQueryParams< TopPostsResponse >(),
		queryKey: [ 'stats-widget', 'top-posts', siteId, startDate, endDate ],
		queryFn: () =>
			queryTopPosts( siteId, {
				period: 'day',
				start_date: startDate,
				date: endDate,
				summarize: 1,
				max: 0,
			} ),
		select: ( data ) => data?.summary?.postviews,
		staleTime: 5 * 60 * 1000,
	} );
}
