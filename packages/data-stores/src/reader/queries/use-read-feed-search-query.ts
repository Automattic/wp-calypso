import { Railcar } from '@automattic/calypso-analytics';
import { useInfiniteQuery } from '@tanstack/react-query';
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

const useReadFeedSearchQuery = ( {
	query,
	excludeFollowed = false,
	sort = FeedSort.Relevance,
}: ReadFeedSearchQueryProps ) => {
	return useInfiniteQuery( {
		queryKey: [ 'read', 'feed', 'search', query, excludeFollowed, sort ],
		queryFn: async ( { pageParam: pageParamQueryString } ) => {
			if ( query === undefined ) {
				return;
			}

			const urlQuery = buildQueryString( {
				q: query,
				exclude_followed: excludeFollowed,
				sort,
			} ).concat( pageParamQueryString ? `&${ pageParamQueryString }` : '' );

			return wpcomRequest< FeedResponse >( {
				path: '/read/feed',
				apiVersion: '1.1',
				method: 'GET',
				query: urlQuery,
			} );
		},
		enabled: Boolean( query ),
		initialPageParam: '',
		getNextPageParam: ( lastPage ) => lastPage?.next_page,
		refetchOnWindowFocus: false,
	} );
};

export default useReadFeedSearchQuery;
