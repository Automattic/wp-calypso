import { fetchReadStream, getStreamType } from '@automattic/api-queries';
import { infiniteQueryOptions, keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { keyToString } from 'calypso/reader/post-key';
import { useDispatch } from 'calypso/state';
import { receivePosts } from 'calypso/state/reader/posts/actions';
import { buildStreamQueryParams } from 'calypso/state/reader/streams/build-query-params';
import {
	createStreamDataFromCards,
	createStreamDataFromPosts,
	createStreamDataFromSites,
	extractPageHandle,
} from 'calypso/state/reader/streams/normalize';
import { combineXPosts } from 'calypso/state/reader/streams/utils';
import type { ReadStreamQueryParams, ReadStreamResponse } from '@automattic/api-core';

export type PageHandle = { page_handle: string } | { offset: number } | { before: string } | null;

export interface PostKey {
	blogId?: number | string;
	feedId?: number | string;
	postId?: number | string;
	feedItemId?: number | string;
	xPostMetadata?: { blogId?: number | string; postId?: number | string };
	[ key: string ]: unknown;
}

export interface UseStreamPostsResult {
	items: PostKey[];
	isLoading: boolean;
	isFetching: boolean;
	isFetchingNextPage: boolean;
	/**
	 * `true` when the items currently exposed are the previous stream's data
	 * being kept on screen (`placeholderData: keepPreviousData`) while a new
	 * `streamKey` / `feedId` / `localeSlug` query is loading in the
	 * background. Consumers can render a subtle "refreshing" treatment.
	 */
	isPlaceholderData: boolean;
	hasNextPage: boolean;
	lastPage: boolean;
	error: unknown;
	fetchNextPage: () => void;
	refetch: () => void;
	removeItem: ( postKey: PostKey ) => void;
}

const datePropertyForStream = ( streamType: string ): string => {
	if ( streamType === 'conversations' || streamType === 'conversations-a8c' ) {
		return 'last_comment_date_gmt';
	}
	if ( streamType === 'likes' ) {
		return 'date_liked';
	}
	return 'date';
};

interface NormalizedPage {
	streamItems: PostKey[];
	streamPosts: Array< Record< string, unknown > >;
}

function normalizePage( data: ReadStreamResponse, streamType: string ): NormalizedPage {
	const dateProperty = datePropertyForStream( streamType );
	if ( data.cards ) {
		const fromCards = createStreamDataFromCards( data.cards, dateProperty );
		return { streamItems: fromCards.streamItems, streamPosts: fromCards.streamPosts };
	}
	if ( data.sites ) {
		const fromSites = createStreamDataFromSites(
			data.sites as Parameters< typeof createStreamDataFromSites >[ 0 ],
			dateProperty
		);
		return { streamItems: fromSites.streamItems, streamPosts: fromSites.streamPosts };
	}
	const fromPosts = createStreamDataFromPosts(
		data.posts as Parameters< typeof createStreamDataFromPosts >[ 0 ],
		dateProperty
	);
	return { streamItems: fromPosts.streamItems, streamPosts: fromPosts.streamPosts };
}

const postKeyId = ( postKey: PostKey | null | undefined ): string =>
	postKey ? keyToString( postKey ) ?? '' : '';

interface UseStreamPostsOptions {
	streamKey: string;
	feedId?: number | null;
	localeSlug?: string | null;
	startDate?: string | null;
	options?: {
		enabled?: boolean;
	};
}

/**
 * Cursor-paginated reader stream hook backed by `useInfiniteQuery`. Owns
 * `removedIds` locally; the legacy Redux slice (`state.reader.streams`) is
 * not touched. `state.reader.posts` is still populated via `receivePosts`
 * because `<PostLifecycle>` and the full-post navigation read post bodies from
 * there.
 */
export function useStreamPosts( {
	streamKey,
	feedId = null,
	localeSlug = null,
	startDate = null,
	options,
}: UseStreamPostsOptions ): UseStreamPostsResult {
	const dispatch = useDispatch();
	const streamType = getStreamType( streamKey );
	const enabled = options?.enabled ?? true;

	const [ removedIds, setRemovedIds ] = useState< Set< string > >( () => new Set() );
	const streamIdentity = `${ streamKey }|${ feedId ?? '' }|${ localeSlug ?? '' }|${
		startDate ?? ''
	}`;

	const buildPageParams = useCallback(
		( pageHandle: PageHandle ): ReadStreamQueryParams =>
			buildStreamQueryParams( {
				streamKey,
				feedId,
				pageHandle,
				localeSlug,
				isPoll: false,
				gap: null,
				page: undefined,
				perPage: undefined,
			} ) as ReadStreamQueryParams,
		[ streamKey, feedId, localeSlug ]
	);

	const queryOptions = useMemo(
		() =>
			infiniteQueryOptions<
				ReadStreamResponse,
				Error,
				{ pageParams: PageHandle[]; pages: ReadStreamResponse[] },
				readonly [
					'read',
					'stream',
					'v2',
					'infinite',
					string,
					number | null,
					string | null,
					string | null,
				],
				PageHandle
			>( {
				queryKey: [
					'read',
					'stream',
					'v2',
					'infinite',
					streamKey,
					feedId,
					localeSlug,
					startDate,
				] as const,
				queryFn: ( { pageParam } ) => fetchReadStream( streamKey, buildPageParams( pageParam ) ),
				initialPageParam: startDate ? { before: startDate } : null,
				enabled,
				getNextPageParam: ( lastPage, _allPages, lastPageParam ) => {
					// `extractPageHandle` only consults `payload.pageHandle.offset` for
					// the recommendations family; for cursor / date streams the rest of
					// the union is harmless extra fields.
					const action = {
						payload: {
							pageHandle: ( lastPageParam ?? undefined ) as { offset?: number } | undefined,
						},
					};
					return extractPageHandle( streamType, action, lastPage ) ?? undefined;
				},
				// Cache is treated as "fresh" for 5 minutes: within that window
				// `useInfiniteQuery` serves data straight from cache and never
				// touches the network — long enough that quick back-and-forth
				// navigation inside the Reader is instant, short enough that newly
				// liked posts surface on the next deliberate visit. After 5
				// minutes the cache is still rendered immediately; a refetch
				// happens silently in the background and the screen swaps in
				// the fresh data when it lands.
				staleTime: 5 * 60 * 1000,
				// `meta.persist` is omitted so Calypso's persistence layer (see
				// client/state/query-client.ts + should-dehydrate-query.ts) writes
				// pages to localStorage. After a page reload, the very first paint
				// rehydrates already-fetched streams from storage instead of
				// showing a skeleton.
				//
				// When the queryKey changes (streamKey / feedId / localeSlug),
				// keep showing the previous stream's pages until the new query
				// resolves. The user sees their familiar list with a brief stale
				// indicator instead of a skeleton swap. `query.isPlaceholderData`
				// flips while the previous data is being shown.
				placeholderData: keepPreviousData,
				refetchOnWindowFocus: false,
			} ),
		[ streamKey, feedId, localeSlug, startDate, enabled, streamType, buildPageParams ]
	);

	const query = useInfiniteQuery( queryOptions );

	// Populate `state.reader.posts` so `<PostLifecycle>` and other consumers
	// can resolve post bodies by key. Only dispatch newly-loaded pages.
	const lastDispatchedRef = useRef< { streamKey: string; pageCount: number } >( {
		streamKey,
		pageCount: 0,
	} );
	useEffect( () => {
		const pages = query.data?.pages;
		if ( ! pages || pages.length === 0 ) {
			return;
		}
		if (
			lastDispatchedRef.current.streamKey !== streamKey ||
			lastDispatchedRef.current.pageCount > pages.length
		) {
			lastDispatchedRef.current = { streamKey, pageCount: 0 };
		}
		const start = lastDispatchedRef.current.pageCount;
		for ( let i = start; i < pages.length; i++ ) {
			const { streamPosts } = normalizePage( pages[ i ], streamType );
			if ( streamPosts.length > 0 ) {
				dispatch( receivePosts( streamPosts ) );
			}
		}
		lastDispatchedRef.current = { streamKey, pageCount: pages.length };
	}, [ streamKey, streamType, query.data, dispatch ] );

	// Reset local per-instance state when the stream identity changes.
	const previousStreamIdentityRef = useRef( streamIdentity );
	useEffect( () => {
		if ( previousStreamIdentityRef.current === streamIdentity ) {
			return;
		}
		previousStreamIdentityRef.current = streamIdentity;
		setRemovedIds( new Set() );
	}, [ streamIdentity ] );

	const items: PostKey[] = useMemo( () => {
		const pages = query.data?.pages ?? [];
		const collected: PostKey[] = [];
		for ( const page of pages ) {
			const { streamItems } = normalizePage( page, streamType );
			for ( const item of streamItems ) {
				collected.push( item );
			}
		}
		const combined = combineXPosts( collected ) as PostKey[];
		if ( removedIds.size === 0 ) {
			return combined;
		}
		return combined.filter( ( item ) => ! removedIds.has( postKeyId( item ) ) );
	}, [ query.data, streamType, removedIds ] );

	const removeItem = useCallback( ( postKey: PostKey ) => {
		setRemovedIds( ( previous ) => {
			const next = new Set( previous );
			next.add( postKeyId( postKey ) );
			return next;
		} );
	}, [] );

	const fetchNextPage = useCallback( () => {
		query.fetchNextPage();
	}, [ query ] );

	const refetch = useCallback( () => {
		query.refetch();
	}, [ query ] );

	return {
		items,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		isFetchingNextPage: query.isFetchingNextPage,
		isPlaceholderData: query.isPlaceholderData,
		hasNextPage: !! query.hasNextPage,
		lastPage: ! query.hasNextPage && ! query.isFetchingNextPage && query.isFetched,
		error: query.error,
		fetchNextPage,
		refetch,
		removeItem,
	};
}
