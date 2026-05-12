import {
	getStreamType,
	readStreamInfiniteQuery,
	type PageHandle,
	type ReadStreamInfiniteQueryHelpers,
} from '@automattic/api-queries';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'calypso/state';
import { receivePosts } from 'calypso/state/reader/posts/actions';
import { buildStreamQueryParams } from 'calypso/state/reader/streams/build-query-params';
import { extractPageHandle } from 'calypso/state/reader/streams/normalize';
import { combineXPosts } from 'calypso/state/reader/streams/utils';
import { normalizeStreamPage } from './stream-normalization';
import type { ReadStreamQueryParams, ReadStreamResponse } from '@automattic/api-core';

// Re-export cache-key helpers so existing callers (stream/index, the
// selection hook, the pending-posts poller) keep their `./use-stream-posts`
// import paths. The actual definitions live in `@automattic/api-queries`.
export {
	getStreamInfiniteQueryKey,
	getStreamInfiniteQueryKeyPrefix,
	parseStreamInfiniteQueryKey,
} from '@automattic/api-queries';
export type {
	PageHandle,
	StreamIdentity,
	StreamInfiniteQueryKey,
	StreamInfiniteQueryKeyPrefix,
} from '@automattic/api-queries';

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
	 * `true` while a manual `refetch()` (or any non-pagination background
	 * refetch) is in flight. Lets the UI distinguish "user clicked the
	 * update-notice pill" from regular scroll-driven pagination.
	 */
	isRefetching: boolean;
	hasNextPage: boolean;
	lastPage: boolean;
	error: unknown;
	fetchNextPage: () => void;
	refetch: () => void;
	/**
	 * Mark the infinite query stale without refetching the active observer.
	 * The current list stays on screen; the next time the query is mounted
	 * (e.g., the user navigates away and back) it refetches because it's stale.
	 */
	invalidate: () => void;
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
	const queryClient = useQueryClient();
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

	const getNextPageHandle = useCallback< ReadStreamInfiniteQueryHelpers[ 'getNextPageHandle' ] >(
		( lastPage, lastPageParam ) => {
			// Stop paginating once a page comes back empty even if the API
			// still returns a `next_page` cursor — conversations (and a few
			// other endpoints) keep echoing a cursor past the end of the
			// stream, which would otherwise loop the same page forever.
			// Mirrors the legacy `lastPage` reducer:
			// `streamItems.length === 0 || ! pageHandle`.
			const { streamItems } = normalizeStreamPage( lastPage, streamType );
			if ( streamItems.length === 0 ) {
				return undefined;
			}
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
		[ streamType ]
	);

	const queryOptions = useMemo(
		() =>
			readStreamInfiniteQuery(
				{ streamKey: resolvedStreamKey, feedId, localeSlug, startDate, enabled },
				{ buildPageParams, getNextPageHandle }
			),
		[
			resolvedStreamKey,
			feedId,
			localeSlug,
			startDate,
			enabled,
			buildPageParams,
			getNextPageHandle,
		]
	);

	const query = useInfiniteQuery( queryOptions );

	useEffect( () => {
		const pages = query.data?.pages;
		if ( ! pages ) {
			return;
		}
		for ( let i = 0; i < pages.length; i++ ) {
			const { streamPosts } = normalizeStreamPage( pages[ i ] as ReadStreamResponse, streamType );
			if ( streamPosts.length > 0 ) {
				dispatch( receivePosts( streamPosts ) );
			}
		}
	}, [ resolvedStreamKey, streamType, query.data, dispatch ] );

	const items: PostKey[] = useMemo( () => {
		const pages = query.data?.pages ?? [];
		const collected: PostKey[] = [];
		for ( const page of pages ) {
			const { streamItems } = normalizeStreamPage( page as ReadStreamResponse, streamType );
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

	const queryKey = queryOptions.queryKey;
	const invalidate = useCallback( () => {
		queryClient.invalidateQueries( { queryKey, refetchType: 'none' } );
	}, [ queryClient, queryKey ] );

	return {
		items,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		isFetchingNextPage: query.isFetchingNextPage,
		isRefetching: query.isRefetching,
		hasNextPage: !! query.hasNextPage,
		lastPage: ! query.hasNextPage && ! query.isFetchingNextPage && query.isFetched,
		error: query.error,
		fetchNextPage,
		refetch,
		invalidate,
	};
}
