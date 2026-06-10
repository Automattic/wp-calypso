import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { getCachedStreamItems, type StreamItem } from 'calypso/reader/data/stream';
import { keysAreEqual } from 'calypso/reader/post-key';

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
	items?: StreamItem[];
	currentPostKey?: StreamItem | null;
}

export interface UseStreamPostKeySelectionResult {
	selectedPostKey: StreamItem | null;
	/**
	 * Position of `selectedPostKey` in `items`. `-1` when nothing is selected
	 * or the selection doesn't belong to the current list (e.g. selection
	 * lingering from a different stream variant). Exposed so consumers can
	 * short-circuit behaviour at list boundaries — `<ReaderStream>` uses it
	 * to suppress scroll-into-view at index 0.
	 */
	selectedPostIndex: number;
	currentPostKey: StreamItem | null;
	previousPostKey: StreamItem | null;
	nextPostKey: StreamItem | null;
	selectPostKey: ( postKey: StreamItem | null ) => void;
	selectNextPost: () => void;
	selectPreviousPost: () => void;
}

function findPostKeyIndex( items: StreamItem[], postKey: StreamItem | null ): number {
	if ( ! postKey ) {
		return -1;
	}

	// Match either the item itself or its `xPostMetadata` — for x-posts the
	// URL-derived current key points at the original blog/post (the
	// `xPostMetadata` target), but the stream item wrapping it is what
	// participates in prev/next.
	return items.findIndex(
		( item ) => keysAreEqual( item, postKey ) || keysAreEqual( item.xPostMetadata, postKey )
	);
}

function getOffsetPostKey(
	items: StreamItem[],
	postKey: StreamItem | null,
	offset: number
): StreamItem | null {
	const index = findPostKeyIndex( items, postKey );
	if ( index < 0 ) {
		return null;
	}

	// Always return the stream item itself — preserves the parent identity
	// so consumers can compare prev/next keys back to the rendered list.
	// X-post routing is handled downstream by `showSelectedPost`
	// (`client/reader/utils.ts`), which detects xposts from the post body
	// in Redux and redirects to the original URL.
	return items[ index + offset ] ?? null;
}

export function useStreamPostKeySelection( {
	streamKey,
	localeSlug = null,
	feedId = null,
	startDate = null,
	items: explicitItems,
	currentPostKey: controlledCurrentPostKey = null,
}: UseStreamPostKeySelectionOptions ): UseStreamPostKeySelectionResult {
	const queryClient = useQueryClient();
	const selectedQueryKey = useMemo< SelectedPostQueryKey >(
		() => [ 'read', 'stream', 'selected', streamKey, localeSlug ] as const,
		[ streamKey, localeSlug ]
	);
	const selectedQuery = useQuery<
		StreamItem | null,
		Error,
		StreamItem | null,
		SelectedPostQueryKey
	>( {
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
		return getCachedStreamItems( queryClient, {
			streamKey,
			feedId,
			localeSlug,
			startDate,
			currentPostKey: controlledCurrentPostKey,
		} );
	}, [ queryClient, streamKey, feedId, localeSlug, startDate, controlledCurrentPostKey ] );

	const items = explicitItems ?? cachedItems;

	const selectedPostKey = selectedQuery.data ?? null;
	const currentPostKey = controlledCurrentPostKey ?? selectedPostKey;
	const selectedPostIndex = useMemo(
		() => findPostKeyIndex( items, selectedPostKey ),
		[ items, selectedPostKey ]
	);
	const previousPostKey = useMemo(
		() => getOffsetPostKey( items, currentPostKey, -1 ),
		[ items, currentPostKey ]
	);
	const nextPostKey = useMemo(
		() => getOffsetPostKey( items, currentPostKey, 1 ),
		[ items, currentPostKey ]
	);

	const selectPostKey = useCallback(
		( postKey: StreamItem | null ) => {
			queryClient.setQueryData< StreamItem | null >( selectedQueryKey, postKey );
		},
		[ queryClient, selectedQueryKey ]
	);

	const selectNextPost = useCallback( () => {
		const list = items;
		queryClient.setQueryData< StreamItem | null >( selectedQueryKey, ( current ) => {
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
	}, [ items, queryClient, selectedQueryKey ] );

	const selectPreviousPost = useCallback( () => {
		const list = items;
		queryClient.setQueryData< StreamItem | null >( selectedQueryKey, ( current ) => {
			const currentSelected = current ?? null;
			if ( ! list.length ) {
				return currentSelected;
			}

			return getOffsetPostKey( list, currentSelected, -1 ) ?? currentSelected;
		} );
	}, [ items, queryClient, selectedQueryKey ] );

	return {
		selectedPostKey,
		selectedPostIndex,
		currentPostKey,
		previousPostKey,
		nextPostKey,
		selectPostKey,
		selectNextPost,
		selectPreviousPost,
	};
}
