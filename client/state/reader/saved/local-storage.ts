/**
 * Temporary localStorage persistence for saved posts.
 * This will be replaced with API calls once the /wpcom/v2/read/saved endpoints are built.
 */
import type { SavedPostItem } from './types';

const STORAGE_KEY = 'reader_saved_posts';

export function persistToLocalStorage( items: SavedPostItem[] ): void {
	try {
		window.localStorage.setItem( STORAGE_KEY, JSON.stringify( items ) );
	} catch {
		// Silently fail if localStorage is full or unavailable.
	}
}

export function loadFromLocalStorage(): SavedPostItem[] {
	try {
		const stored = window.localStorage.getItem( STORAGE_KEY );
		if ( stored ) {
			return JSON.parse( stored );
		}
	} catch {
		// Silently fail if localStorage is unavailable or data is corrupted.
	}
	return [];
}
