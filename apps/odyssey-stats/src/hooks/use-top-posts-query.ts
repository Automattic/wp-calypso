import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from 'calypso/my-sites/stats/hooks/default-query-params';

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
 * The range's top posts and pages.
 *
 * The window is stated as whole days between `startDate` and `date`: a summarized
 * request counts back in days whatever period it is given, so a month period would
 * silently return that many days instead. See `getRangeStartDate`.
 * @param siteId    The site to query.
 * @param startDate First day of the range, as `YYYY-MM-DD`.
 * @param date      Last day of the range, as `YYYY-MM-DD`.
 * @param summarize Whether to total the window rather than break it down by day.
 * @param max       How many rows to return; 0 for the API's own limit.
 */
export default function useTopPostsQuery(
	siteId: number,
	startDate: string,
	date: string,
	summarize = 1,
	max = 0
) {
	return useQuery( {
		...getDefaultQueryParams< TopPostsResponse >(),
		queryKey: [ 'stats-widget', 'top-posts', siteId, startDate, date, summarize, max ],
		queryFn: () =>
			queryTopPosts( siteId, { period: 'day', start_date: startDate, date, summarize, max } ),
		select: ( data ) => data?.summary?.postviews,
		staleTime: 5 * 60 * 1000,
	} );
}
