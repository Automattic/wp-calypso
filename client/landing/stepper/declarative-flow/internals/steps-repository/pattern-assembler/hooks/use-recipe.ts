import { useColorPaletteVariations, useFontPairingVariations } from '@automattic/global-styles';
import { keyBy } from '@automattic/js-utils';
import { useSelect } from '@wordpress/data';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ONBOARD_STORE } from '../../../../../stores';
import { decodePatternId } from '../utils';
import type { Pattern, Category } from '../types';
import type { OnboardSelect } from '@automattic/data-stores';
import type { GlobalStylesObject } from '@automattic/global-styles';

const useRecipe = ( siteId = 0, patterns: Pattern[], categories: Category[] ) => {
	const [ searchParams, setSearchParams ] = useSearchParams();

	const header_pattern_ids = ( searchParams.get( 'header_pattern_ids' ) || '' )
		.split( ',' )
		.filter( Boolean );

	const footer_pattern_ids = ( searchParams.get( 'footer_pattern_ids' ) || '' )
		.split( ',' )
		.filter( Boolean );

	const section_pattern_ids = ( searchParams.get( 'pattern_ids' ) || '' )
		.split( ',' )
		.filter( Boolean );

	const color_variation_title = searchParams.get( 'color_variation_title' );
	const font_variation_title = searchParams.get( 'font_variation_title' );

	const patternsById = keyBy( patterns, 'ID' );
	const categoriesByName = keyBy( categories, 'name' );

	const header =
		header_pattern_ids.length === 0
			? null
			: patternsById[ decodePatternId( header_pattern_ids[ 0 ] ) ];

	const footer =
		footer_pattern_ids.length === 0
			? null
			: patternsById[ decodePatternId( footer_pattern_ids[ 0 ] ) ];

	const sections = section_pattern_ids
		.map( ( patternId ) => patternsById[ decodePatternId( patternId ) ] )
		.filter( Boolean )
		.map( ( pattern: Pattern ) => {
			const [ firstCategory ] = Object.keys( pattern.categories );
			const category = categoriesByName[ firstCategory ];
			return {
				...pattern,
				category,
			};
		} );

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

	const setHeader = ( pattern: Pattern | null ) => {
		setSearchParams(
			( currentSearchParams ) => {
				if ( pattern === null ) {
					currentSearchParams.delete( 'header_pattern_ids' );
				} else {
					currentSearchParams.set( 'header_pattern_ids', '' + pattern.ID );
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
					currentSearchParams.delete( 'footer_pattern_ids' );
				} else {
					currentSearchParams.set( 'footer_pattern_ids', '' + pattern.ID );
				}
				return currentSearchParams;
			},
			{ replace: true }
		);
	};

	const incrementIndexRef = useRef( 0 );
	const generateKey = ( pattern: Pattern ) => {
		incrementIndexRef.current++;
		return `${ incrementIndexRef.current }-${ pattern.ID }`;
	};

	const [ keyedSections, setKeyedSections ] = useState< Pattern[] >( [] );
	useEffect( () => {
		const initialKeyedSections = sections.map( ( pattern ) => ( {
			...pattern,
			key: generateKey( pattern ),
		} ) );

		setKeyedSections( initialKeyedSections );
	}, [ patterns.length, categories.length ] );

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
							key: generateKey( pattern ),
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

	return {
		header,
		footer,
		sections: keyedSections,
		colorVariation,
		fontVariation,
		setHeader,
		setFooter,
		setSections,
		setColorVariation,
		setFontVariation,
	};
};

export default useRecipe;
