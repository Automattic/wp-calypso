import { useEffect, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import usePickerVariations from '../../hooks/use-picker-variations';
import { dedupeByTitle } from '../../utils/ensure-current-first';
import {
	injectFontFamiliesIntoEditorIframe,
	fontFamiliesToCSS,
} from '../../utils/font-families-to-css';
import VariationPicker from '../variation-picker';
import type { StyleVariation } from '../styles-preview';

const MAX_FONTS_TO_SHOW = 4;

interface Props {
	variations?: StyleVariation[];
	themeVariations?: StyleVariation[];
	dynamicVariations?: StyleVariation[];
	currentFont?: string | null;
	onSelect?: ( variation: StyleVariation ) => void;
}

export default function FontPicker( {
	variations = [],
	themeVariations = [],
	dynamicVariations = [],
	currentFont = null,
	onSelect,
}: Props ) {
	// Combine theme + dynamic + direct variations and deduplicate by title.
	const fontVariations = useMemo( () => {
		const safe = Array.isArray( variations ) ? variations : [];
		const safeTheme = Array.isArray( themeVariations ) ? themeVariations : [];
		const safeDynamic = Array.isArray( dynamicVariations ) ? dynamicVariations : [];
		return dedupeByTitle( [ ...safeTheme, ...safeDynamic, ...safe ].filter( Boolean ) );
	}, [ variations, themeVariations, dynamicVariations ] );

	const { sortedVariations, activeTitle, handleSelect } = usePickerVariations( {
		variations: fontVariations,
		initialActiveTitle: currentFont,
		getLiveValue: ( globalStyles ) => globalStyles.settings?.typography?.fontFamilies?.theme,
		getValue: ( variation ) => variation.settings?.typography?.fontFamilies?.theme,
		createCurrent: ( liveValue ) =>
			( {
				title: __( 'Current', __i18n_text_domain__ ),
				settings: { typography: { fontFamilies: { theme: liveValue } } },
			} ) as StyleVariation,
		injectFonts: true,
		onSelect,
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

	if ( ! sortedVariations.length ) {
		return null;
	}

	return (
		<VariationPicker
			variations={ sortedVariations }
			maxToShow={ MAX_FONTS_TO_SHOW }
			type="font"
			onSelect={ handleSelect }
			activeVariationTitle={ activeTitle }
			fontFamiliesToCSS={ fontFamiliesToCSS }
		/>
	);
}
