import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { keysAreEqual } from 'calypso/reader/post-key';
import type { PostKey } from './use-stream-posts';

type SelectedPostQueryKey = readonly [
	'read',
	'stream',
	'v2',
	'selected',
	string,
	number | null,
	string | null,
];

const SELECTED_POST_GC_TIME = 30 * 60 * 1000;

interface UseStreamPostKeySelectionOptions {
	streamKey: string;
	feedId?: number | null;
	localeSlug?: string | null;
	items: PostKey[];
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

export function useStreamPostKeySelection( {
	streamKey,
	feedId = null,
	localeSlug = null,
	items,
	currentPostKey: controlledCurrentPostKey = null,
}: UseStreamPostKeySelectionOptions ): UseStreamPostKeySelectionResult {
	const queryClient = useQueryClient();
	const selectedQueryKey = useMemo< SelectedPostQueryKey >(
		() => [ 'read', 'stream', 'v2', 'selected', streamKey, feedId, localeSlug ] as const,
		[ streamKey, feedId, localeSlug ]
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
