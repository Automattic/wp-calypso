import { useColorPaletteVariations, useFontPairingVariations } from '@automattic/global-styles';
import { keyBy } from '@automattic/js-utils';
import { useSelect } from '@wordpress/data';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ONBOARD_STORE } from '../../../../../stores';
import { decodePatternId } from '../utils';
import type { Pattern, Category } from '../types';
import type { OnboardSelect } from '@automattic/data-stores';
import type { GlobalStylesObject } from '@automattic/global-styles';

const useRecipe = ( siteId = 0, patterns: Pattern[], categories: Category[] ) => {
	const [ searchParams, setSearchParams ] = useSearchParams();

	const header_pattern_id = searchParams.get( 'header_pattern_id' );
	const footer_pattern_id = searchParams.get( 'footer_pattern_id' );

	const section_pattern_ids = ( searchParams.get( 'pattern_ids' ) || '' )
		.split( ',' )
		.filter( Boolean );

	const color_variation_title = searchParams.get( 'color_variation_title' );
	const font_variation_title = searchParams.get( 'font_variation_title' );

	// Initialize the mappings once, when the patterns and categories are finally loaded
	const patternsById = useMemo( () => keyBy( patterns, 'ID' ), [ patterns.length ] ); // eslint-disable-line react-hooks/exhaustive-deps
	const categoriesByName = useMemo( () => keyBy( categories, 'name' ), [ categories.length ] ); // eslint-disable-line react-hooks/exhaustive-deps

	const header = header_pattern_id ? patternsById[ decodePatternId( header_pattern_id ) ] : null;
	const footer = footer_pattern_id ? patternsById[ decodePatternId( footer_pattern_id ) ] : null;

	/* Adds a unique "key" prop to each section pattern,
	   so that when the patterns are rendered in a list,
	   they are not re-rendered unnecessarily when the list
	   is manipulated (some elements get appended / removed).
	*/
	const [ keyedSections, setKeyedSections ] = useState< Pattern[] >( [] );

	/* To sync the keyed sections with the search params,
	   we first initialize the sections from the search params.
	*/
	const initialSections = useMemo(
		() =>
			section_pattern_ids
				.map( ( patternId ) => patternsById[ decodePatternId( patternId ) ] )
				.filter( Boolean )
				.map( ( pattern: Pattern ) => {
					const [ firstCategory ] = Object.keys( pattern.categories );
					const category = categoriesByName[ firstCategory ];
					return {
						...pattern,
						category,
					};
				} ),
		/* We are ignoring the changes from the search params (section_pattern_ids),
	       since after this point, the changes will be handled by setSections().
	    */
		[ patternsById, categoriesByName ] // eslint-disable-line react-hooks/exhaustive-deps
	);

	const uniqueSectionPatternKeyRef = useRef( 0 );
	const generateSectionPatternKey = ( pattern: Pattern ) => {
		uniqueSectionPatternKeyRef.current++;
		return `${ uniqueSectionPatternKeyRef.current }-${ pattern.ID }`;
	};

	/* Generates the keys to the initial sections and set them as the initial value of keyedSections.
	   After this point, the changes will be handled by setSections().
    */
	useEffect( () => {
		const initialKeyedSections = initialSections.map( ( pattern ) => ( {
			...pattern,
			key: generateSectionPatternKey( pattern ),
		} ) );

		setKeyedSections( initialKeyedSections );
	}, [ initialSections ] );

	const selectedDesign = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
		[]
	);
	const { stylesheet = '' } = selectedDesign?.recipe || {};

	const colorVariations = useColorPaletteVariations( siteId, stylesheet, {
		enabled: !! color_variation_title,
	} );

	const fontVariations = useFontPairingVariations( siteId, stylesheet, {
		enabled: !! font_variation_title,
	} );

	const colorVariation =
		( colorVariations || [] ).find( ( { title } ) => title === color_variation_title ) || null;

	const fontVariation =
		( fontVariations || [] ).find( ( { title } ) => title === font_variation_title ) || null;

	const resetCustomStyles = !! searchParams.get( 'reset_custom_styles' );

	const setHeader = ( pattern: Pattern | null ) => {
		setSearchParams(
			( currentSearchParams ) => {
				if ( pattern === null ) {
					currentSearchParams.delete( 'header_pattern_id' );
				} else {
					currentSearchParams.set( 'header_pattern_id', '' + pattern.ID );
				}
				return currentSearchParams;
			},
			{ replace: true }
		);
	};

	const setFooter = ( pattern: Pattern | null ) => {
		setSearchParams(
			( currentSearchParams ) => {
				if ( pattern === null ) {
					currentSearchParams.delete( 'footer_pattern_id' );
				} else {
					currentSearchParams.set( 'footer_pattern_id', '' + pattern.ID );
				}
				return currentSearchParams;
			},
			{ replace: true }
		);
	};

	const setSections = ( patterns: Pattern[] ) => {
		setSearchParams(
			( currentSearchParams ) => {
				if ( patterns.length === 0 ) {
					currentSearchParams.delete( 'pattern_ids' );
				} else {
					currentSearchParams.set( 'pattern_ids', patterns.map( ( p ) => p.ID ).join( ',' ) );
				}
				return currentSearchParams;
			},
			{ replace: true }
		);

		setKeyedSections(
			patterns.map( ( pattern ) =>
				pattern.key
					? pattern
					: {
							...pattern,
							key: generateSectionPatternKey( pattern ),
					  }
			)
		);
	};

	const setColorVariation = ( variation: GlobalStylesObject | null ) => {
		setSearchParams(
			( currentSearchParams ) => {
				if ( variation?.title ) {
					currentSearchParams.set( 'color_variation_title', variation?.title );
				} else {
					currentSearchParams.delete( 'color_variation_title' );
				}
				return currentSearchParams;
			},
			{ replace: true }
		);
	};

	const setFontVariation = ( variation: GlobalStylesObject | null ) => {
		setSearchParams(
			( currentSearchParams ) => {
				if ( variation?.title ) {
					currentSearchParams.set( 'font_variation_title', variation?.title );
				} else {
					currentSearchParams.delete( 'font_variation_title' );
				}
				return currentSearchParams;
			},
			{ replace: true }
		);
	};

	const setResetCustomStyles = ( value: boolean ) => {
		setSearchParams(
			( currentSearchParams ) => {
				if ( value ) {
					currentSearchParams.set( 'reset_custom_styles', String( value ) );
				} else {
					currentSearchParams.delete( 'reset_custom_styles' );
				}
				return currentSearchParams;
			},
			{ replace: true }
		);
	};

	return {
		header,
		footer,
		sections: keyedSections,
		colorVariation,
		fontVariation,
		resetCustomStyles,
		setHeader,
		setFooter,
		setSections,
		setColorVariation,
		setFontVariation,
		setResetCustomStyles,
	};
};

export default useRecipe;
