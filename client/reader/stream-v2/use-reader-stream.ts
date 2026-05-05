import { fetchReadStream, getStreamType } from '@automattic/api-queries';
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { keysAreEqual, keyToString } from 'calypso/reader/post-key';
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

export interface UseReaderStreamResult {
	items: PostKey[];
	isLoading: boolean;
	isFetching: boolean;
	isFetchingNextPage: boolean;
	hasNextPage: boolean;
	lastPage: boolean;
	error: unknown;
	fetchNextPage: () => void;
	refetch: () => void;
	selected: PostKey | null;
	selectItem: ( postKey: PostKey | null ) => void;
	selectNext: ( fromList?: PostKey[] ) => void;
	selectPrev: ( fromList?: PostKey[] ) => void;
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

interface UseReaderStreamOptions {
	streamKey: string;
	feedId?: number | null;
	localeSlug?: string | null;
}

/**
 * Cursor-paginated reader stream hook backed by `useInfiniteQuery`. Owns
 * `selected` and `removedIds` locally; the legacy Redux slice (`state.reader.streams`)
 * is not touched. `state.reader.posts` is still populated via `receivePosts`
 * because `<PostLifecycle>` and the full-post navigation read post bodies from
 * there.
 */
export function useReaderStream( {
	streamKey,
	feedId = null,
	localeSlug = null,
}: UseReaderStreamOptions ): UseReaderStreamResult {
	const dispatch = useDispatch();
	const streamType = getStreamType( streamKey );

	const [ selected, setSelected ] = useState< PostKey | null >( null );
	const [ removedIds, setRemovedIds ] = useState< Set< string > >( () => new Set() );

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
				readonly [ 'read', 'stream', 'v2', 'infinite', string, number | null, string | null ],
				PageHandle
			>( {
				queryKey: [ 'read', 'stream', 'v2', 'infinite', streamKey, feedId, localeSlug ] as const,
				queryFn: ( { pageParam } ) => fetchReadStream( streamKey, buildPageParams( pageParam ) ),
				initialPageParam: null,
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
				staleTime: 30 * 1000,
				meta: { persist: false },
				refetchOnWindowFocus: false,
			} ),
		[ streamKey, feedId, localeSlug, streamType, buildPageParams ]
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

	// Reset local selection when streamKey changes.
	const previousStreamKeyRef = useRef( streamKey );
	useEffect( () => {
		if ( previousStreamKeyRef.current === streamKey ) {
			return;
		}
		previousStreamKeyRef.current = streamKey;
		setSelected( null );
		setRemovedIds( new Set() );
	}, [ streamKey ] );

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

	const selectItem = useCallback( ( postKey: PostKey | null ) => {
		setSelected( postKey );
	}, [] );

	const selectNext = useCallback(
		( fromList?: PostKey[] ) => {
			const list = fromList ?? items;
			setSelected( ( current ) => {
				if ( ! list.length ) {
					return current;
				}
				const idx = list.findIndex( ( item ) => keysAreEqual( item, current ) );
				if ( idx === -1 ) {
					return list[ 0 ];
				}
				if ( idx === list.length - 1 ) {
					return current;
				}
				return list[ idx + 1 ];
			} );
		},
		[ items ]
	);

	const selectPrev = useCallback(
		( fromList?: PostKey[] ) => {
			const list = fromList ?? items;
			setSelected( ( current ) => {
				if ( ! list.length ) {
					return current;
				}
				const idx = list.findIndex( ( item ) => keysAreEqual( item, current ) );
				if ( idx <= 0 ) {
					return current;
				}
				return list[ idx - 1 ];
			} );
		},
		[ items ]
	);

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
		hasNextPage: !! query.hasNextPage,
		lastPage: ! query.hasNextPage && ! query.isFetchingNextPage && query.isFetched,
		error: query.error,
		fetchNextPage,
		refetch,
		selected,
		selectItem,
		selectNext,
		selectPrev,
		removeItem,
	};
}
