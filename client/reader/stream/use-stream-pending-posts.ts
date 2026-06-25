import {
	fetchReadStream,
	getStreamInfiniteQueryKey,
	getStreamType,
	type PageHandle,
} from '@automattic/api-queries';
import { useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { EVERY_MINUTE } from 'calypso/lib/interval';
import { syncConversationFollowStatus, syncPostCache } from 'calypso/reader/data/post/cache';
import { buildStreamQueryParams, normalizeStreamPage } from 'calypso/reader/data/stream';
import { analyticsForStream } from 'calypso/reader/data/stream/normalization';
import { keyToString } from 'calypso/reader/post-key';
import { useDispatch } from 'calypso/state';
import type { ReadStreamQueryParams, ReadStreamResponse } from '@automattic/api-core';
import type { StreamItem } from 'calypso/reader/data/stream';

interface UseStreamPendingPostsOptions {
	streamKey: string;
	feedId?: number | null;
	localeSlug?: string | null;
	startDate?: string | null;
	/**
	 * Whether the head poll should run. Callers exclude stream types where
	 * polling adds no value (search, recommendations, discover) or where the
	 * stream itself is suppressed (`forcePlaceholders`).
	 */
	shouldPoll?: boolean;
	/**
	 * Currently rendered items, used to compute how many polled head items are
	 * "new" (not yet visible). Coming from `useInfiniteStream(...)` upstream.
	 */
	items: StreamItem[];
}

export interface UseStreamPendingPostsResult {
	/** Number of polled head items not yet present in `items`. */
	pendingCount: number;
	/** Sugar for `pendingCount > 0`. */
	hasPendingPosts: boolean;
	/**
	 * Insert the current polled head into the rendered stream and clear it from
	 * the poll cache. Mirrors the legacy Reader `showUpdates` action, which
	 * prepended `pendingItems` instead of waiting on a second stream request.
	 */
	consume: () => void;
	/**
	 * Drop the polled head from cache. Use after the consumer has acted on the
	 * pending posts (e.g., consumed them into the infinite query) so the pill
	 * clears immediately, instead of waiting for the next `refetchInterval`
	 * tick.
	 */
	reset: () => void;
}

type PollHeadQueryKey = readonly [
	'read',
	'stream',
	'poll-head',
	string,
	number | null,
	string | null,
	string | null,
];

const postKeyId = ( postKey: StreamItem | null | undefined ): string =>
	postKey ? keyToString( postKey ) ?? '' : '';

const railcarId = ( railcar: unknown ): string | null => {
	if ( ! railcar || typeof railcar !== 'object' ) {
		return null;
	}
	const id = ( railcar as { railcar?: unknown } ).railcar;
	return typeof id === 'string' ? id : JSON.stringify( railcar );
};

type StreamInfiniteData = InfiniteData< ReadStreamResponse, PageHandle >;

const countPendingItems = (
	pollPage: ReadStreamResponse | null | undefined,
	items: StreamItem[],
	streamType: string
): number => {
	const streamItems = pollPage ? normalizeStreamPage( pollPage, streamType ).streamItems : [];
	const seen = new Set( items.map( postKeyId ) );
	// Stop at the first polled-head item the user has already seen. Items past
	// that boundary are older posts the user hasn't scrolled to (the poll
	// fetches `PER_POLL` items > `INITIAL_FETCH`), not new content. Mirrors the
	// legacy reducer's `lastUpdated` date pre-filter.
	const firstSeen = streamItems.findIndex( ( k ) => seen.has( postKeyId( k ) ) );
	return firstSeen === -1 ? streamItems.length : firstSeen;
};

const countPendingItemsFromPages = (
	pollPage: ReadStreamResponse | null | undefined,
	pages: ReadStreamResponse[],
	streamType: string
): number => {
	const streamItems = pollPage ? normalizeStreamPage( pollPage, streamType ).streamItems : [];
	if ( streamItems.length === 0 ) {
		return 0;
	}

	let firstSeen = -1;
	for ( const page of pages ) {
		const seen = new Set( normalizeStreamPage( page, streamType ).streamItems.map( postKeyId ) );
		const pageFirstSeen = streamItems.findIndex( ( k ) => seen.has( postKeyId( k ) ) );
		if ( pageFirstSeen === -1 ) {
			continue;
		}
		firstSeen = firstSeen === -1 ? pageFirstSeen : Math.min( firstSeen, pageFirstSeen );
		if ( firstSeen === 0 ) {
			break;
		}
	}

	return firstSeen === -1 ? streamItems.length : firstSeen;
};

const siteHasPost = ( site: unknown ): boolean => {
	if ( ! site || typeof site !== 'object' ) {
		return false;
	}
	const posts = ( site as { posts?: unknown } ).posts;
	return Array.isArray( posts ) && posts.length > 0;
};

const takePendingFromPage = (
	page: ReadStreamResponse,
	pendingCount: number
): ReadStreamResponse => {
	if ( pendingCount <= 0 ) {
		return page;
	}

	if ( Array.isArray( page.posts ) ) {
		return { ...page, posts: page.posts.slice( 0, pendingCount ) };
	}

	if ( Array.isArray( page.cards ) ) {
		let remaining = pendingCount;
		const cards: NonNullable< ReadStreamResponse[ 'cards' ] > = [];
		for ( const card of page.cards ) {
			if ( remaining <= 0 ) {
				break;
			}
			cards.push( card );
			if ( card.type === 'post' ) {
				remaining -= 1;
			}
		}
		return { ...page, cards };
	}

	if ( Array.isArray( page.sites ) ) {
		let remaining = pendingCount;
		const sites: unknown[] = [];
		for ( const site of page.sites ) {
			if ( remaining <= 0 ) {
				break;
			}
			sites.push( site );
			if ( siteHasPost( site ) ) {
				remaining -= 1;
			}
		}
		return { ...page, sites };
	}

	return page;
};

const prependPendingPage = (
	current: StreamInfiniteData | undefined,
	pendingPage: ReadStreamResponse,
	pendingCount: number,
	initialPageParam: PageHandle
): StreamInfiniteData => {
	const pendingOnlyPage = takePendingFromPage( pendingPage, pendingCount );

	if ( ! current?.pages.length ) {
		return { pageParams: [ initialPageParam ], pages: [ pendingOnlyPage ] };
	}

	const [ firstPage, ...remainingPages ] = current.pages;
	if ( Array.isArray( pendingOnlyPage.posts ) && Array.isArray( firstPage.posts ) ) {
		return {
			...current,
			pages: [
				{ ...firstPage, posts: [ ...pendingOnlyPage.posts, ...firstPage.posts ] },
				...remainingPages,
			],
		};
	}

	if ( Array.isArray( pendingOnlyPage.cards ) && Array.isArray( firstPage.cards ) ) {
		return {
			...current,
			pages: [
				{ ...firstPage, cards: [ ...pendingOnlyPage.cards, ...firstPage.cards ] },
				...remainingPages,
			],
		};
	}

	if ( Array.isArray( pendingOnlyPage.sites ) && Array.isArray( firstPage.sites ) ) {
		return {
			...current,
			pages: [
				{ ...firstPage, sites: [ ...pendingOnlyPage.sites, ...firstPage.sites ] },
				...remainingPages,
			],
		};
	}

	return {
		pageParams: [ initialPageParam, ...current.pageParams ],
		pages: [ pendingOnlyPage, ...current.pages ],
	};
};

/**
 * Drives the "X new posts" pill. A separate `useQuery` polls the head of the
 * stream every minute (`refetchInterval`); the diff between the polled head
 * and the currently visible items is exposed as `pendingCount`. The polled
 * payload carries full post bodies (see `getQueryStringForPoll`), and is
 * written into the canonical Reader post cache on every tick so
 * `<PostLifecycle>` resolves rich cards immediately when the consumer prepends
 * the polled head into the infinite query.
 *
 * Reacting to a non-zero `hasPendingPosts` (passive invalidate, consume on
 * click) is the consumer's job — see `withStreamPosts` in
 * `client/reader/stream/index.jsx`.
 */
export function useStreamPendingPosts( {
	streamKey,
	feedId = null,
	localeSlug = null,
	startDate = null,
	shouldPoll = true,
	items,
}: UseStreamPendingPostsOptions ): UseStreamPendingPostsResult {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const streamType = getStreamType( streamKey );
	const renderedRailcars = useRef< Set< string > >( new Set() );

	const pollQueryKey = useMemo< PollHeadQueryKey >(
		() => [ 'read', 'stream', 'poll-head', streamKey, feedId, localeSlug, startDate ] as const,
		[ streamKey, feedId, localeSlug, startDate ]
	);

	// Wait for the initial infinite-query page to land before polling — the
	// pending count is meaningless until we have a baseline of "what is shown".
	const enabled = shouldPoll && items.length > 0;

	const pollHead = useQuery< ReadStreamResponse | null >( {
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey: pollQueryKey,
		queryFn: () => {
			const params = buildStreamQueryParams( {
				streamKey,
				feedId,
				localeSlug,
				pageHandle: startDate ? { before: startDate } : null,
				isPoll: true,
				gap: null,
				page: undefined,
				perPage: undefined,
			} ) as ReadStreamQueryParams;
			return fetchReadStream( streamKey, params );
		},
		enabled,
		refetchInterval: enabled ? EVERY_MINUTE : false,
		// Skip ticking while the tab is hidden — wakes back up when focused.
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: false,
		staleTime: EVERY_MINUTE,
		// Drop the polled head from cache the moment the consumer unmounts or
		// the queryKey rotates (locale/feed change). Without this, a stale
		// head from a prior stream could briefly inflate the badge.
		gcTime: 0,
		meta: { persist: false },
	} );

	useEffect( () => {
		renderedRailcars.current.clear();
	}, [ pollQueryKey ] );

	// Hydrate the canonical cache on every poll tick so post bodies are ready
	// before the user clicks "X new posts".
	useEffect( () => {
		if ( ! pollHead.data ) {
			return;
		}
		const { streamPosts } = normalizeStreamPage( pollHead.data, streamType );
		if ( streamPosts.length > 0 ) {
			const unrenderedRailcarPosts = streamPosts.filter( ( post ) => {
				const id = railcarId( post.railcar );
				if ( ! id || renderedRailcars.current.has( id ) ) {
					return false;
				}
				renderedRailcars.current.add( id );
				return true;
			} );
			analyticsForStream( {
				streamKey,
				algorithm: pollHead.data.algorithm,
				items: unrenderedRailcarPosts,
			} ).forEach( ( action ) => dispatch( action ) );
			syncPostCache( queryClient, streamPosts );
			syncConversationFollowStatus( dispatch, streamPosts );
		}
	}, [ pollHead.data, streamKey, streamType, queryClient, dispatch ] );

	const pendingCount = useMemo(
		() => countPendingItems( pollHead.data, items, streamType ),
		[ pollHead.data, items, streamType ]
	);

	const reset = useCallback( () => {
		void queryClient.cancelQueries( { queryKey: pollQueryKey, exact: true }, { silent: true } );
		queryClient.setQueryData< ReadStreamResponse | null >( pollQueryKey, null );
	}, [ queryClient, pollQueryKey ] );

	const consume = useCallback( () => {
		if ( pollHead.data ) {
			const streamQueryKey = getStreamInfiniteQueryKey( {
				streamKey,
				feedId,
				localeSlug,
				startDate,
			} );
			queryClient.setQueryData< StreamInfiniteData >( streamQueryKey, ( current ) => {
				const currentPendingCount = current?.pages.length
					? countPendingItemsFromPages( pollHead.data, current.pages, streamType )
					: countPendingItems( pollHead.data, items, streamType );
				return currentPendingCount > 0
					? prependPendingPage(
							current,
							pollHead.data as ReadStreamResponse,
							currentPendingCount,
							startDate ? { before: startDate } : null
					  )
					: current;
			} );
			void queryClient.invalidateQueries( {
				queryKey: streamQueryKey,
				exact: true,
				refetchType: 'none',
			} );
		}
		reset();
	}, [
		feedId,
		items,
		localeSlug,
		pollHead.data,
		queryClient,
		reset,
		startDate,
		streamKey,
		streamType,
	] );

	return { pendingCount, hasPendingPosts: pendingCount > 0, consume, reset };
}
