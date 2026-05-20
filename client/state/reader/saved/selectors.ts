import { getCachedReaderPost } from 'calypso/reader/data/reader-post-cache';
import { keyToString } from 'calypso/reader/post-key';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import type { PostKey, SavedPostItem } from './types';
import type { AppState } from 'calypso/types';

function getItems( state: AppState ): SavedPostItem[] {
	return state.reader?.saved?.items ?? [];
}

export function getSavedPosts( state: AppState ): SavedPostItem[] {
	return getItems( state );
}

export function getSavedPostsCount( state: AppState ): number {
	return getItems( state ).length;
}

export function isPostSaved( state: AppState, postKey: PostKey ): boolean {
	const key = keyToString( postKey );
	return getItems( state ).some( ( item ) => keyToString( item.postKey ) === key );
}

export function isSavedPostsLoading( state: AppState ): boolean {
	return state.reader?.saved?.isLoading ?? false;
}

export function getSavedPostsError( state: AppState ): string | null {
	return state.reader?.saved?.error ?? null;
}

export function getSavedPostsTotalReadingTime( state: AppState ): number {
	const queryClient = getCalypsoQueryClient();
	if ( ! queryClient ) {
		return 0;
	}

	return getItems( state ).reduce( ( total: number, item: SavedPostItem ) => {
		const post = getCachedReaderPost( queryClient, item.postKey );
		const minutes = Number( post?.minutes_to_read ?? 0 );
		return total + ( Number.isFinite( minutes ) ? minutes : 0 );
	}, 0 );
}
