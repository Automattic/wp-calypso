import {
	readFeedQuery,
	readFeedSearchInfiniteQuery,
	readFeedSearchQuery,
} from '@automattic/api-queries';
import {
	type InfiniteData,
	type QueryClient,
	type QueryKey,
	useInfiniteQuery,
	useQueries,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import { useEffect } from 'react';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import { safeLink } from 'calypso/lib/post-normalizer/utils';
import type { ReadFeedItem, ReadFeedSearchResponse } from '@automattic/api-core';

type FeedInput = {
	ID?: number | string;
	URL?: string;
	feed_ID?: number | string;
	blog_ID?: number | string;
	name?: string;
	feed_URL?: string;
	subscribe_URL?: string;
	blog_owner?: string;
	is_following?: boolean;
	subscribers_count?: number;
	description?: string;
	last_update?: string;
	image?: string;
	organization_id?: number;
	unseen_count?: number;
	subscription_id?: number;
	site_icon?: string;
	date_subscribed?: number;
};

export interface Feed {
	feed_ID: number;
	blog_ID: number;
	name?: string;
	URL?: string;
	feed_URL?: string;
	blog_owner?: string;
	is_following?: boolean;
	subscribers_count?: number;
	description?: string;
	last_update?: string;
	image?: string;
	organization_id?: number;
	unseen_count?: number;
	subscription_id?: number;
	site_icon?: string;
	date_subscribed?: number;
}

export type FeedSearchResponse = Omit< ReadFeedSearchResponse, 'feeds' > & {
	feeds: Feed[];
};

export type FeedCacheSnapshot = Array< [ QueryKey, unknown ] >;

type PatchFeedUnseenCountsOptions = {
	feedIds?: Array< number | string | null | undefined >;
	feedUrls?: Array< string | null | undefined >;
	delta?: number;
	reset?: boolean;
};

export const normalizeFeed = ( feed: FeedInput ): Feed => ( {
	feed_ID: Number( feed.feed_ID ),
	blog_ID: Number( feed.blog_ID ),
	name: feed.name && decodeEntities( feed.name ),
	URL: safeLink( feed.URL ?? '' ),
	feed_URL: safeLink( feed.feed_URL ?? '' ) || safeLink( feed.subscribe_URL ?? '' ),
	blog_owner: feed.blog_owner,
	is_following: feed.is_following,
	subscribers_count: feed.subscribers_count,
	description: feed.description && decodeEntities( stripHTML( feed.description ) ),
	last_update: feed.last_update,
	image: feed.image,
	organization_id: feed.organization_id,
	unseen_count: feed.unseen_count,
	subscription_id: feed.subscription_id,
	site_icon: feed.site_icon,
	date_subscribed: feed.date_subscribed,
} );

const normalizeFeedSearchResponse = ( response: ReadFeedSearchResponse ): FeedSearchResponse => ( {
	...response,
	feeds: ( response.feeds ?? [] ).map( normalizeFeed ),
} );

export const getCachedFeed = (
	queryClient: QueryClient,
	feedId?: number | string | null
): Feed | undefined => {
	if ( feedId == null || ! Number.isInteger( Number( feedId ) ) ) {
		return undefined;
	}
	const data = queryClient.getQueryData< FeedInput >( readFeedQuery( feedId ).queryKey );
	return data ? normalizeFeed( data ) : undefined;
};

const findInSearchResponse = (
	response: ReadFeedSearchResponse | FeedSearchResponse | undefined,
	feedUrl: string
): Feed | undefined => {
	return response?.feeds?.map( normalizeFeed ).find( ( feed ) => feed.feed_URL === feedUrl );
};

export const findCachedFeedByFeedUrl = (
	queryClient: QueryClient,
	feedUrl: string
): Feed | undefined => {
	for ( const [ , data ] of queryClient.getQueriesData< FeedInput >( {
		queryKey: [ 'read', 'feed' ],
	} ) ) {
		if ( ! data ) {
			continue;
		}
		const feed = normalizeFeed( data );
		if ( feed.feed_URL === feedUrl ) {
			return feed;
		}
	}

	for ( const [ , data ] of queryClient.getQueriesData< ReadFeedSearchResponse >( {
		queryKey: [ 'read', 'feeds', 'search' ],
	} ) ) {
		const feed = findInSearchResponse( data, feedUrl );
		if ( feed ) {
			return feed;
		}
	}

	for ( const [ , data ] of queryClient.getQueriesData< InfiniteData< ReadFeedSearchResponse > >( {
		queryKey: [ 'read', 'feeds', 'search', 'infinite' ],
	} ) ) {
		const feed = data?.pages
			.map( ( page ) => findInSearchResponse( page, feedUrl ) )
			.find( Boolean );
		if ( feed ) {
			return feed;
		}
	}

	return undefined;
};

const seedFeedCache = ( queryClient: QueryClient, feeds: Feed[] = [] ) => {
	feeds.forEach( ( feed ) => {
		if ( ! Number.isInteger( feed.feed_ID ) ) {
			return;
		}
		queryClient.setQueryData< FeedInput >(
			readFeedQuery( feed.feed_ID ).queryKey,
			( current ) =>
				( {
					...( current ? normalizeFeed( current ) : {} ),
					...feed,
				} ) as unknown as FeedInput
		);
	} );
};

const makeFeedMatcher = ( { feedIds = [], feedUrls = [] }: PatchFeedUnseenCountsOptions ) => {
	const feedIdSet = new Set(
		feedIds
			.filter( ( feedId ): feedId is number | string => feedId != null )
			.map( ( feedId ) => String( feedId ) )
	);
	const feedUrlSet = new Set(
		feedUrls.filter( ( feedUrl ): feedUrl is string => typeof feedUrl === 'string' )
	);

	return ( feed: FeedInput ) =>
		( feed.feed_ID != null && feedIdSet.has( String( feed.feed_ID ) ) ) ||
		( typeof feed.feed_URL === 'string' && feedUrlSet.has( feed.feed_URL ) );
};

const patchFeed = ( feed: FeedInput, options: PatchFeedUnseenCountsOptions ): Feed => {
	const normalized = normalizeFeed( feed );
	const current = Number.isFinite( normalized.unseen_count ) ? normalized.unseen_count ?? 0 : 0;
	return {
		...normalized,
		unseen_count: options.reset ? 0 : Math.max( current + ( options.delta ?? 0 ), 0 ),
	};
};

const patchSearchResponse = < T extends { feeds?: FeedInput[] } >(
	response: T,
	options: PatchFeedUnseenCountsOptions
): T => {
	const matches = makeFeedMatcher( options );
	return {
		...response,
		feeds: response.feeds?.map( ( feed ) =>
			matches( feed ) ? patchFeed( feed, options ) : normalizeFeed( feed )
		),
	};
};

const snapshotQuery = (
	queryClient: QueryClient,
	snapshot: FeedCacheSnapshot,
	queryKey: QueryKey,
	data: unknown
) => {
	snapshot.push( [ queryKey, data ] );
};

export const restoreFeedCache = ( queryClient: QueryClient, snapshot: FeedCacheSnapshot ) => {
	snapshot.forEach( ( [ queryKey, data ] ) => {
		queryClient.setQueryData( queryKey, data );
	} );
};

export const patchFeedUnseenCounts = (
	queryClient: QueryClient,
	options: PatchFeedUnseenCountsOptions
): FeedCacheSnapshot => {
	const snapshot: FeedCacheSnapshot = [];
	const matches = makeFeedMatcher( options );

	for ( const [ queryKey, data ] of queryClient.getQueriesData< FeedInput >( {
		queryKey: [ 'read', 'feed' ],
	} ) ) {
		if ( ! data || ! matches( data ) ) {
			continue;
		}
		snapshotQuery( queryClient, snapshot, queryKey, data );
		queryClient.setQueryData( queryKey, patchFeed( data, options ) );
	}

	for ( const [ queryKey, data ] of queryClient.getQueriesData< ReadFeedSearchResponse >( {
		queryKey: [ 'read', 'feeds', 'search' ],
	} ) ) {
		if ( ! data || queryKey[ 3 ] === 'infinite' || ! data.feeds?.some( matches ) ) {
			continue;
		}
		snapshotQuery( queryClient, snapshot, queryKey, data );
		queryClient.setQueryData( queryKey, patchSearchResponse( data, options ) );
	}

	for ( const [ queryKey, data ] of queryClient.getQueriesData<
		InfiniteData< ReadFeedSearchResponse >
	>( {
		queryKey: [ 'read', 'feeds', 'search', 'infinite' ],
	} ) ) {
		if ( ! data || ! data.pages.some( ( page ) => page.feeds?.some( matches ) ) ) {
			continue;
		}
		snapshotQuery( queryClient, snapshot, queryKey, data );
		queryClient.setQueryData( queryKey, {
			...data,
			pages: data.pages.map( ( page ) => patchSearchResponse( page, options ) ),
		} );
	}

	return snapshot;
};

export const useFeedQuery = ( feedId?: number | string | null ) => {
	const queryClient = useQueryClient();
	return useQuery( {
		...readFeedQuery( feedId ),
		select: normalizeFeed,
		placeholderData: () => getCachedFeed( queryClient, feedId ) as unknown as ReadFeedItem,
	} );
};

export const useFeedQueries = ( feedIds: Array< number | string | null | undefined > ) => {
	const queryClient = useQueryClient();
	return useQueries( {
		queries: feedIds.map( ( feedId ) => ( {
			...readFeedQuery( feedId ),
			select: normalizeFeed,
			placeholderData: () => getCachedFeed( queryClient, feedId ) as unknown as ReadFeedItem,
		} ) ),
	} );
};

export const useFeedSearchQuery = ( options: Parameters< typeof readFeedSearchQuery >[ 0 ] ) => {
	const queryClient = useQueryClient();
	const query = useQuery( {
		...readFeedSearchQuery( options ),
		select: normalizeFeedSearchResponse,
	} );

	useEffect( () => {
		if ( query.data?.feeds ) {
			seedFeedCache( queryClient, query.data.feeds );
		}
	}, [ query.data, queryClient ] );

	return query;
};

export const useFeedSearchInfiniteQuery = (
	options: Parameters< typeof readFeedSearchInfiniteQuery >[ 0 ]
) => {
	const queryClient = useQueryClient();
	const query = useInfiniteQuery( {
		...readFeedSearchInfiniteQuery( options ),
		select: ( data ) => ( {
			...data,
			pages: data.pages.map( normalizeFeedSearchResponse ),
		} ),
	} );

	useEffect( () => {
		if ( query.data?.pages ) {
			seedFeedCache(
				queryClient,
				query.data.pages.flatMap( ( page ) => page.feeds )
			);
		}
	}, [ query.data, queryClient ] );

	return query;
};
