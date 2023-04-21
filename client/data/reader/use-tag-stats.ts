import { useQuery, UseQueryResult } from 'react-query';
import wp from 'calypso/lib/wp';

export interface TagStats {
	total_posts: number; // Number of posts in the time period.
	total_sites: number; // Number of sites that posted in the time period.
	posts_per_day: number; // Average number of posts per day in the time period.
	last_post_date_gmt: string; //(ISO 8601 datetime) Datetime for the most recent post in the time period.
}

const selectFromResponse = ( response: {
	total_posts: number;
	total_sites: number;
	posts_per_day: number;
	last_post_date_gmt: string;
} ): TagStats | null => {
	console.log( 'response', response );
	return {
		total_posts: response.total_posts,
		total_sites: response.total_sites,
		posts_per_day: response.posts_per_day,
		last_post_date_gmt: response.last_post_date_gmt,
	};
};

export const useTagStats = ( tag: string ): UseQueryResult< TagStats | null > =>
	useQuery(
		[ 'tag-stats', tag ],
		() =>
			wp.req.get( {
				path: `/read/topics/${ tag }/stats`,
				apiNamespace: 'rest/v1.3',
			} ),
		{
			staleTime: 86400000, // 1 day
			select: selectFromResponse,
			refetchOnMount: 'always',
		}
	);
