import type {
	ThemeStyleVariation,
	ThemeStyleVariationSettingsColorPalette,
	ThemeStyleVariationPreview,
} from '../../types';

const COLOR_PALETTE_SUPPORTS = [ 'background', 'foreground', 'primary', 'secondary' ];

export function getPreviewStylesFromVariation(
	variation: ThemeStyleVariation
): ThemeStyleVariationPreview {
	let color = {};
	for ( const key of COLOR_PALETTE_SUPPORTS ) {
		const value = getValueFromVariationSettingColorPalette( variation, key );
		color = { ...color, ...( value && { [ key ]: value } ) };
	}

	return { color };
}

export function getValueFromVariationSettingColorPalette(
	variation: ThemeStyleVariation,
	name: string
): string | undefined {
	const palette = variation.settings?.color?.palette?.theme || [];
	return palette.find( ( item: ThemeStyleVariationSettingsColorPalette ) => item.slug === name )
		?.color;
}
