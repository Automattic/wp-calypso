import { useCallback, useEffect, useRef, useState } from 'react';
import type { CuratedBlogsList } from '../curated-blogs';

/**
 * Per-file operator-defined ordering of entries within each tag, persisted to
 * localStorage so an in-progress sort session survives a page refresh.
 *
 * Internally stored as:
 *   `Record<fileSlug, Record<tag, feed_ID[]>>`
 * where each `feed_ID[]` is the desired position-order for that tag. When a
 * slug / tag pair has no entry the source-file order is used as the default.
 */

const STORAGE_KEY = 'reader/curated-review/tag-order';

type OrderMap = Record< string, Record< string, number[] > >;

function loadFromStorage(): OrderMap {
	if ( typeof window === 'undefined' ) {
		return {};
	}
	try {
		const raw = window.localStorage.getItem( STORAGE_KEY );
		if ( ! raw ) {
			return {};
		}
		const parsed = JSON.parse( raw );
		if ( ! parsed || typeof parsed !== 'object' || Array.isArray( parsed ) ) {
			return {};
		}
		return parsed as OrderMap;
	} catch {
		return {};
	}
}

function persistToStorage( value: OrderMap ): void {
	if ( typeof window === 'undefined' ) {
		return;
	}
	try {
		window.localStorage.setItem( STORAGE_KEY, JSON.stringify( value ) );
	} catch {
		// Ignore quota / privacy errors — in-memory state still works.
	}
}

export interface UseTagOrderResult {
	/**
	 * Apply the persisted ordering to a tag's entries. Returns the source array
	 * if no override exists for this file/tag (no-op, no allocation).
	 */
	applyOrder: < T extends { feed_ID: number } >(
		fileSlug: string,
		tag: string,
		entries: T[]
	) => T[];
	/**
	 * Move the entry at `feed_ID` one position up (towards index 0) within its
	 * tag. No-op if it is already first.
	 */
	moveUp: ( fileSlug: string, tag: string, tagMap: CuratedBlogsList, feedId: number ) => void;
	/**
	 * Move the entry at `feed_ID` one position down (towards the end) within its
	 * tag. No-op if it is already last.
	 */
	moveDown: ( fileSlug: string, tag: string, tagMap: CuratedBlogsList, feedId: number ) => void;
	/** Remove all ordering overrides for a file. */
	resetFile: ( fileSlug: string ) => void;
	/** True when any file has at least one ordering override. */
	hasAnyOverride: boolean;
	/**
	 * Replace the entire order for a specific file/tag with a pre-sorted
	 * `feed_ID[]`. Used by auto-sort to write a computed ordering all at once
	 * rather than swapping one pair at a time.
	 */
	setOrder: ( fileSlug: string, tag: string, feedIds: number[] ) => void;
}

/**
 * Per-file / per-tag entry ordering for the curated-review tool. Persists to
 * localStorage under a single key so overrides survive page refreshes.
 *
 * Reordering is relative to the canonical source-file order: the hook
 * materialises the full ordered `feed_ID[]` for a tag on first mutation (seeded
 * from the source) and then swaps the two adjacent positions.
 */
export function useTagOrder(): UseTagOrderResult {
	const [ orderMap, setOrderMap ] = useState< OrderMap >( loadFromStorage );
	const prevOrderMap = useRef( orderMap );

	useEffect( () => {
		if ( prevOrderMap.current !== orderMap ) {
			prevOrderMap.current = orderMap;
			persistToStorage( orderMap );
		}
	}, [ orderMap ] );

	const applyOrder = useCallback(
		< T extends { feed_ID: number } >( fileSlug: string, tag: string, entries: T[] ): T[] => {
			const tagOverride = orderMap[ fileSlug ]?.[ tag ];
			if ( ! tagOverride || tagOverride.length === 0 ) {
				return entries;
			}
			// Build a lookup so we can reconstruct in override order.
			const byId = new Map< number, T >( entries.map( ( e ) => [ e.feed_ID, e ] ) );
			const ordered: T[] = [];
			// Emit in override order, skipping stale IDs (deleted from source).
			for ( const id of tagOverride ) {
				const entry = byId.get( id );
				if ( entry ) {
					ordered.push( entry );
					byId.delete( id );
				}
			}
			// Append any entries added to the source after the last reorder.
			for ( const entry of byId.values() ) {
				ordered.push( entry );
			}
			return ordered;
		},
		[ orderMap ]
	);

	const getOrInitOrder = (
		prev: OrderMap,
		fileSlug: string,
		tag: string,
		tagMap: CuratedBlogsList
	): number[] => {
		return prev[ fileSlug ]?.[ tag ] ?? ( tagMap[ tag ] ?? [] ).map( ( e ) => e.feed_ID );
	};

	const moveUp = useCallback(
		( fileSlug: string, tag: string, tagMap: CuratedBlogsList, feedId: number ) => {
			setOrderMap( ( prev ) => {
				const order = [ ...getOrInitOrder( prev, fileSlug, tag, tagMap ) ];
				const idx = order.indexOf( feedId );
				if ( idx <= 0 ) {
					return prev;
				}
				[ order[ idx - 1 ], order[ idx ] ] = [ order[ idx ], order[ idx - 1 ] ];
				return {
					...prev,
					[ fileSlug ]: { ...( prev[ fileSlug ] ?? {} ), [ tag ]: order },
				};
			} );
		},
		[]
	);

	const moveDown = useCallback(
		( fileSlug: string, tag: string, tagMap: CuratedBlogsList, feedId: number ) => {
			setOrderMap( ( prev ) => {
				const order = [ ...getOrInitOrder( prev, fileSlug, tag, tagMap ) ];
				const idx = order.indexOf( feedId );
				if ( idx < 0 || idx >= order.length - 1 ) {
					return prev;
				}
				[ order[ idx ], order[ idx + 1 ] ] = [ order[ idx + 1 ], order[ idx ] ];
				return {
					...prev,
					[ fileSlug ]: { ...( prev[ fileSlug ] ?? {} ), [ tag ]: order },
				};
			} );
		},
		[]
	);

	const resetFile = useCallback( ( fileSlug: string ) => {
		setOrderMap( ( prev ) => {
			const next = { ...prev };
			delete next[ fileSlug ];
			return next;
		} );
	}, [] );

	const setOrder = useCallback( ( fileSlug: string, tag: string, feedIds: number[] ) => {
		setOrderMap( ( prev ) => ( {
			...prev,
			[ fileSlug ]: { ...( prev[ fileSlug ] ?? {} ), [ tag ]: feedIds },
		} ) );
	}, [] );

	const hasAnyOverride = Object.keys( orderMap ).length > 0;

	return { applyOrder, moveUp, moveDown, resetFile, hasAnyOverride, setOrder };
}
