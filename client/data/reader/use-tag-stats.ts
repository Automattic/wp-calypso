import { useQuery, UseQueryResult } from 'react-query';
import wp from 'calypso/lib/wp';

export interface TagStats {
	total_posts: number; // Number of posts in the time period.
	total_sites: number; // Number of sites that posted in the time period.
	posts_per_day: number; // Average number of posts per day in the time period.
	last_post_date_gmt: string; //(ISO 8601 datetime) Datetime for the most recent post in the time period.
}

const select = ( response: TagStats ): TagStats | null => response;

export const useTagStats = ( tag: string ): UseQueryResult< TagStats | null > =>
	useQuery(
		[ 'tag-stats', tag ],
		() =>
			wp.req.get( {
				path: `/read/topics/${ tag }/stats`,
				apiNamespace: 'wpcom/v1.3',
			} ),
		{
			staleTime: 3600000, // 1 hour
			select: select,
		}
	);
