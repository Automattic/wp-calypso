import { useCallback, useEffect, useRef, useState } from 'react';

function loadFromStorage( storageKey: string ): Set< number > {
	if ( typeof window === 'undefined' ) {
		return new Set();
	}
	try {
		const raw = window.localStorage.getItem( storageKey );
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

function persistToStorage( storageKey: string, ids: Set< number > ): void {
	if ( typeof window === 'undefined' ) {
		return;
	}
	try {
		window.localStorage.setItem( storageKey, JSON.stringify( [ ...ids ] ) );
	} catch {
		// Ignore quota / privacy-mode errors — the in-memory state still works
		// for the active session.
	}
}

export interface PersistedFeedIdSet {
	feedIds: Set< number >;
	mark: ( feedId: number ) => void;
	unmark: ( feedId: number ) => void;
	toggle: ( feedId: number ) => void;
	clear: () => void;
}

/**
 * A persisted Set< number > of feed IDs, backed by localStorage so a
 * multi-session review pass can resume where it left off. The curated-review
 * tool uses this for two parallel state slices — "marked broken" and
 * "force hasIcon to false" — keyed on different storage keys.
 *
 * `storageKey` is normally a stable constant. If a caller _does_ swap it at
 * runtime, we reload state from the new key on the next render rather than
 * silently writing the previous in-memory Set under it.
 */
export function usePersistedFeedIdSet( storageKey: string ): PersistedFeedIdSet {
	const [ feedIds, setFeedIds ] = useState< Set< number > >( () => loadFromStorage( storageKey ) );
	// Tracks the key the current `feedIds` was loaded from. When the caller
	// swaps `storageKey`, the next effect tick reloads from the new key
	// instead of persisting stale state under it.
	const lastSeenKeyRef = useRef( storageKey );

	useEffect( () => {
		if ( lastSeenKeyRef.current !== storageKey ) {
			lastSeenKeyRef.current = storageKey;
			setFeedIds( loadFromStorage( storageKey ) );
			// Defer persist to the next render — the freshly-loaded set will
			// be the one we save (and persisting now would clobber the new
			// key's stored value with the previous key's in-memory Set).
			return;
		}
		persistToStorage( storageKey, feedIds );
	}, [ storageKey, feedIds ] );

	const mark = useCallback( ( feedId: number ) => {
		setFeedIds( ( prev ) => {
			if ( prev.has( feedId ) ) {
				return prev;
			}
			const next = new Set( prev );
			next.add( feedId );
			return next;
		} );
	}, [] );

	const unmark = useCallback( ( feedId: number ) => {
		setFeedIds( ( prev ) => {
			if ( ! prev.has( feedId ) ) {
				return prev;
			}
			const next = new Set( prev );
			next.delete( feedId );
			return next;
		} );
	}, [] );

	const toggle = useCallback( ( feedId: number ) => {
		setFeedIds( ( prev ) => {
			const next = new Set( prev );
			if ( next.has( feedId ) ) {
				next.delete( feedId );
			} else {
				next.add( feedId );
			}
			return next;
		} );
	}, [] );

	const clear = useCallback( () => {
		setFeedIds( new Set() );
	}, [] );

	return { feedIds, mark, unmark, toggle, clear };
}
