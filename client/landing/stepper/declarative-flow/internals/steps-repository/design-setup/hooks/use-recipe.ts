import {
	isDefaultGlobalStylesVariationSlug,
	isAssemblerDesign,
	isAssemblerSupported,
} from '@automattic/design-picker';
import { useColorPaletteVariations, useFontPairingVariations } from '@automattic/global-styles';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ONBOARD_STORE } from '../../../../../stores';
import type { GlobalStyles, OnboardSelect, StarterDesigns } from '@automattic/data-stores';
import type { Design, StyleVariation } from '@automattic/design-picker';
import type { GlobalStylesObject } from '@automattic/global-styles';

// The `currentSearchParams` parameter from the callback of the `setSearchParams` function
// might not have the latest query parameter on multiple calls at the same time.
const makeSearchParams = (
	callback: ( currentSearchParams: URLSearchParams ) => URLSearchParams
) => callback( new URLSearchParams( window.location.search ) );

const useRecipe = (
	allDesigns: StarterDesigns | undefined,
	pickDesign: ( design?: Design, options?: { shouldGoToAssembler: boolean } ) => void,
	pickUnlistedDesign: ( theme: string ) => void,
	recordPreviewDesign: ( design: Design, styleVariation?: StyleVariation ) => void,
	recordPreviewStyleVariation: ( design: Design, styleVariation?: StyleVariation ) => void
) => {
	const [ searchParams, setSearchParams ] = useSearchParams();
	const isPreviewingDesign = !! searchParams.get( 'theme' );
	const { selectedDesign, selectedStyleVariation, selectedGlobalStyles } = useSelect(
		( select ) => {
			const { getSelectedDesign, getSelectedStyleVariation, getSelectedGlobalStyles } = select(
				ONBOARD_STORE
			) as OnboardSelect;
			return {
				selectedDesign: getSelectedDesign(),
				selectedStyleVariation: getSelectedStyleVariation(),
				selectedGlobalStyles: getSelectedGlobalStyles(),
			};
		},
		[]
	);

	const { setSelectedDesign, setSelectedStyleVariation, setSelectedGlobalStyles } =
		useDispatch( ONBOARD_STORE );

	const [ selectedColorVariation, setSelectedColorVariation ] =
		useState< GlobalStylesObject | null >( null );

	const [ selectedFontVariation, setSelectedFontVariation ] = useState< GlobalStylesObject | null >(
		null
	);

	const numOfSelectedGlobalStyles = [
		! isDefaultGlobalStylesVariationSlug( selectedStyleVariation?.slug ),
		!! selectedColorVariation,
		!! selectedFontVariation,
	].filter( Boolean ).length;

	/**
	 * Get the preselect data only when mounting and ignore any changes later.
	 */
	const {
		preselectedThemeSlug,
		preselectedStyleSlug,
		preselectedColorVariationTitle,
		preselectedFontVariationTitle,
	} = useMemo(
		() => ( {
			preselectedThemeSlug: searchParams.get( 'theme' ),
			preselectedStyleSlug: searchParams.get( 'style_variation' ),
			preselectedColorVariationTitle: searchParams.get( 'color_variation_title' ),
			preselectedFontVariationTitle: searchParams.get( 'font_variation_title' ),
		} ),
		[]
	);

	const preselectedDesign = allDesigns?.designs?.find(
		( design ) => ( design.is_virtual ? design.recipe?.slug : design.slug ) === preselectedThemeSlug
	);

	const { stylesheet = '' } = selectedDesign?.recipe || {};

	const colorVariations = useColorPaletteVariations( stylesheet, {
		enabled: !! preselectedColorVariationTitle,
	} );

	const fontVariations = useFontPairingVariations( stylesheet, {
		enabled: !! preselectedFontVariationTitle,
	} );

	const handleSelectedDesignChange = ( design?: Design ) => {
		setSelectedDesign( design );

		let theme: string | null = null;
		if ( design && design.is_virtual && design.recipe?.slug ) {
			theme = design.recipe?.slug;
		} else if ( design ) {
			theme = design.slug;
		}

		if ( theme !== searchParams.get( 'theme' ) ) {
			setSearchParams(
				makeSearchParams( ( currentSearchParams ) => {
					if ( theme ) {
						currentSearchParams.set( 'theme', theme );
					} else {
						currentSearchParams.delete( 'theme' );
					}

					return currentSearchParams;
				} )
			);
		}
	};

	const handleSelectedStyleVariationChange = ( variation?: StyleVariation ) => {
		setSelectedStyleVariation( variation );
		setSearchParams(
			makeSearchParams( ( currentSearchParams ) => {
				if ( variation ) {
					currentSearchParams.set( 'style_variation', variation.slug );
				} else {
					currentSearchParams.delete( 'style_variation' );
				}

				return currentSearchParams;
			} ),
			{ replace: true }
		);
	};

	const handleSelectedColorVariationChange = ( variation: GlobalStyles | null ) => {
		setSelectedColorVariation( variation );
		setSearchParams(
			makeSearchParams( ( currentSearchParams ) => {
				if ( variation && variation.title ) {
					currentSearchParams.set( 'color_variation_title', variation.title );
				} else {
					currentSearchParams.delete( 'color_variation_title' );
				}

				return currentSearchParams;
			} ),
			{ replace: true }
		);
	};

	const handleSelectedFontVariationChange = ( variation: GlobalStyles | null ) => {
		setSelectedFontVariation( variation );
		setSearchParams(
			makeSearchParams( ( currentSearchParams ) => {
				if ( variation && variation.title ) {
					currentSearchParams.set( 'font_variation_title', variation.title );
				} else {
					currentSearchParams.delete( 'font_variation_title' );
				}

				return currentSearchParams;
			} ),
			{ replace: true }
		);
	};

	const previewDesign = ( design: Design, styleVariation?: StyleVariation ) => {
		recordPreviewDesign( design, styleVariation );

		// Redirect to Site Assembler if the design_type is set to "assembler".
		if ( isAssemblerDesign( design ) && isAssemblerSupported() ) {
			pickDesign( design );
			return;
		}

		handleSelectedDesignChange( design );
		handleSelectedStyleVariationChange( styleVariation );
	};

	const previewDesignVariation = ( variation: StyleVariation ) => {
		recordPreviewStyleVariation( selectedDesign as Design, variation );
		handleSelectedStyleVariationChange( variation );
	};

	const resetPreview = () => {
		handleSelectedDesignChange();
		handleSelectedStyleVariationChange();
		handleSelectedColorVariationChange( null );
		handleSelectedFontVariationChange( null );
		setSelectedGlobalStyles( undefined );
	};

	// Unset the selected design, thus restarting the design picking experience.
	useEffect( () => {
		if ( ! preselectedThemeSlug ) {
			resetPreview();
		}
	}, [ preselectedThemeSlug ] );

	// Initialize the preselected design and style variations.
	useEffect( () => {
		if ( ! preselectedDesign ) {
			return;
		}

		setSelectedDesign( preselectedDesign );
		if ( preselectedStyleSlug ) {
			const preselectedStyleVariation = preselectedDesign.style_variations?.find(
				( styleVariation ) => styleVariation.slug === preselectedStyleSlug
			);

			setSelectedStyleVariation( preselectedStyleVariation );
		}
	}, [ preselectedDesign, preselectedStyleSlug, setSelectedDesign, setSelectedStyleVariation ] );

	useEffect( () => {
		if ( ! allDesigns ) {
			return;
		}

		if ( preselectedThemeSlug && ! preselectedDesign ) {
			pickUnlistedDesign( preselectedThemeSlug );
		}
	}, [ allDesigns, preselectedThemeSlug, preselectedDesign, pickUnlistedDesign ] );

	/**
	 * Initialize the preselected colors
	 */
	useEffect( () => {
		if ( ! colorVariations || ! preselectedColorVariationTitle ) {
			return;
		}

		const preselectedColorVariation = colorVariations.find(
			( { title } ) => title === preselectedColorVariationTitle
		);
		if ( preselectedColorVariation ) {
			setSelectedColorVariation( preselectedColorVariation );
		}
	}, [ colorVariations, preselectedColorVariationTitle ] );

	/**
	 * Initialize the preselected fonts
	 */
	useEffect( () => {
		if ( ! fontVariations || ! preselectedFontVariationTitle ) {
			return;
		}

		const preselectedFontVariation = fontVariations.find(
			( { title } ) => title === preselectedFontVariationTitle
		);
		if ( preselectedFontVariation ) {
			setSelectedFontVariation( preselectedFontVariation );
		}
	}, [ fontVariations, preselectedFontVariationTitle ] );

	return {
		isPreviewingDesign,
		selectedDesign,
		selectedStyleVariation,
		selectedColorVariation,
		selectedFontVariation,
		numOfSelectedGlobalStyles,
		globalStyles: selectedGlobalStyles,
		previewDesign,
		previewDesignVariation,
		setSelectedDesign,
		setSelectedStyleVariation,
		setSelectedColorVariation: handleSelectedColorVariationChange,
		setSelectedFontVariation: handleSelectedFontVariationChange,
		setGlobalStyles: setSelectedGlobalStyles,
		resetPreview,
	};
};

export default useRecipe;
