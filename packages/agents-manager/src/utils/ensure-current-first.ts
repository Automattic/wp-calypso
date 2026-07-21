import type { StyleVariation } from '../components/styles-preview';

/**
 * Deduplicates variations by title, dropping untitled ones.
 */
export function dedupeByTitle( variations: StyleVariation[] ): StyleVariation[] {
	const seen = new Set< string >();
	return variations.filter( ( variation ) => {
		if ( ! variation.title || seen.has( variation.title ) ) {
			return false;
		}
		seen.add( variation.title );
		return true;
	} );
}

/**
 * Finds the variation whose value matches the live editor value.
 */
export function findMatchingVariation(
	variations: StyleVariation[],
	liveValue: unknown,
	getValue: ( variation: StyleVariation ) => unknown
): StyleVariation | undefined {
	const liveStr = JSON.stringify( liveValue );
	return variations.find( ( variation ) => JSON.stringify( getValue( variation ) ) === liveStr );
}

/**
 * Ensure the currently-applied variation is the first option in the list.
 *
 * - Deduplicates variations by title.
 * - If a variation matches `liveValue`, move it to index 0.
 * - If no match and `createCurrent` is provided, prepend a synthetic variation.
 * @param variations    - The list of variations.
 * @param liveValue     - The current value from the store to match against.
 * @param getValue      - Extracts the comparable value from a variation.
 * @param createCurrent - Optional factory to create a synthetic variation when no match.
 */
export default function ensureCurrentFirst(
	variations: StyleVariation[],
	liveValue: unknown,
	getValue: ( v: StyleVariation ) => unknown,
	createCurrent?: () => StyleVariation | null
): StyleVariation[] {
	if ( ! variations.length ) {
		return variations;
	}

	const unique = dedupeByTitle( variations );

	if ( ! liveValue ) {
		return unique;
	}

	const match = findMatchingVariation( unique, liveValue, getValue );
	const matchIndex = match ? unique.indexOf( match ) : -1;

	// Match found — move to front.
	if ( matchIndex > 0 ) {
		const sorted = [ ...unique ];
		sorted.splice( matchIndex, 1 );
		return [ match as StyleVariation, ...sorted ];
	}

	// Already at index 0.
	if ( matchIndex === 0 ) {
		return unique;
	}

	// No match — prepend a synthetic "current" variation if factory provided.
	if ( createCurrent ) {
		const current = createCurrent();
		if ( current ) {
			return [ current, ...unique ];
		}
	}

	return unique;
}
