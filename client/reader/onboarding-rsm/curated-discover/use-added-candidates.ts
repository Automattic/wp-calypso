import { useCallback, useEffect, useRef, useState } from 'react';
import type { CuratedBlog, CuratedBlogsList } from '../curated-blogs';

/**
 * Per-tag map of curated entries the operator has marked for inclusion in
 * the next exported version of a file. Tag → ordered array of full
 * `CuratedBlog` records, in insertion order (oldest first).
 *
 * The page renders this with newest at top — order reversal happens at
 * read-time so internal storage stays append-only and round-trips through
 * `JSON.stringify` cleanly.
 */
export type AddedCandidatesByTag = CuratedBlogsList;

const STORAGE_PREFIX = 'reader/curated-discover/added/';

function storageKeyFor( fileSlug: string ): string {
	return `${ STORAGE_PREFIX }${ fileSlug }`;
}

function loadFromStorage( storageKey: string ): AddedCandidatesByTag {
	if ( typeof window === 'undefined' ) {
		return {};
	}
	try {
		const raw = window.localStorage.getItem( storageKey );
		if ( ! raw ) {
			return {};
		}
		const parsed = JSON.parse( raw );
		if ( ! parsed || typeof parsed !== 'object' || Array.isArray( parsed ) ) {
			return {};
		}
		// Coerce to the expected shape — ignore tags whose value isn't an array
		// of objects with `feed_ID`. Keeps a corrupted localStorage entry from
		// crashing the dev tool.
		const out: AddedCandidatesByTag = {};
		for ( const [ tag, value ] of Object.entries( parsed ) ) {
			if ( ! Array.isArray( value ) ) {
				continue;
			}
			const entries = value.filter(
				( e ): e is CuratedBlog =>
					!! e && typeof e === 'object' && typeof ( e as CuratedBlog ).feed_ID === 'number'
			);
			if ( entries.length > 0 ) {
				out[ tag ] = entries;
			}
		}
		return out;
	} catch {
		return {};
	}
}

function persistToStorage( storageKey: string, value: AddedCandidatesByTag ): void {
	if ( typeof window === 'undefined' ) {
		return;
	}
	try {
		window.localStorage.setItem( storageKey, JSON.stringify( value ) );
	} catch {
		// Ignore quota / privacy-mode errors — the in-memory state still works
		// for the active session.
	}
}

export interface UseAddedCandidatesResult {
	/** Per-tag map of added entries, in insertion order. */
	added: AddedCandidatesByTag;
	/** Add an entry under `tag`. No-op if `feed_ID` already added under that tag. */
	add: ( tag: string, entry: CuratedBlog ) => void;
	/** Remove the entry with this `feed_ID` from `tag`. */
	remove: ( tag: string, feedId: number ) => void;
	/** Mutate `has_icon` on an already-added entry. No-op if not added under that tag. */
	setHasIcon: ( tag: string, feedId: number, hasIcon: boolean ) => void;
	/** Drop all added entries for the file. */
	clear: () => void;
	/** True when the entry is currently in the added set under that tag. */
	isAdded: ( tag: string, feedId: number ) => boolean;
}

/**
 * Persisted Map<tag, CuratedBlog[]> of operator-added candidates, keyed in
 * localStorage by file slug. Two instances of this hook (one per file) never
 * share storage — switching files swaps the storage key and reloads from disk.
 *
 * Same SSR-safe / quota-tolerant pattern as
 * `client/reader/onboarding-rsm/curated-review/use-persisted-feed-ids.ts`.
 */
export function useAddedCandidates( fileSlug: string ): UseAddedCandidatesResult {
	const storageKey = storageKeyFor( fileSlug );
	const [ added, setAdded ] = useState< AddedCandidatesByTag >( () =>
		loadFromStorage( storageKey )
	);
	const lastSeenKeyRef = useRef( storageKey );

	useEffect( () => {
		if ( lastSeenKeyRef.current !== storageKey ) {
			lastSeenKeyRef.current = storageKey;
			setAdded( loadFromStorage( storageKey ) );
			// Defer persist to the next render — the freshly-loaded set will
			// be the one we save (and persisting now would clobber the new
			// key's stored value with the previous key's in-memory state).
			return;
		}
		persistToStorage( storageKey, added );
	}, [ storageKey, added ] );

	const add = useCallback( ( tag: string, entry: CuratedBlog ) => {
		setAdded( ( prev ) => {
			const existing = prev[ tag ] ?? [];
			if ( existing.some( ( e ) => e.feed_ID === entry.feed_ID ) ) {
				return prev;
			}
			return { ...prev, [ tag ]: [ ...existing, entry ] };
		} );
	}, [] );

	const remove = useCallback( ( tag: string, feedId: number ) => {
		setAdded( ( prev ) => {
			const existing = prev[ tag ];
			if ( ! existing ) {
				return prev;
			}
			const next = existing.filter( ( e ) => e.feed_ID !== feedId );
			if ( next.length === existing.length ) {
				return prev;
			}
			if ( next.length === 0 ) {
				const { [ tag ]: _omitted, ...rest } = prev;
				return rest;
			}
			return { ...prev, [ tag ]: next };
		} );
	}, [] );

	const setHasIcon = useCallback( ( tag: string, feedId: number, hasIcon: boolean ) => {
		setAdded( ( prev ) => {
			const existing = prev[ tag ];
			if ( ! existing ) {
				return prev;
			}
			let mutated = false;
			const next = existing.map( ( e ) => {
				if ( e.feed_ID !== feedId || e.has_icon === hasIcon ) {
					return e;
				}
				mutated = true;
				return { ...e, has_icon: hasIcon };
			} );
			if ( ! mutated ) {
				return prev;
			}
			return { ...prev, [ tag ]: next };
		} );
	}, [] );

	const clear = useCallback( () => {
		setAdded( {} );
	}, [] );

	const isAdded = useCallback(
		( tag: string, feedId: number ) =>
			Boolean( added[ tag ]?.some( ( e ) => e.feed_ID === feedId ) ),
		[ added ]
	);

	return { added, add, remove, setHasIcon, clear, isAdded };
}
