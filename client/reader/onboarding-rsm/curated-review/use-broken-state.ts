import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'reader/curated-review/broken-feed-ids';

function loadFromStorage(): Set< number > {
	if ( typeof window === 'undefined' ) {
		return new Set();
	}
	try {
		const raw = window.localStorage.getItem( STORAGE_KEY );
		if ( ! raw ) {
			return new Set();
		}
		const parsed = JSON.parse( raw );
		if ( ! Array.isArray( parsed ) ) {
			return new Set();
		}
		return new Set( parsed.filter( ( id ): id is number => typeof id === 'number' ) );
	} catch {
		return new Set();
	}
}

function persistToStorage( ids: Set< number > ): void {
	if ( typeof window === 'undefined' ) {
		return;
	}
	try {
		window.localStorage.setItem( STORAGE_KEY, JSON.stringify( [ ...ids ] ) );
	} catch {
		// Ignore quota / privacy-mode errors — the in-memory state still works
		// for the active session.
	}
}

/**
 * Tracks the set of feed IDs the user has marked as broken in the curated
 * review tool. Persists across reloads via localStorage so a multi-session
 * review pass can resume where it left off.
 *
 * Returns a stable Set reference for membership checks plus three callbacks:
 *   - `markBroken( feedId )`
 *   - `unmarkBroken( feedId )`
 *   - `clearAll()` — wipes every persisted broken flag
 */
export function useBrokenState(): {
	brokenFeedIds: Set< number >;
	markBroken: ( feedId: number ) => void;
	unmarkBroken: ( feedId: number ) => void;
	toggleBroken: ( feedId: number ) => void;
	clearAll: () => void;
} {
	const [ brokenFeedIds, setBrokenFeedIds ] = useState< Set< number > >( () => loadFromStorage() );

	useEffect( () => {
		persistToStorage( brokenFeedIds );
	}, [ brokenFeedIds ] );

	const markBroken = useCallback( ( feedId: number ) => {
		setBrokenFeedIds( ( prev ) => {
			if ( prev.has( feedId ) ) {
				return prev;
			}
			const next = new Set( prev );
			next.add( feedId );
			return next;
		} );
	}, [] );

	const unmarkBroken = useCallback( ( feedId: number ) => {
		setBrokenFeedIds( ( prev ) => {
			if ( ! prev.has( feedId ) ) {
				return prev;
			}
			const next = new Set( prev );
			next.delete( feedId );
			return next;
		} );
	}, [] );

	const toggleBroken = useCallback( ( feedId: number ) => {
		setBrokenFeedIds( ( prev ) => {
			const next = new Set( prev );
			if ( next.has( feedId ) ) {
				next.delete( feedId );
			} else {
				next.add( feedId );
			}
			return next;
		} );
	}, [] );

	const clearAll = useCallback( () => {
		setBrokenFeedIds( new Set() );
	}, [] );

	return { brokenFeedIds, markBroken, unmarkBroken, toggleBroken, clearAll };
}
