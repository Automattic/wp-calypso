import type { Pattern } from 'calypso/my-sites/patterns/types';

export const QUERY_PARAM_SEARCH = 's';

/**
 * Filter patterns by looking at their titles, descriptions and category names
 */
export function filterPatternsByTerm( patterns: Pattern[], searchTerm: string ) {
	const lowerCaseSearchTerms = searchTerm.toLowerCase().trim().split( /\s+/ );

	return patterns
		.filter( ( pattern ) => {
			const patternCategories = Object.values( pattern.categories ).map(
				( category ) => category?.title
			);

			// Filters out falsy values in a way TS can understand
			const fields = [ pattern.title, pattern.description, ...patternCategories ].filter(
				( x ): x is NonNullable< typeof x > => Boolean( x )
			);

			// If any of the fields matches all parts of the search term, return true
			return fields.some( ( field ) =>
				lowerCaseSearchTerms.every( ( term ) => field.toLowerCase().includes( term ) )
			);
		} )
		.sort( ( a, b ) => {
			// Makes sure patterns that can be copied appears in first position in the search results

			if ( a.can_be_copied_without_account === true && b.can_be_copied_without_account === false ) {
				return -1;
			}

			if ( a.can_be_copied_without_account === false && b.can_be_copied_without_account === true ) {
				return 1;
			}

			return 0;
		} );
}
