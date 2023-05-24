import { hexToRgb, hasMinContrast } from '@automattic/onboarding';
import type {
	StyleVariation,
	StyleVariationPreviewColorPalette,
	StyleVariationStylesColor,
} from '../../types';

function getSlugValuePalette( variation: StyleVariation ): StyleVariationPreviewColorPalette {
	const palette = variation.settings?.color?.palette?.theme || [];
	return palette.reduce( ( acc, item ) => {
		acc[ item.slug ] = item.color;
		return acc;
	}, {} as StyleVariationPreviewColorPalette );
}

function getColorBackground( color: StyleVariationPreviewColorPalette ) {
	return color.gradient || color.background || color.base || '#ffffff';
}

function getColorText( color: StyleVariationPreviewColorPalette ) {
	const { contrast, foreground, primary } = color;
	if ( contrast ) {
		const backgroundRgb = hexToRgb( getColorBackground( color ) );
		const contrastRgb = hexToRgb( contrast );
		if ( hasMinContrast( contrastRgb, backgroundRgb, 0.2 ) ) {
			return contrast;
		}
	}

	// return the first color in `color` that is not contrast, foreground, primary or the result of `getColorBackground`
	let values = Object.values( color ).find(
		( value ) =>
			! [ contrast, foreground, primary ].includes( value ) &&
			value !== getColorBackground( color ) &&
			hasMinContrast( hexToRgb( value ), hexToRgb( getColorBackground( color ) ), 0.2 )
	);
	if ( ! values ) {
		values = foreground || primary;
	}
	return values;
}

export function getStylesColorFromVariation(
	variation: StyleVariation
): StyleVariationStylesColor {
	const color = getSlugValuePalette( variation );

	return {
		background: getColorBackground( color ),
		text: getColorText( color ),
	};
}
