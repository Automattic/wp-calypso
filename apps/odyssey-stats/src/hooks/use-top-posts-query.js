import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

function queryTopPosts( siteId, params ) {
	return wpcom.req.get( `/sites/${ siteId }/stats/top-posts`, params );
}

export default function useTopPostsQuery( siteId, period, num, date, summarize = 1, max = 0 ) {
	return useQuery(
		[ 'stats-widget', 'top-posts', siteId, period, num, date, summarize, max ],
		() => queryTopPosts( siteId, { period, num, date, summarize, max } ),
		{
			select: ( data ) => data?.summary?.postviews,
			staleTime: 5 * 60 * 1000,
		}
	);
}
