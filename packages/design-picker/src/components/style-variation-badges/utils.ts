import { hexToRgb, hasMinContrast } from '@automattic/onboarding';
import type {
	StyleVariation,
	StyleVariationSettingsColorPalette,
	StyleVariationPreviewColorPalette,
	StyleVariationStylesColor,
} from '../../types';

const COLOR_PALETTE_SUPPORTS = [ 'background', 'base', 'contrast', 'foreground', 'primary' ];

function getValueFromVariationSettingColorPalette(
	variation: StyleVariation,
	name: string
): string | undefined {
	const palette = variation.settings?.color?.palette?.theme || [];
	return palette.find( ( item: StyleVariationSettingsColorPalette ) => item.slug === name )?.color;
}

function getColorBackground( color: StyleVariationPreviewColorPalette ) {
	return color.base || color.background;
}

function getColorText( color: StyleVariationPreviewColorPalette ) {
	const { contrast, foreground, primary } = color;
	if ( contrast ) {
		const backgroundRgb = hexToRgb( getColorBackground( color ) );
		const contrastRgb = hexToRgb( contrast );
		return hasMinContrast( contrastRgb, backgroundRgb, 0.2 ) ? contrast : foreground || primary;
	}

	return foreground || primary;
}

export function getStylesColorFromVariation(
	variation: StyleVariation
): StyleVariationStylesColor {
	let color: StyleVariationPreviewColorPalette = {};
	for ( const key of COLOR_PALETTE_SUPPORTS ) {
		const value = getValueFromVariationSettingColorPalette( variation, key );
		color = { ...color, ...( value && { [ key ]: value } ) };
	}

	return {
		background: getColorBackground( color ),
		text: getColorText( color ),
	};
}
