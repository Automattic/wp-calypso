/**
 * External dependencies
 */
import { getCategories } from '@wordpress/blocks';

/**
 * Accepts an array of category names and returns the first one that
 * exists in the categories returned by `getCategories`. This allows
 * for a "graceful degradation" strategy to category names, where
 * we just add the new category name as the first item in the array
 * argument, and leave the old ones for environments where they still
 * exist and are used.
 *
 * @example
 * // Prefer passing the new category first in the array, followed by
 * // older fallback categories. Considering the 'new' category is
 * // registered:
 * getCategoryWithFallbacks( 'new', 'old', 'older' );
 * // => 'new'
 *
 * @param {string[]} requestedCategories - an array of categories.
 * @returns {string} the first category name found.
 * @throws {Error} if the no categories could be found.
 */
export function getCategoryWithFallbacks( ...requestedCategories: string[] ): string {
	const knownCategories = getCategories();
	for ( const requestedCategory of requestedCategories ) {
		if ( knownCategories.some( ( { slug } ) => slug === requestedCategory ) ) {
			return requestedCategory;
		}
	}
	throw new Error(
		`Could not find a category from the provided list: ${ requestedCategories.join( ',' ) }`
	);
}
