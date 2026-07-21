import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import ensureCurrentFirst, { findMatchingVariation } from '../utils/ensure-current-first';
import useGlobalStyles from './use-global-styles';
import useStyles from './use-styles';
import type { GlobalStyles, StyleVariation } from '../components/styles-preview';

interface Options {
	variations?: StyleVariation[];
	/** Highlighted title until the live value matches a variation. */
	initialActiveTitle?: string | null;
	/** Reads the live value from the editor's global styles. */
	getLiveValue: ( globalStyles: GlobalStyles ) => unknown;
	/** Extracts the comparable value from a variation. */
	getValue: ( variation: StyleVariation ) => unknown;
	/** Creates a synthetic "Current" variation when nothing matches the live value. */
	createCurrent: ( liveValue: unknown, globalStyles: GlobalStyles ) => StyleVariation | null;
	/** Inject `@font-face` CSS into the editor iframe after applying. */
	injectFonts?: boolean;
	onSelect?: ( variation: StyleVariation ) => void;
}

/**
 * Shared state for the style pickers: sorts the currently-applied variation
 * first (once, when the store loads), highlights the matching title, and
 * applies selections to the editor's global styles.
 */
export default function usePickerVariations( {
	variations,
	initialActiveTitle = null,
	getLiveValue,
	getValue,
	createCurrent,
	injectFonts,
	onSelect,
}: Options ) {
	const setStyles = useStyles( { injectFonts } );
	const [ activeTitle, setActiveTitle ] = useState< string | null >( initialActiveTitle );

	const safeVariations = useMemo(
		() => ( Array.isArray( variations ) ? variations : [] ),
		[ variations ]
	);

	const { globalStyles } = useGlobalStyles();
	const liveValue = ( globalStyles && getLiveValue( globalStyles ) ) ?? null;

	// Accessors are inline arrows at call sites; read them through a ref so
	// the effects depend on data only.
	const accessorsRef = useRef( { getValue, createCurrent } );
	accessorsRef.current = { getValue, createCurrent };

	// Move the currently-applied variation to index 0 (once, when the store loads).
	const [ sortedVariations, setSortedVariations ] = useState( safeVariations );
	const hasSortedRef = useRef( false );

	useEffect( () => {
		if ( hasSortedRef.current || ! liveValue || ! globalStyles ) {
			return;
		}
		hasSortedRef.current = true;

		setSortedVariations(
			ensureCurrentFirst( safeVariations, liveValue, accessorsRef.current.getValue, () =>
				accessorsRef.current.createCurrent( liveValue, globalStyles )
			)
		);
	}, [ liveValue, safeVariations, globalStyles ] );

	// Highlight the variation matching the editor's live value.
	useEffect( () => {
		if ( ! liveValue || ! sortedVariations.length ) {
			return;
		}
		const match = findMatchingVariation(
			sortedVariations,
			liveValue,
			accessorsRef.current.getValue
		);
		setActiveTitle( match?.title ?? null );
	}, [ liveValue, sortedVariations ] );

	const handleSelect = useCallback(
		( variation: StyleVariation ) => {
			setStyles( variation );
			setActiveTitle( variation.title ?? null );
			onSelect?.( variation );
		},
		[ setStyles, onSelect ]
	);

	return { sortedVariations, activeTitle, handleSelect };
}
