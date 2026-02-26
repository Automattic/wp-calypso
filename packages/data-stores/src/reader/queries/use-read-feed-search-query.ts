import { Railcar } from '@automattic/calypso-analytics';
import { useQuery } from '@tanstack/react-query';
import { buildQueryString } from '@wordpress/url';
import wpcomRequest from 'wpcom-proxy-request';

export enum FeedSort {
	LastUpdated = 'last_updated',
	Relevance = 'relevance',
}

type ReadFeedSearchQueryProps = {
	query?: string;
	excludeFollowed?: boolean;
	sort?: FeedSort;
};

export type FeedItem = {
	URL?: string;
	blog_ID?: string;
	feed_ID?: string;
	meta: {
		links?: {
			feed?: string;
			site?: string;
		};
	};
	railcar?: Railcar;
	subscribe_URL: string;
	subscribers_count?: number;
	title?: string;
};

type FeedResponse = {
	algorithm: string;
	feeds: FeedItem[];
	next_page: string;
	total: number;
};

export const readFeedSearchQueryOptions = ( options: ReadFeedSearchQueryProps ) => {
	return {
		queryKey: [ 'read', 'feed', 'search', options.query, options.excludeFollowed, options.sort ],
		queryFn: async () => {
			if ( options.query === undefined ) {
				return;
			}
			const urlQuery = buildQueryString( {
				q: options.query,
				exclude_followed: options.excludeFollowed,
				sort: options.sort,
			} );

			return wpcomRequest< FeedResponse >( {
				path: '/read/feed',
				apiVersion: '1.1',
				method: 'GET',
				query: urlQuery,
			} );
		},
	};
};

const useReadFeedSearchQuery = (
	options: ReadFeedSearchQueryProps,
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
