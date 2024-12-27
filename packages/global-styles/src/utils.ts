import { DEFAULT_GLOBAL_STYLES_VARIATION_TITLE } from './constants';
import { isDefaultVariation, isColorVariation, isFontVariation } from './gutenberg-bridge';
import { GlobalStylesObject, GlobalStylesVariationType } from './types';

export const getVariationTitle = ( variation: GlobalStylesObject | null ) =>
	variation?.title ?? DEFAULT_GLOBAL_STYLES_VARIATION_TITLE;

export const getVariationType = (
	variation: GlobalStylesObject | null
): GlobalStylesVariationType =>
	variation && isDefaultVariation( variation )
		? GlobalStylesVariationType.Premium
		: GlobalStylesVariationType.Free;

const filterVariationsWithSameSlug = ( variations: GlobalStylesObject[] ) =>
	variations.filter(
		( value, index, self ) => index === self.findIndex( ( { slug } ) => slug === value.slug )
	);

export const getGroupedVariations = ( variations: GlobalStylesObject[] ) => {
	let defaultVariation;
	const styleVariations = [];
	const colorVariations = [];
	const fontVariations = [];

	for ( let i = 0; i < variations.length; i++ ) {
		const variation = variations[ i ];
		if ( isDefaultVariation( variation ) ) {
			defaultVariation = variation;
		} else if ( isColorVariation( variation ) ) {
			colorVariations.push( variation );
		} else if ( isFontVariation( variation ) ) {
			fontVariations.push( variation );
		} else {
			styleVariations.push( variation );
		}
	}

	return {
		defaultVariation,
		styleVariations: filterVariationsWithSameSlug( styleVariations ),
		colorVariations: filterVariationsWithSameSlug( colorVariations ),
		fontVariations: filterVariationsWithSameSlug( fontVariations ),
	};
};
