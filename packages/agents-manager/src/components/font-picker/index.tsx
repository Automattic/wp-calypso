import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import useGlobalStyles from '../../hooks/use-global-styles';
import useStyles from '../../hooks/use-styles';
import ensureCurrentFirst from '../../utils/ensure-current-first';
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
	onSelect = () => {},
}: Props ) {
	const setStyles = useStyles( { injectFonts: true } );
	const [ activeFont, setActiveFont ] = useState< string | null >( currentFont );

	// Combine theme + dynamic + direct variations and deduplicate by title.
	const fontVariations = useMemo( () => {
		const safe = Array.isArray( variations ) ? variations : [];
		const safeTheme = Array.isArray( themeVariations ) ? themeVariations : [];
		const safeDynamic = Array.isArray( dynamicVariations ) ? dynamicVariations : [];
		const combined = [ ...safeTheme, ...safeDynamic, ...safe ].filter( Boolean );

		const seen = new Set< string >();
		return combined.filter( ( v ) => {
			if ( ! v.title || seen.has( v.title ) ) {
				return false;
			}
			seen.add( v.title );
			return true;
		} );
	}, [ variations, themeVariations, dynamicVariations ] );

	// Read current font families from the editor's global styles.
	const { globalStyles } = useGlobalStyles();
	const liveFontFamilies = globalStyles?.settings?.typography?.fontFamilies?.theme ?? null;

	// Move the currently-applied font to index 0 (once, when the store loads).
	const [ sortedVariations, setSortedVariations ] = useState( fontVariations );
	const hasSortedRef = useRef( false );

	useEffect( () => {
		if ( hasSortedRef.current || ! liveFontFamilies ) {
			return;
		}
		hasSortedRef.current = true;
		setSortedVariations(
			ensureCurrentFirst(
				fontVariations,
				liveFontFamilies,
				( v ) => v.settings?.typography?.fontFamilies?.theme,
				() =>
					liveFontFamilies
						? ( {
								title: __( 'Current', __i18n_text_domain__ ),
								settings: { typography: { fontFamilies: { theme: liveFontFamilies } } },
						  } as StyleVariation )
						: null
			)
		);
	}, [ liveFontFamilies, fontVariations, globalStyles ] );

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

	// Highlight the variation matching the editor's current font families.
	useEffect( () => {
		if ( ! liveFontFamilies || ! sortedVariations.length ) {
			return;
		}
		const familiesStr = JSON.stringify( liveFontFamilies );
		const match = sortedVariations.find(
			( v ) => JSON.stringify( v.settings?.typography?.fontFamilies?.theme ) === familiesStr
		);
		setActiveFont( match?.title ?? null );
	}, [ liveFontFamilies, sortedVariations ] );

	const handleSelect = useCallback(
		( variation: StyleVariation ) => {
			setStyles( variation );
			setActiveFont( variation.title ?? null );
			onSelect?.( variation );
		},
		[ setStyles, onSelect ]
	);

	if ( ! sortedVariations.length ) {
		return null;
	}

	return (
		<VariationPicker
			variations={ sortedVariations }
			maxToShow={ MAX_FONTS_TO_SHOW }
			type="font"
			onSelect={ handleSelect }
			activeVariationTitle={ activeFont }
			fontFamiliesToCSS={ fontFamiliesToCSS }
		/>
	);
}
