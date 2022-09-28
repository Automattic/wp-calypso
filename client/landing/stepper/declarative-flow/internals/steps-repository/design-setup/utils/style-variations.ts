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
