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
		const a_has_variations = ( a.style_variations || [] ).length > 0;
		const b_has_variations = ( b.style_variations || [] ).length > 0;

		// Keep original order if:
		// (1) neither a or b have style variations or
		// (2) both a and b have style variations
		if ( a_has_variations === b_has_variations ) {
			return 0;
		}

		return a_has_variations ? -1 : 1;
	} );
}
