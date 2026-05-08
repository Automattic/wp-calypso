import { getStreamType } from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { keysAreEqual } from 'calypso/reader/post-key';
import { combineXPosts } from 'calypso/state/reader/streams/utils';
import { normalizeStreamPage } from './stream-normalization';
import type { PostKey } from './use-stream-posts';
import type { ReadStreamResponse } from '@automattic/api-core';

type SelectedPostQueryKey = readonly [ 'read', 'stream', 'selected', string, string | null ];

const SELECTED_POST_GC_TIME = 30 * 60 * 1000;

interface UseStreamPostKeySelectionOptions {
	streamKey: string;
	localeSlug?: string | null;
	feedId?: number | null;
	startDate?: string | null;
	/**
	 * Explicit stream items to use for prev/next calculation. Live consumers
	 * (`<Stream>`) pass the items they're rendering. When omitted, the hook
	 * derives items from the in-memory React Query infinite-stream cache —
	 * used by the full-post view to navigate prev/next without re-fetching.
	 * No network calls are issued from this hook.
	 */
	items?: PostKey[];
	currentPostKey?: PostKey | null;
}

export interface UseStreamPostKeySelectionResult {
	selectedPostKey: PostKey | null;
	currentPostKey: PostKey | null;
	previousPostKey: PostKey | null;
	nextPostKey: PostKey | null;
	selectPostKey: ( postKey: PostKey | null ) => void;
	selectNextPost: ( fromList?: PostKey[] ) => void;
	selectPreviousPost: ( fromList?: PostKey[] ) => void;
}

function findPostKeyIndex( items: PostKey[], postKey: PostKey | null ): number {
	if ( ! postKey ) {
		return -1;
	}

	return items.findIndex(
		( item ) => keysAreEqual( item, postKey ) || keysAreEqual( item.xPostMetadata, postKey )
	);
}

function getOffsetPostKey(
	items: PostKey[],
	postKey: PostKey | null,
	offset: number
): PostKey | null {
	const index = findPostKeyIndex( items, postKey );
	if ( index < 0 ) {
		return null;
	}

	const offsetItem = items[ index + offset ];
	if ( ! offsetItem ) {
		return null;
	}

	return offsetItem.xPostMetadata ? ( offsetItem.xPostMetadata as PostKey ) : offsetItem;
}

type StreamInfiniteQueryKeyPrefix = readonly [ 'read', 'stream', 'infinite', string ];

