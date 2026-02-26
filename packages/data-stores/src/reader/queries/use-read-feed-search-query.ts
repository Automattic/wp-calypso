import { Reader } from '@automattic/data-stores';
import { useQuery } from '@tanstack/react-query';
import { buildQueryString } from '@wordpress/url';
import wpcomRequest from 'wpcom-proxy-request';

export enum FeedSort {
	LastUpdated = 'last_updated',
	Relevance = 'relevance',
}

type Options = {
	query?: string;
	excludeFollowed?: boolean;
	sort?: FeedSort;
};

type FeedResponse = {
	algorithm: string;
	feeds: Reader.FeedItem[];
	next_page: string;
	total: number;
};

const useReadFeedSearchQuery = (
	options: Options,
	queryOptions?: {
		enabled?: boolean;
	}
) => {
	const { query, excludeFollowed = false, sort = FeedSort.Relevance } = options;
	const { enabled = Boolean( query ) } = queryOptions ?? {};

	return useQuery( {
		queryKey: [ 'read', 'feed', 'search', query, excludeFollowed, sort ],
		queryFn: async () => {
			if ( query === undefined ) {
				return;
			}

			const urlQuery = buildQueryString( {
				q: query,
				exclude_followed: excludeFollowed,
				sort,
			} );

			return wpcomRequest< FeedResponse >( {
				path: '/read/feed',
				apiVersion: '1.1',
				method: 'GET',
				query: urlQuery,
			} );
		},
		enabled,
		refetchOnWindowFocus: false,
	} );
};

export default useReadFeedSearchQuery;
