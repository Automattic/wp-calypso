import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from 'calypso/my-sites/stats/hooks/default-query-params';

interface QueryTopPostsParams {
	period: string;
	num: number;
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

export default function useTopPostsQuery(
	siteId: number,
	period: string,
	num: number,
	date: string,
	summarize = 1,
	max = 0
) {
	return useQuery( {
		...getDefaultQueryParams< TopPostsResponse >(),
		queryKey: [ 'stats-widget', 'top-posts', siteId, period, num, date, summarize, max ],
		queryFn: () => queryTopPosts( siteId, { period, num, date, summarize, max } ),
		select: ( data ) => data?.summary?.postviews,
		staleTime: 5 * 60 * 1000,
	} );
}
