import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import ensureCurrentFirst, {
	dedupeByTitle,
	findMatchingVariation,
} from '../utils/ensure-current-first';
import useGlobalStyles from './use-global-styles';
import useStyles from './use-styles';
import type { GlobalStyles, StyleVariation } from '../components/styles-preview';

interface Options {
	variations?: StyleVariation[];
	/** Highlighted title until the live value is read from the store. */
	initialActiveTitle?: string | null;
	/** Reads the live value from the editor's global styles. */
	getLiveValue: ( globalStyles: GlobalStyles ) => unknown;
	/** Extracts the comparable value from a variation. */
	getValue: ( variation: StyleVariation ) => unknown;
	/** Creates the synthetic "Current" variation when nothing matches; the hook adds its title. */
	createCurrent: (
		liveValue: unknown,
		globalStyles: GlobalStyles
	) => Omit< StyleVariation, 'title' > | null;
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
}: Options ) {
	const setStyles = useStyles();
	const [ activeTitle, setActiveTitle ] = useState< string | null >( initialActiveTitle );

	// Drop falsy/untitled entries and duplicate titles before any render.
	const safeVariations = useMemo(
		() => ( Array.isArray( variations ) ? dedupeByTitle( variations.filter( Boolean ) ) : [] ),
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
			ensureCurrentFirst( safeVariations, liveValue, accessorsRef.current.getValue, () => {
				const current = accessorsRef.current.createCurrent( liveValue, globalStyles );
				return current ? { ...current, title: __( 'Current', __i18n_text_domain__ ) } : null;
			} )
		);
	}, [ liveValue, safeVariations, globalStyles ] );

	// Highlight the variation matching the editor's live value. Several
	// variations can share the value (e.g. fonts with one family list), so the
	// currently-highlighted one wins the tie — the user's pick stays put.
	useEffect( () => {
		if ( ! liveValue || ! sortedVariations.length ) {
			return;
		}
		const liveString = JSON.stringify( liveValue );
		setActiveTitle( ( current ) => {
			const currentVariation = sortedVariations.find( ( v ) => v.title === current );
			if (
				currentVariation &&
				JSON.stringify( accessorsRef.current.getValue( currentVariation ) ) === liveString
			) {
				return current;
			}
			return (
				findMatchingVariation( sortedVariations, liveValue, accessorsRef.current.getValue )
					?.title ?? null
			);
		} );
	}, [ liveValue, sortedVariations ] );

	const handleSelect = useCallback(
		( variation: StyleVariation ) => {
			if ( setStyles( variation ) ) {
				setActiveTitle( variation.title ?? null );
			}
		},
		[ setStyles ]
	);

	return { sortedVariations, activeTitle, handleSelect };
}
