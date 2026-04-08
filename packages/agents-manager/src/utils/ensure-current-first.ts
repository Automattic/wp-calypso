import type { StyleVariation } from '../components/styles-preview';

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

	// Deduplicate by title.
	const seen = new Set< string >();
	const unique = variations.filter( ( v ) => {
		if ( ! v.title || seen.has( v.title ) ) {
			return false;
		}
		seen.add( v.title );
		return true;
	} );

	if ( ! liveValue ) {
		return unique;
	}

	const liveStr = JSON.stringify( liveValue );
	const matchIndex = unique.findIndex( ( v ) => JSON.stringify( getValue( v ) ) === liveStr );

	// Match found — move to front.
	if ( matchIndex > 0 ) {
		const sorted = [ ...unique ];
		const [ match ] = sorted.splice( matchIndex, 1 );
		return [ match, ...sorted ];
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
