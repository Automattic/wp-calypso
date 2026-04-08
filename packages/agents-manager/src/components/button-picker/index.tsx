import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import useGlobalStyles from '../../hooks/use-global-styles';
import useStyles from '../../hooks/use-styles';
import ensureCurrentFirst from '../../utils/ensure-current-first';
import VariationPicker from '../variation-picker';
import type { StyleVariation } from '../styles-preview';

const MAX_BUTTONS_TO_SHOW = 12;

interface Props {
	buttonVariations?: StyleVariation[];
	maxButtonsToShow?: number;
	currentButtonStyle?: string | null;
	onSelect?: ( variation: StyleVariation ) => void;
}

export default function ButtonPicker( {
	buttonVariations,
	maxButtonsToShow = MAX_BUTTONS_TO_SHOW,
	currentButtonStyle = null,
	onSelect = () => {},
}: Props ) {
	const setStyles = useStyles();
	const [ activeButton, setActiveButton ] = useState< string | null >( currentButtonStyle );

	const safeVariations = useMemo(
		() => ( Array.isArray( buttonVariations ) ? buttonVariations : [] ),
		[ buttonVariations ]
	);

	// Read current button border from the editor's global styles.
	const { globalStyles } = useGlobalStyles();
	const liveButtonBorder =
		(
			( globalStyles?.styles?.elements as Record< string, unknown > )?.button as Record<
				string,
				unknown
			>
		 )?.border ?? null;

	// Move the currently-applied button style to index 0 (once, when the store loads).
	const [ sortedVariations, setSortedVariations ] = useState( safeVariations );
	const hasSortedRef = useRef( false );

	useEffect( () => {
		if ( hasSortedRef.current || ! liveButtonBorder ) {
			return;
		}
		hasSortedRef.current = true;
		setSortedVariations(
			ensureCurrentFirst(
				safeVariations,
				liveButtonBorder,
				( v ) => {
					const btn = v.styles?.elements?.button as Record< string, unknown > | undefined;
					return btn?.border;
				},
				() =>
					liveButtonBorder
						? ( {
								title: __( 'Current', '__i18n_text_domain__' ),
								styles: {
									elements: {
										button: { border: liveButtonBorder },
									},
								},
						  } as StyleVariation )
						: null
			)
		);
	}, [ liveButtonBorder, safeVariations, globalStyles ] );

	// Highlight the variation matching the editor's current button border.
	useEffect( () => {
		if ( ! liveButtonBorder || ! sortedVariations.length ) {
			return;
		}
		const borderStr = JSON.stringify( liveButtonBorder );
		const match = sortedVariations.find( ( v ) => {
			const btn = v.styles?.elements?.button as Record< string, unknown > | undefined;
			return JSON.stringify( btn?.border ) === borderStr;
		} );
		setActiveButton( match?.title ?? null );
	}, [ liveButtonBorder, sortedVariations ] );

	const handleSelect = useCallback(
		( variation: StyleVariation ) => {
			setStyles( variation );
			setActiveButton( variation.title ?? null );
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
			maxToShow={ maxButtonsToShow }
			type="button"
			onSelect={ handleSelect }
			activeVariationTitle={ activeButton }
		/>
	);
}
