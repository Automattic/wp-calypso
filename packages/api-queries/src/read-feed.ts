import { fetchReadFeedSearch, fetchReadFeed, ReadFeedSearchSort } from '@automattic/api-core';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import type { ReadFeedSearchResponse } from '@automattic/api-core';

const FEED_STALE_TIME = 1000 * 60; // 1 minute
const FEED_SEARCH_STALE_TIME = 1000 * 60; // 1 minute

const isValidFeedId = ( feedId?: number | string | null ) =>
	feedId != null && Number.isInteger( Number( feedId ) ) && Number( feedId ) >= 0;

export const readFeedQueryKey = ( feedId?: number | string | null ) =>
	[ 'read', 'feed', Number( feedId ) ] as const;

export const readFeedQuery = ( feedId?: number | string | null ) => {
	return queryOptions( {
		queryKey: readFeedQueryKey( feedId ),
		staleTime: FEED_STALE_TIME,
		queryFn: () => fetchReadFeed( feedId! ),
		enabled: isValidFeedId( feedId ),
		meta: { persist: true },
	} );
};

interface Options {
	query?: string;
	excludeFollowed?: boolean;
	sort?: ReadFeedSearchSort;
}

// Mirrors the legacy `requestFeedSearch` action's `query.substring(0, 500)`
// guard so an over-long query can't blow up the GET URL on the wire.
const FEED_SEARCH_MAX_QUERY_LENGTH = 500;

const truncateQuery = ( query?: string ): string | undefined =>
	query == null ? query : query.slice( 0, FEED_SEARCH_MAX_QUERY_LENGTH );

export const readFeedSearchQueryKey = ( options: Options ) => {
	const { excludeFollowed, sort } = options;
	const query = truncateQuery( options.query );
	return [ 'read', 'feeds', 'search', query, excludeFollowed, sort ] as const;
};

export const readFeedSearchQuery = ( options: Options ) => {
	const { excludeFollowed, sort } = options;
	const query = truncateQuery( options.query );
	return queryOptions( {
		queryKey: [ 'read', 'feeds', 'search', query, excludeFollowed, sort ] as const,
		staleTime: FEED_SEARCH_STALE_TIME,
		queryFn: () =>
			fetchReadFeedSearch( {
				query,
				excludeFollowed,
				sort,
			} ),
		enabled: Boolean( query ),
		meta: { persist: false },
	} );
};

// The legacy reducer capped feed-search results at 200 to bound infinite
// scroll; mirror that here so the infinite query stops paginating at the same
// boundary the UI used to enforce.
const FEED_SEARCH_MAX_RESULTS = 200;

export const readFeedSearchInfiniteQueryKey = ( options: Options ) => {
	const { excludeFollowed, sort } = options;
	const query = truncateQuery( options.query );
	return [ 'read', 'feeds', 'search', 'infinite', query, excludeFollowed, sort ] as const;
};

export const readFeedSearchInfiniteQuery = ( options: Options ) => {
	const { excludeFollowed, sort } = options;
	const query = truncateQuery( options.query );
	return infiniteQueryOptions( {
		queryKey: [ 'read', 'feeds', 'search', 'infinite', query, excludeFollowed, sort ] as const,
		staleTime: FEED_SEARCH_STALE_TIME,
		queryFn: ( { pageParam }: { pageParam: number } ) =>
			fetchReadFeedSearch( { query, excludeFollowed, sort, offset: pageParam } ),
		initialPageParam: 0,
		getNextPageParam: (
			lastPage: ReadFeedSearchResponse,
			_allPages: ReadFeedSearchResponse[],
			lastPageParam: number
		) => {
			const next = lastPageParam + ( lastPage.feeds?.length ?? 0 );
			const max = Math.min( lastPage.total ?? 0, FEED_SEARCH_MAX_RESULTS );
			return next < max ? next : undefined;
		},
		enabled: Boolean( query ),
		meta: { persist: false },
	} );
};
