import { useCallback, useEffect, useMemo } from '@wordpress/element';
import usePickerVariations from '../../hooks/use-picker-variations';
import { injectFontFamiliesIntoEditorIframe } from '../../utils/font-families-to-css';
import VariationPicker from '../variation-picker';
import type { PickerSurfaceProps } from '../style-pickers/types';
import type { StyleVariation } from '../styles-preview';

interface Props extends PickerSurfaceProps {
	variations?: StyleVariation[];
	themeVariations?: StyleVariation[];
	dynamicVariations?: StyleVariation[];
	isMessageStale?: boolean;
}

export default function FontPicker( {
	variations = [],
	themeVariations = [],
	dynamicVariations = [],
	surfaceId,
	disabled,
	isMessageStale,
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
		surfaceId,
		variationType: 'font',
		getLiveValue: ( globalStyles ) => globalStyles.settings?.typography?.fontFamilies?.theme,
		getValue: ( variation ) => variation.settings?.typography?.fontFamilies?.theme,
		createCurrent: ( liveValue, globalStyles ) =>
			( {
				settings: { typography: { fontFamilies: { theme: liveValue } } },
				// Snapshot the applied typography so "Current" previews and
				// restores the actual live font, not just the family list.
				styles: globalStyles.styles ?? {},
			} ) as Omit< StyleVariation, 'title' >,
	} );

	// Pre-load every variation's fonts in the editor canvas so previews and
	// applying a pick don't flash unstyled text. A stale picker skips it, since it can't apply a pick.
	useEffect( () => {
		if ( isMessageStale ) {
			return;
		}

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
			disabled={ disabled }
			onSelect={ handlePick }
			activeVariationTitle={ activeTitle }
		/>
	);
}