export function useStreamPostKeySelection( {
	streamKey,
	localeSlug = null,
	feedId = null,
	startDate = null,
	items: explicitItems,
	currentPostKey: controlledCurrentPostKey = null,
}: UseStreamPostKeySelectionOptions ): UseStreamPostKeySelectionResult {
	const queryClient = useQueryClient();
	const streamType = getStreamType( streamKey );
	const selectedQueryKey = useMemo< SelectedPostQueryKey >(
		() => [ 'read', 'stream', 'selected', streamKey, localeSlug ] as const,
		[ streamKey, localeSlug ]
	);
	const streamQueryKeyPrefix = useMemo< StreamInfiniteQueryKeyPrefix >(
		() => [ 'read', 'stream', 'infinite', streamKey ] as const,
		[ streamKey ]
	);
	const selectedQuery = useQuery< PostKey | null, Error, PostKey | null, SelectedPostQueryKey >( {
		queryKey: selectedQueryKey,
		queryFn: () => Promise.resolve( null ),
		initialData: null,
		staleTime: Infinity,
		gcTime: SELECTED_POST_GC_TIME,
		meta: { persist: false },
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false,
	} );

	const cachedItems = useMemo( () => {
		const cachedEntries = queryClient.getQueriesData< { pages: ReadStreamResponse[] } >( {
			queryKey: streamQueryKeyPrefix,
		} );
		if ( cachedEntries.length === 0 ) {
			return [] as PostKey[];
		}

		const normalizedFeedId = feedId ?? null;
		const normalizedLocaleSlug = localeSlug ?? null;
		const normalizedStartDate = startDate ?? null;

		// Infinite stream keys are:
		// ['read','stream','infinite', streamKey, feedId, localeSlug, startDate]
		const itemsForEntry = ( entry: ( typeof cachedEntries )[ number ] | undefined ): PostKey[] => {
			const pages = entry?.[ 1 ]?.pages ?? [];
			if ( ! pages.length ) {
				return [];
			}
			const collected: PostKey[] = [];
			for ( const page of pages ) {
				collected.push( ...normalizeStreamPage( page, streamType ).streamItems );
			}
			return combineXPosts( collected ) as PostKey[];
		};

		// Prefer the entry whose full identity matches the request — covers the
		// case where multiple variants of the same `streamKey` are cached
		// (different `feedId` / `localeSlug` / `startDate`).
		const exactEntry = cachedEntries.find( ( [ queryKey ] ) => {
			if ( ! Array.isArray( queryKey ) ) {
				return false;
			}
			return (
				( queryKey[ 4 ] ?? null ) === normalizedFeedId &&
				( queryKey[ 5 ] ?? null ) === normalizedLocaleSlug &&
				( queryKey[ 6 ] ?? null ) === normalizedStartDate
			);
		} );
		if ( exactEntry ) {
			return itemsForEntry( exactEntry );
		}

		// No exact match — pick the cache entry that contains the current post
		// key, so prev/next is computed from the list the user is actually
		// navigating. Used by the full-post view, which knows the streamKey
		// but not the variant the user came from.
		if ( controlledCurrentPostKey ) {
			for ( const entry of cachedEntries ) {
				const items = itemsForEntry( entry );
				if ( findPostKeyIndex( items, controlledCurrentPostKey ) >= 0 ) {
					return items;
				}
			}
		}

		// Fallback: locale match, then first entry.
		const localeMatchedEntry = cachedEntries.find( ( [ queryKey ] ) => {
			if ( ! Array.isArray( queryKey ) ) {
				return false;
			}
			return ( queryKey[ 5 ] ?? null ) === normalizedLocaleSlug;
		} );
		return itemsForEntry( localeMatchedEntry ?? cachedEntries[ 0 ] );
	}, [
		queryClient,
		streamQueryKeyPrefix,
		streamType,
		feedId,
		localeSlug,
		startDate,
		controlledCurrentPostKey,
	] );

	const items = explicitItems ?? cachedItems;

	const selectedPostKey = selectedQuery.data ?? null;
	const currentPostKey = controlledCurrentPostKey ?? selectedPostKey;
	const previousPostKey = useMemo(
		() => getOffsetPostKey( items, currentPostKey, -1 ),
		[ items, currentPostKey ]
	);
	const nextPostKey = useMemo(
		() => getOffsetPostKey( items, currentPostKey, 1 ),
		[ items, currentPostKey ]
	);

	const selectPostKey = useCallback(
		( postKey: PostKey | null ) => {
			queryClient.setQueryData< PostKey | null >( selectedQueryKey, postKey );
		},
		[ queryClient, selectedQueryKey ]
	);

	const selectNextPost = useCallback(
		( fromList?: PostKey[] ) => {
			const list = fromList ?? items;
			queryClient.setQueryData< PostKey | null >( selectedQueryKey, ( current ) => {
				const currentSelected = current ?? null;
				if ( ! list.length ) {
					return currentSelected;
				}

				const next = getOffsetPostKey( list, currentSelected, 1 );
				if ( next ) {
					return next;
				}

				return currentSelected ? currentSelected : list[ 0 ];
			} );
		},
		[ items, queryClient, selectedQueryKey ]
	);

	const selectPreviousPost = useCallback(
		( fromList?: PostKey[] ) => {
			const list = fromList ?? items;
			queryClient.setQueryData< PostKey | null >( selectedQueryKey, ( current ) => {
				const currentSelected = current ?? null;
				if ( ! list.length ) {
					return currentSelected;
				}

				return getOffsetPostKey( list, currentSelected, -1 ) ?? currentSelected;
			} );
		},
		[ items, queryClient, selectedQueryKey ]
	);

	return {
		selectedPostKey,
		currentPostKey,
		previousPostKey,
		nextPostKey,
		selectPostKey,
		selectNextPost,
		selectPreviousPost,
	};
}
