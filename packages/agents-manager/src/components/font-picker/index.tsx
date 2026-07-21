import { useCallback, useEffect, useMemo } from '@wordpress/element';
import usePickerVariations from '../../hooks/use-picker-variations';
import { injectFontFamiliesIntoEditorIframe } from '../../utils/font-families-to-css';
import VariationPicker from '../variation-picker';
import type { StyleVariation } from '../styles-preview';

interface Props {
	variations?: StyleVariation[];
	themeVariations?: StyleVariation[];
	dynamicVariations?: StyleVariation[];
	currentFont?: string | null;
}

export default function FontPicker( {
	variations = [],
	themeVariations = [],
	dynamicVariations = [],
	currentFont = null,
}: Props ) {
	// Combine theme + dynamic + direct variations; the picker hook dedupes by title.
	const fontVariations = useMemo( () => {
		const safe = Array.isArray( variations ) ? variations : [];
		const safeTheme = Array.isArray( themeVariations ) ? themeVariations : [];
		const safeDynamic = Array.isArray( dynamicVariations ) ? dynamicVariations : [];
		return [ ...safeTheme, ...safeDynamic, ...safe ];
	}, [ variations, themeVariations, dynamicVariations ] );

	const { sortedVariations, activeTitle, handleSelect } = usePickerVariations( {
		variations: fontVariations,
		initialActiveTitle: currentFont,
		getLiveValue: ( globalStyles ) => globalStyles.settings?.typography?.fontFamilies?.theme,
		getValue: ( variation ) => variation.settings?.typography?.fontFamilies?.theme,
		createCurrent: ( liveValue ) =>
			( {
				settings: { typography: { fontFamilies: { theme: liveValue } } },
			} ) as Omit< StyleVariation, 'title' >,
	} );

	// Load all variation fonts into the editor iframe so previews render correctly.
	useEffect( () => {
		const families = sortedVariations.flatMap(
			( v ) => v.settings?.typography?.fontFamilies?.theme ?? []
		);
		if ( families.length ) {
			injectFontFamiliesIntoEditorIframe( families );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
	}, [] );

	// Load the applied variation's fonts into the editor canvas after picking.
	const handlePick = useCallback(
		( variation: StyleVariation ) => {
			handleSelect( variation );
			const families = variation.settings?.typography?.fontFamilies?.theme;
			if ( Array.isArray( families ) ) {
				injectFontFamiliesIntoEditorIframe( families );
			}
		},
		[ handleSelect ]
	);

	if ( ! sortedVariations.length ) {
		return null;
	}

	return (
		<VariationPicker
			variations={ sortedVariations }
			type="font"
			onSelect={ handlePick }
			activeVariationTitle={ activeTitle }
		/>
	);
}
