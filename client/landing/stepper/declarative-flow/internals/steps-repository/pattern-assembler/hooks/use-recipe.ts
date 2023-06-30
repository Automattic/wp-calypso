import { useColorPaletteVariations, useFontPairingVariations } from '@automattic/global-styles';
import { keyBy } from '@automattic/js-utils';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ONBOARD_STORE } from '../../../../../stores';
import { decodePatternId } from '../utils';
import type { Pattern, Category } from '../types';
import type { OnboardSelect } from '@automattic/data-stores';
import type { Design } from '@automattic/design-picker/src/types';
import type { GlobalStylesObject } from '@automattic/global-styles';

const useRecipe = ( siteId = 0, patterns: Pattern[], categories: Category[] ) => {
	const incrementIndexRef = useRef( 0 );
	const [ header, setHeader ] = useState< Pattern | null >( null );
	const [ footer, setFooter ] = useState< Pattern | null >( null );
	const [ sections, setSections ] = useState< Pattern[] >( [] );
	const [ colorVariation, setColorVariation ] = useState< GlobalStylesObject | null >( null );
	const [ fontVariation, setFontVariation ] = useState< GlobalStylesObject | null >( null );
	const selectedDesign = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
		[]
	);

	const {
		stylesheet = '',
		header_pattern_ids = [],
		footer_pattern_ids = [],
		pattern_ids = [],
		color_variation_title = '',
		font_variation_title = '',
	} = selectedDesign?.recipe || {};

	const colorVariations = useColorPaletteVariations( siteId, stylesheet, {
		enabled: !! color_variation_title,
	} );

	const fontVariations = useFontPairingVariations( siteId, stylesheet, {
		enabled: !! font_variation_title,
	} );

	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );

	const selectedDesignRef = useRef< Design | undefined >( selectedDesign );

	selectedDesignRef.current = {
		...selectedDesign,
		recipe: {
			...selectedDesign?.recipe,
			header_pattern_ids: header ? [ header.ID ] : [],
			footer_pattern_ids: footer ? [ footer.ID ] : [],
			pattern_ids: sections.map( ( section ) => section.ID ),
			color_variation_title: colorVariation?.title,
			font_variation_title: fontVariation?.title,
		},
	} as Design;

	const generateKey = ( pattern: Pattern ) => {
		incrementIndexRef.current++;
		return `${ incrementIndexRef.current }-${ pattern.ID }`;
	};

	const snapshotRecipe = useCallback( () => setSelectedDesign( selectedDesignRef.current ), [] );

	/**
	 * Initialize the default value from the recipe of the selected design when both patterns and categories are ready
	 */
	useEffect( () => {
		if ( patterns.length === 0 || categories.length === 0 || ! selectedDesignRef.current?.recipe ) {
			return;
		}

		const patternsById = keyBy( patterns, 'ID' );
		const categoriesByName = keyBy( categories, 'name' );
		const selectedHeader = patternsById[ decodePatternId( header_pattern_ids[ 0 ] ) ];
		const selectedFooter = patternsById[ decodePatternId( footer_pattern_ids[ 0 ] ) ];

		if ( selectedHeader ) {
			setHeader( selectedHeader );
		}

		if ( selectedFooter ) {
			setFooter( selectedFooter );
		}

		setSections(
			pattern_ids
				.map( ( patternId: string | number ) => patternsById[ decodePatternId( patternId ) ] )
				.filter( Boolean )
				.map( ( pattern: Pattern ) => {
					const [ firstCategory ] = Object.keys( pattern.categories );
					const category = categoriesByName[ firstCategory ];
					return {
						...pattern,
						key: generateKey( pattern ),
						category,
					};
				} )
		);
	}, [ patterns.length, categories.length ] );

	useEffect( () => {
		if ( ! colorVariations || ! color_variation_title ) {
			return;
		}

		const initialColorVariation = colorVariations.find(
			( { title } ) => title === color_variation_title
		);
		if ( initialColorVariation ) {
			setColorVariation( initialColorVariation );
		}
	}, [ colorVariations ] );

	useEffect( () => {
		if ( ! fontVariations || ! font_variation_title ) {
			return;
		}

		const initialFontVariation = fontVariations.find(
			( { title } ) => title === font_variation_title
		);
		if ( initialFontVariation ) {
			setFontVariation( initialFontVariation );
		}
	}, [ fontVariations ] );

	return {
		header,
		footer,
		sections,
		colorVariation,
		fontVariation,
		setHeader,
		setFooter,
		setSections,
		setColorVariation,
		setFontVariation,
		generateKey,
		snapshotRecipe,
	};
};

export default useRecipe;
