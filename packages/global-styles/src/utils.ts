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

export const getGroupedVariations = ( variations: GlobalStylesObject[] ) => {
	return variations.reduce(
		( acc, variation ) => {
			if ( isDefaultVariation( variation ) ) {
				return {
					...acc,
					defaultVariation: variation,
				};
			}

			if ( isColorVariation( variation ) ) {
				return {
					...acc,
					colorVariations: [ ...acc.colorVariations, variation ],
				};
			}

			if ( isFontVariation( variation ) ) {
				return {
					...acc,
					fontVariations: [ ...acc.fontVariations, variation ],
				};
			}

			return {
				...acc,
				styleVariations: [ ...acc.styleVariations, variation ],
			};
		},
		{
			defaultVariation: undefined,
			styleVariations: [],
			colorVariations: [],
			fontVariations: [],
		}
	);
};
