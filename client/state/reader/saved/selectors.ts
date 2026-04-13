import { keyToString } from 'calypso/reader/post-key';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import type { PostKey, SavedPostItem } from './types';

interface ReaderSavedState {
	items: SavedPostItem[];
	isLoading: boolean;
	error: string | null;
}

interface AppState {
	reader: {
		saved: ReaderSavedState;
		posts: { items: Record< string, unknown > };
		[ key: string ]: unknown;
	};
}

export function getSavedPosts( state: AppState ): SavedPostItem[] {
	return state.reader.saved.items;
}

export function getSavedPostsCount( state: AppState ): number {
	return state.reader.saved.items.length;
}

export function isPostSaved( state: AppState, postKey: PostKey ): boolean {
	const key = keyToString( postKey );
	return state.reader.saved.items.some( ( item ) => keyToString( item.postKey ) === key );
}

export function isSavedPostsLoading( state: AppState ): boolean {
	return state.reader.saved.isLoading;
}

export function getSavedPostsError( state: AppState ): string | null {
	return state.reader.saved.error;
}

export function getSavedPostsTotalReadingTime( state: AppState ): number {
	return state.reader.saved.items.reduce( ( total, item ) => {
		const post = getPostByKey( state, item.postKey );
		const minutes = post?.minutes_to_read ?? 0;
		return total + minutes;
	}, 0 );
}
