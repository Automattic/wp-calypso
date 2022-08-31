import type {
	StyleVariation,
	StyleVariationSettingsColorPalette,
	StyleVariationStylesColor,
	StyleVariationPreview,
	StyleVariationPreviewColorPalette,
} from '../../types';

const COLOR_PALETTE_SUPPORTS = [ 'background', 'foreground', 'primary', 'secondary', 'tertiary' ];

const GLOBAL_STYLES_SUPPORTS: {
	style: keyof StyleVariationStylesColor;
	infix: 'color';
	mapTo: keyof StyleVariationPreviewColorPalette;
}[] = [
	{ style: 'background', infix: 'color', mapTo: 'background' },
	{ style: 'text', infix: 'color', mapTo: 'foreground' },
];

export function getPreviewStylesFromVariation(
	variation: StyleVariation,
	coreColors?: StyleVariationPreviewColorPalette
): StyleVariationPreview {
	const globalColors = {
		...getValueFromVariationStylesColor( variation ),
		...coreColors,
	};

	let color: StyleVariationPreviewColorPalette = {};
	for ( const key of COLOR_PALETTE_SUPPORTS ) {
		const value = getValueFromVariationSettingColorPalette( variation, key );
		color = { ...color, ...( value && { [ key ]: value } ) };
	}

	// Check for global styles, they take precedence.
	if ( globalColors ) {
		for ( const globalColor of GLOBAL_STYLES_SUPPORTS ) {
			const declaration = globalColors[ globalColor.style ] ?? '';
			const preset = parsePresetDeclaration(
				declaration,
				globalColor.infix
			) as keyof StyleVariationPreviewColorPalette;
			if ( preset && color[ preset ] ) {
				color[ globalColor.mapTo ] = color[ preset ];
			}
		}
	}

	return { color };
}

export function parsePresetDeclaration( preset: string, infix: string ): string | undefined {
	return preset.match( `--wp--preset--${ infix }--([a-z]+)` )?.[ 1 ];
}

export function getValueFromVariationStylesColor(
	variation: StyleVariation
): StyleVariationStylesColor | undefined {
	return variation.styles?.color;
}

export function getValueFromVariationSettingColorPalette(
	variation: StyleVariation,
	name: string
): string | undefined {
	const palette = variation.settings?.color?.palette?.theme || [];
	return palette.find( ( item: StyleVariationSettingsColorPalette ) => item.slug === name )?.color;
}
