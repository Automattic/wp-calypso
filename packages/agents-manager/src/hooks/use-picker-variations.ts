import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import ensureCurrentFirst, {
	dedupeByTitle,
	findMatchingVariation,
} from '../utils/ensure-current-first';
import { setSiteEditorAction } from '../utils/site-editor-context';
import { recordBigSkyTracksEvent } from '../utils/tracks';
import useGlobalStyles from './use-global-styles';
import useStyles, { type StyleVariationType } from './use-styles';
import type { GlobalStyles, StyleVariation } from '../components/styles-preview';

// Hard cap on rendered options — every card is a full editor iframe and the
// list length comes from model-generated props.
const MAX_VARIATIONS = 24;

interface Options {
	variations?: StyleVariation[];
	/** Recorded into `siteEditorActions` (agent context) when a pick applies. */
	pickActionName?: string;
	/** Applies the type's pre-merge style reset (button/font) on pick. */
	variationType?: StyleVariationType;
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
 * first (once, when the live value first loads), highlights the matching
 * title, and applies selections to the editor's global styles.
 */
export default function usePickerVariations( {
	variations,
	pickActionName,
	variationType,
	getLiveValue,
	getValue,
	createCurrent,
}: Options ) {
	const setStyles = useStyles();
	const [ activeTitle, setActiveTitle ] = useState< string | null >( null );

	// Drop falsy/untitled entries and duplicate titles before any render.
	const safeVariations = useMemo(
		() =>
			Array.isArray( variations )
				? dedupeByTitle( variations.filter( Boolean ) ).slice( 0, MAX_VARIATIONS )
				: [],
		[ variations ]
	);

	const { globalStyles } = useGlobalStyles();
	const liveValue = ( globalStyles && getLiveValue( globalStyles ) ) ?? null;

	// Accessors are inline arrows at call sites; read them through a ref so
	// the effects depend on data only.
	const accessorsRef = useRef( { getValue, createCurrent } );
	accessorsRef.current = { getValue, createCurrent };

	// Move the currently-applied variation to index 0 — once, when the live
	// value first loads. Picking marks the sort done so a late-arriving live
	// value can never reshuffle the grid under the user.
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
			hasSortedRef.current = true;
			if ( variationType ) {
				// Big Sky's variation-click event names and props, so the
				// existing dashboards keep working.
				recordBigSkyTracksEvent( `${ variationType }_variation_click`, {
					[ variationType ]: variation.title,
				} );
			}
			if ( setStyles( variation, variationType ) ) {
				setActiveTitle( variation.title ?? null );
				if ( pickActionName ) {
					setSiteEditorAction( pickActionName, variation.title ?? null );
				}
			}
		},
		[ setStyles, pickActionName, variationType ]
	);

	return { sortedVariations, activeTitle, handleSelect };
}
