import { fetchReadStream, getStreamType } from '@automattic/api-queries';
import { infiniteQueryOptions, keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { keyToString } from 'calypso/reader/post-key';
import { useDispatch } from 'calypso/state';
import { receivePosts } from 'calypso/state/reader/posts/actions';
import { buildStreamQueryParams } from 'calypso/state/reader/streams/build-query-params';
import { extractPageHandle } from 'calypso/state/reader/streams/normalize';
import { combineXPosts } from 'calypso/state/reader/streams/utils';
import { normalizeStreamPage } from './stream-normalization';
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
}

const postKeyId = ( postKey: PostKey | null | undefined ): string =>
	postKey ? keyToString( postKey ) ?? '' : '';

interface StreamIdentity {
	streamKey: string;
	feedId: number | null;
	localeSlug: string | null;
	startDate: string | null;
}

export type StreamInfiniteQueryKey = readonly [
	'read',
	'stream',
	'infinite',
	string,
	number | null,
	string | null,
	string | null,
];

/**
 * Single source of truth for the `useInfiniteQuery` cache key. Exported so
 * sibling hooks (e.g. `useStreamPendingPosts`) can read or mutate the same
 * cache via `setQueryData` without re-deriving the tuple shape.
 */
export function getStreamInfiniteQueryKey( {
	streamKey,
	feedId,
	localeSlug,
	startDate,
}: StreamIdentity ): StreamInfiniteQueryKey {
	return [ 'read', 'stream', 'infinite', streamKey, feedId, localeSlug, startDate ] as const;
}

interface UseStreamPostsOptions {
	streamKey?: string | null;
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
	// `streamKey` is optional so consumers can mount the hook unconditionally
	// (Hooks rules) even when the key is not yet known — e.g. a recommendation
	// stream that only activates once a parent stream loads. When absent we
	// short-circuit `enabled` so the query never fires; the placeholder empty
	// string in `queryKey` / `streamType` is never observed.
	const resolvedStreamKey = streamKey ?? '';
	const streamType = resolvedStreamKey ? getStreamType( resolvedStreamKey ) : '';
	const enabled = ( options?.enabled ?? true ) && !! streamKey;
	const buildPageParams = useCallback(
		( pageHandle: PageHandle ): ReadStreamQueryParams =>
			buildStreamQueryParams( {
				streamKey: resolvedStreamKey,
				feedId,
				pageHandle,
				localeSlug,
				isPoll: false,
				gap: null,
				page: undefined,
				perPage: undefined,
			} ) as ReadStreamQueryParams,
		[ resolvedStreamKey, feedId, localeSlug ]
	);

	const queryOptions = useMemo(
		() =>
			infiniteQueryOptions<
				ReadStreamResponse,
				Error,
				{ pageParams: PageHandle[]; pages: ReadStreamResponse[] },
				StreamInfiniteQueryKey,
				PageHandle
			>( {
				queryKey: getStreamInfiniteQueryKey( {
					streamKey: resolvedStreamKey,
					feedId,
					localeSlug,
					startDate,
				} ),
				queryFn: ( { pageParam } ) =>
					fetchReadStream( resolvedStreamKey, buildPageParams( pageParam ) ),
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
		[ resolvedStreamKey, feedId, localeSlug, startDate, enabled, streamType, buildPageParams ]
	);

	const query = useInfiniteQuery( queryOptions );

	useEffect( () => {
		const pages = query.data?.pages;
		if ( ! pages ) {
			return;
		}
		for ( let i = 0; i < pages.length; i++ ) {
			const { streamPosts } = normalizeStreamPage( pages[ i ], streamType );
			if ( streamPosts.length > 0 ) {
				dispatch( receivePosts( streamPosts ) );
			}
		}
	}, [ resolvedStreamKey, streamType, query.data, dispatch ] );

	const items: PostKey[] = useMemo( () => {
		const pages = query.data?.pages ?? [];
		const collected: PostKey[] = [];
		for ( const page of pages ) {
			const { streamItems } = normalizeStreamPage( page, streamType );
			for ( const item of streamItems ) {
				collected.push( item );
			}
		}
		const combined = combineXPosts( collected ) as PostKey[];
		return combined;
	}, [ query.data, streamType ] );

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
	};
}
