import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import useGlobalStyles from '../../hooks/use-global-styles';
import useStyles from '../../hooks/use-styles';
import ensureCurrentFirst from '../../utils/ensure-current-first';
import VariationPicker from '../variation-picker';
import type { StyleVariation } from '../styles-preview';

const MAX_COLORS_TO_SHOW = 4;

interface Props {
	variations: StyleVariation[];
	currentColor?: string | null;
	onSelect?: ( variation: StyleVariation ) => void;
}

export default function ColorPicker( {
	variations,
	currentColor = null,
	onSelect = () => {},
}: Props ) {
	const setStyles = useStyles();
	const [ activeColor, setActiveColor ] = useState< string | null >( currentColor );

	// Read current color palette from the editor's global styles.
	const { globalStyles } = useGlobalStyles();
	const livePalette =
		( globalStyles?.settings?.color?.palette as Record< string, unknown > )?.theme ?? null;

	const safeVariations = useMemo(
		() => ( Array.isArray( variations ) ? variations : [] ),
		[ variations ]
	);

	// Move the currently-applied color to index 0 (once, when the store loads).
	const [ sortedVariations, setSortedVariations ] = useState( safeVariations );
	const hasSortedRef = useRef( false );

	useEffect( () => {
		if ( hasSortedRef.current || ! livePalette ) {
			return;
		}
		hasSortedRef.current = true;
		setSortedVariations(
			ensureCurrentFirst(
				safeVariations,
				livePalette,
				( v ) => v.settings?.color?.palette?.theme,
				() =>
					globalStyles
						? ( {
								title: __( 'Current', '__i18n_text_domain__' ),
								settings: { color: { palette: { theme: livePalette } } },
								styles: globalStyles.styles ?? {},
						  } as StyleVariation )
						: null
			)
		);
	}, [ livePalette, safeVariations, globalStyles ] );

	// Highlight the variation matching the editor's current palette.
	useEffect( () => {
		if ( ! livePalette || ! sortedVariations.length ) {
			return;
		}
		const paletteStr = JSON.stringify( livePalette );
		const match = sortedVariations.find(
			( v ) => JSON.stringify( v.settings?.color?.palette?.theme ) === paletteStr
		);
		setActiveColor( match?.title ?? null );
	}, [ livePalette, sortedVariations ] );

	const handleSelect = useCallback(
		( variation: StyleVariation ) => {
			setStyles( variation );
			setActiveColor( variation.title ?? null );
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
			maxToShow={ MAX_COLORS_TO_SHOW }
			type="color"
			onSelect={ handleSelect }
			activeVariationTitle={ activeColor }
		/>
	);
}
