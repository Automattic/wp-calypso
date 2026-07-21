import {
	fetchReadA8c,
	fetchReadConversations,
	fetchReadDiscoverFreshlyPressed,
	fetchReadDiscoverLatest,
	fetchReadDiscoverRecommended,
	fetchReadDiscoverTags,
	fetchReadFeedPosts,
	fetchReadFollowing,
	fetchReadFollowingP2,
	fetchReadLiked,
	fetchReadListPosts,
	fetchReadNotifications,
	fetchReadOnThisDay,
	fetchReadRecent,
	fetchReadRecommendationsPosts,
	fetchReadRecommendationsSites,
	fetchReadSearch,
	fetchReadSiteFeatured,
	fetchReadSitePosts,
	fetchReadSpaceDiscover,
	fetchReadSpacePosts,
	fetchReadTagPopular,
	fetchReadTagPosts,
	fetchReadUserPosts,
	type ReadStreamQueryParams,
	type ReadStreamResponse,
} from '@automattic/api-core';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

const STREAM_STALE_TIME = 30 * 1000;

export const getStreamType = ( streamKey: string ): string => {
	const colon = streamKey.indexOf( ':' );
	return colon === -1 ? streamKey : streamKey.substring( 0, colon );
};

const streamKeySuffix = ( streamKey: string ): string =>
	streamKey.substring( streamKey.indexOf( ':' ) + 1 );

const fetchDiscover = (
	streamKey: string,
	queryParams: ReadStreamQueryParams
): Promise< ReadStreamResponse > => {
	const suffix = streamKeySuffix( streamKey );
	if ( suffix.startsWith( 'recommended' ) ) {
		return fetchReadDiscoverRecommended( queryParams );
	}
	if ( suffix.startsWith( 'latest' ) ) {
		return fetchReadDiscoverLatest( queryParams );
	}
	if ( suffix === 'freshly-pressed' ) {
		return fetchReadDiscoverFreshlyPressed( queryParams );
	}
	// Tag fallback: anything else (e.g. `discover:dailyprompt`) is treated as a
	// single-tag query against `/read/streams/discover?tags=<suffix>`.
	return fetchReadDiscoverTags( suffix, queryParams );
};

/**
 * Route a stream fetch to the right `@automattic/api-core` fetcher based on
 * the streamKey prefix. Exposed so consumers (incl. `<Stream>`) can wire it
 * into their own `queryOptions` / `infiniteQueryOptions` without re-implementing
 * the switch.
 */
export const fetchReadStream = (
	streamKey: string,
	queryParams: ReadStreamQueryParams
): Promise< ReadStreamResponse > => {
	const streamType = getStreamType( streamKey );
	const suffix = streamKeySuffix( streamKey );
	switch ( streamType ) {
		case 'following':
			return fetchReadFollowing( queryParams );
		case 'discover':
			return fetchDiscover( streamKey, queryParams );
		case 'recent':
			return fetchReadRecent( queryParams );
		case 'search':
			return fetchReadSearch( queryParams );
		case 'feed':
			return fetchReadFeedPosts( suffix, queryParams );
		case 'site':
			return fetchReadSitePosts( suffix, queryParams );
		case 'space':
			return fetchReadSpacePosts( suffix, queryParams );
		case 'space_discover':
			return fetchReadSpaceDiscover( suffix, queryParams );
		case 'notifications':
			return fetchReadNotifications( queryParams );
		case 'featured':
			return fetchReadSiteFeatured( suffix, queryParams );
		case 'p2':
			return fetchReadFollowingP2( queryParams );
		case 'a8c':
			return fetchReadA8c( queryParams );
		case 'tag':
			return fetchReadTagPosts( suffix, queryParams );
		case 'tag_popular':
			return fetchReadTagPopular( suffix, queryParams );
		case 'list': {
			const { owner, slug } = JSON.parse( suffix ) as { owner: string; slug: string };
			return fetchReadListPosts( owner, slug, queryParams );
		}
		case 'user':
			return fetchReadUserPosts( suffix, queryParams );
		case 'on_this_day':
			return fetchReadOnThisDay( queryParams );
		case 'conversations':
		case 'conversations-a8c':
			return fetchReadConversations( queryParams );
		case 'likes':
			return fetchReadLiked( queryParams );
		case 'recommendations_posts':
		case 'custom_recs_posts_with_images':
			return fetchReadRecommendationsPosts( queryParams );
		case 'custom_recs_sites_with_images':
			return fetchReadRecommendationsSites( queryParams );
		default:
			throw new Error(
				`fetchReadStream: unsupported streamType "${ streamType }". Add the fetcher in @automattic/api-core and a case here when migrating this stream.`
			);
	}
};

export const readStreamQuery = (
	streamKey: string,
	queryParams: ReadStreamQueryParams,
	pageHandle: unknown = null
) =>
	queryOptions< ReadStreamResponse >( {
		queryKey: [ 'read', 'stream', streamKey, pageHandle ?? null ],
		queryFn: () => fetchReadStream( streamKey, queryParams ),
		staleTime: STREAM_STALE_TIME,
		meta: { persist: false },
	} );

export { STREAM_STALE_TIME };

// `useInfiniteQuery` cache identity for a reader stream. Pagination cursors
// can take three shapes depending on the endpoint family.
export type PageHandle = { page_handle: string } | { offset: number } | { before: string } | null;

export interface StreamIdentity {
	streamKey: string;
	feedId: number | null;
	localeSlug: string | null;
	startDate: string | null;
}

