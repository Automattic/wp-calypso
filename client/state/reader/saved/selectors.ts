import { keyToString } from 'calypso/reader/post-key';
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
