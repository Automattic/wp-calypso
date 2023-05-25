import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export interface TagStats {
	total_posts: number; // Number of posts in the time period.
	total_sites: number; // Number of sites that posted in the time period.
	posts_per_day: number; // Average number of posts per day in the time period.
	last_post_date_gmt: string; //(ISO 8601 datetime) Datetime for the most recent post in the time period.
}

export const useTagStats = ( tag: string ): UseQueryResult< TagStats | null > =>
	useQuery( {
		queryKey: [ 'tag-stats', tag ],
		queryFn: () =>
			wp.req.get( `/read/topics/${ encodeURIComponent( tag ) }/stats`, {
				apiVersion: '1.3',
			} ),
		staleTime: 86400000, // 1 day
		refetchOnMount: 'always',
	} );