export type StreamInfiniteQueryKeyPrefix = readonly [ 'read', 'stream', 'infinite', string ];

export type StreamInfiniteQueryKey = readonly [
	'read',
	'stream',
	'infinite',
	string,
	number | null,
	string | null,
	string | null,
];

const STREAM_INFINITE_QUERY_STALE_TIME = 5 * 60 * 1000;

/**
 * Single source of truth for the `useInfiniteQuery` cache key. Used by the
 * Reader stream hook and any sibling that needs to read/write the same cache
 * via `setQueryData` / `getQueryData` without re-deriving the tuple shape.
 */
export function getStreamInfiniteQueryKey( {
	streamKey,
	feedId,
	localeSlug,
	startDate,
}: StreamIdentity ): StreamInfiniteQueryKey {
	return [ 'read', 'stream', 'infinite', streamKey, feedId, localeSlug, startDate ] as const;
}

/**
 * Prefix tuple for `queryClient.getQueriesData` / `invalidateQueries` calls
 * that need to match every cached variant of a given `streamKey` (across
 * `feedId` / `localeSlug` / `startDate` combinations).
 */
export function getStreamInfiniteQueryKeyPrefix( streamKey: string ): StreamInfiniteQueryKeyPrefix {
	return [ 'read', 'stream', 'infinite', streamKey ] as const;
}

/**
 * Inverse of `getStreamInfiniteQueryKey`. Returns the parsed identity when
 * `queryKey` matches the infinite-stream tuple shape, otherwise `null` — so
 * scanners over `queryClient.getQueriesData(...)` results don't have to
 * touch slot indices directly.
 */
export function parseStreamInfiniteQueryKey( queryKey: unknown ): StreamIdentity | null {
	if ( ! Array.isArray( queryKey ) || queryKey.length !== 7 ) {
		return null;
	}
	if (
		queryKey[ 0 ] !== 'read' ||
		queryKey[ 1 ] !== 'stream' ||
		queryKey[ 2 ] !== 'infinite' ||
		typeof queryKey[ 3 ] !== 'string'
	) {
		return null;
	}
	return {
		streamKey: queryKey[ 3 ] as string,
		feedId: ( queryKey[ 4 ] ?? null ) as number | null,
		localeSlug: ( queryKey[ 5 ] ?? null ) as string | null,
		startDate: ( queryKey[ 6 ] ?? null ) as string | null,
	};
}

export interface ReadStreamInfiniteQueryHelpers {
	/**
	 * Builds the per-page query params from the current pagination cursor.
	 * Lives in the consumer because it depends on Calypso-side stream-config
	 * knowledge (`buildStreamQueryParams`, `getTagsFromStreamKey`, locale).
	 */
	buildPageParams: ( pageHandle: PageHandle ) => ReadStreamQueryParams;
	/**
	 * Computes the next-page cursor from a response. Returns `undefined` to
	 * stop pagination (`useInfiniteQuery` semantics). Owns the
	 * `streamItems.length === 0` cutoff because the response shape (cards /
	 * posts / sites) is normalized on the consumer side.
	 */
	getNextPageHandle: (
		lastPage: ReadStreamResponse,
		lastPageParam: PageHandle
	) => PageHandle | undefined;
}

export interface ReadStreamInfiniteQueryIdentity extends StreamIdentity {
	enabled?: boolean;
}

/**
 * `infiniteQueryOptions` factory for the Reader stream. The cache key shape
 * lives here so siblings (the selection hook, the pending-posts poller) can
 * read/patch the same cache through `getStreamInfiniteQueryKey` and friends.
 *
 * The two helpers (`buildPageParams`, `getNextPageHandle`) are caller-supplied
 * because they pull in Calypso-side normalization that the package can't
 * import. The factory owns the pieces that are protocol-shaped: the queryKey,
 * the `queryFn` that routes through `fetchReadStream`, the `initialPageParam`
 * convention (date-anchored vs. cursor), and the cache freshness window.
 */
export function readStreamInfiniteQuery(
	{ streamKey, feedId, localeSlug, startDate, enabled }: ReadStreamInfiniteQueryIdentity,
	{ buildPageParams, getNextPageHandle }: ReadStreamInfiniteQueryHelpers
) {
	return infiniteQueryOptions<
		ReadStreamResponse,
		Error,
		{ pageParams: PageHandle[]; pages: ReadStreamResponse[] },
		StreamInfiniteQueryKey,
		PageHandle
	>( {
		queryKey: getStreamInfiniteQueryKey( { streamKey, feedId, localeSlug, startDate } ),
		queryFn: ( { pageParam } ) => fetchReadStream( streamKey, buildPageParams( pageParam ) ),
		initialPageParam: startDate ? { before: startDate } : null,
		enabled,
		getNextPageParam: ( lastPage, _allPages, lastPageParam ) =>
			getNextPageHandle( lastPage, lastPageParam ),
		// Cache treated as "fresh" for 5 minutes: within that window
		// `useInfiniteQuery` serves data straight from cache and never
		// touches the network. After that, the cache is still rendered
		// immediately; a refetch happens silently in the background.
		staleTime: STREAM_INFINITE_QUERY_STALE_TIME,
		// Stream pages contain mutable per-post state, such as likes. Keep them
		// out of localStorage so reloads do not rehydrate stale stream payloads.
		meta: { persist: false },
		refetchOnWindowFocus: false,
	} );
}
