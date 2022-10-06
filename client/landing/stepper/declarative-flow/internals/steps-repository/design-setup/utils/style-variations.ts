import { Design } from 'calypso/../packages/design-picker/src/types';

/**
 * Removes designs that are style variation of another design.
 * E.g.: twentytwentytwo-swiss, because twentytwentytwo already has Swiss style variation.
 */
export function removeLegacyDesignVariations( designs: Design[] ) {
	const designsWithVariations = designs.filter(
		( design ) => design.style_variations && design.style_variations.length > 0
	);
	const isVariationOfAnotherDesign = ( design: Design ) =>
		designsWithVariations.some( ( designWithVariations ) =>
			design.slug.startsWith( designWithVariations.slug + '-' )
		);
	return designs.filter( ( design ) => ! isVariationOfAnotherDesign( design ) );
}

/**
 * Promote designs with style variations by having them at the beginning of the list.
 */
export function promoteDesignVariations( designs: Design[] ) {
	return designs.sort( ( a, b ) => {
		const a_style_variations = a.style_variations || [];
		const b_style_variations = b.style_variations || [];

		// Keep original order if:
		// (1) neither a or b have style variations or
		// (2) both a and b have style variations
		if (
			( a_style_variations.length === 0 && b_style_variations.length === 0 ) ||
			( a_style_variations.length > 0 && b_style_variations.length > 0 )
		) {
			return 0;
		}

		// Sort b before a if it has style variations.
		return b_style_variations.length > a_style_variations.length ? 1 : -1;
	} );
}
