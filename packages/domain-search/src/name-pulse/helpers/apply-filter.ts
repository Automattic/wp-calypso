import type { NamePulseDomainResult } from './types';

/**
 * For AI suggestions, which ignore `tlds`. Nothing selected keeps every row.
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
