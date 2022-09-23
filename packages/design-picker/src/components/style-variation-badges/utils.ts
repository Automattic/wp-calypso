import type {
	StyleVariation,
	StyleVariationSettingsColorPalette,
	StyleVariationPreview,
	StyleVariationPreviewColorPalette,
} from '../../types';

const COLOR_PALETTE_SUPPORTS = [ 'background', 'foreground', 'primary' ];

function getValueFromVariationSettingColorPalette(
	variation: StyleVariation,
	name: string
): string | undefined {
	const palette = variation.settings?.color?.palette?.theme || [];
	return palette.find( ( item: StyleVariationSettingsColorPalette ) => item.slug === name )?.color;
}

export function getPreviewStylesFromVariation( variation: StyleVariation ): StyleVariationPreview {
	let color: StyleVariationPreviewColorPalette = {};
	for ( const key of COLOR_PALETTE_SUPPORTS ) {
		const value = getValueFromVariationSettingColorPalette( variation, key );
		color = { ...color, ...( value && { [ key ]: value } ) };
	}

	return { color };
}
