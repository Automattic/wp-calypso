import type { NamePulseDomainResult } from './types';

/**
 * The suggestions endpoint takes no filter, so the selected endings are applied
 * to the rows. Nothing selected keeps every row.
 */
export function filterNamePulseSuggestions(
	results: NamePulseDomainResult[],
	selectedTlds: readonly string[]
): NamePulseDomainResult[] {
	if ( selectedTlds.length === 0 ) {
		return results;
	}

	return results.filter( ( result ) => selectedTlds.includes( result.suffix ) );
}
