import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DESIGN_TIER_CATEGORIES } from '../constants';
import { isDesignTierCategory } from '../utils';

// The `currentSearchParams` parameter from the callback of the `setSearchParams` function
// might not have the latest query parameter on multiple calls at the same time.
const makeSearchParams = (
	callback: ( currentSearchParams: URLSearchParams ) => URLSearchParams
) => callback( new URLSearchParams( window.location.search ) );

const useCategoriesFilter = () => {
	const [ searchParams, setSearchParams ] = useSearchParams();
	const selectedCategories = searchParams.get( 'categories' )?.split( ',' ) || [];
	const setSelectedCategories = ( values: string[] ) => {
		setSearchParams(
			makeSearchParams( ( currentSearchParams ) => {
				if ( values.length > 0 ) {
					currentSearchParams.set( 'categories', values.join( ',' ) );
				} else {
					currentSearchParams.delete( 'categories' );
				}
				return currentSearchParams;
			} ),
			{ replace: true }
		);
	};

	return { selectedCategories, setSelectedCategories };
};

export const useDesignTiers = () => {
	const translate = useTranslate();

	const designTiers = useMemo(
		() => [
			{
				slug: DESIGN_TIER_CATEGORIES.FREE,
				name: translate( 'Free' ),
			},
		],
		[ translate ]
	);

	return designTiers;
};

export const useDesignPickerFilters = () => {
	const { selectedCategories, setSelectedCategories } = useCategoriesFilter();

	// Split selectedCategories into categorySlugs and designTierSlugs.
	const { selectedCategoriesWithoutDesignTier, selectedDesignTiers } = useMemo( () => {
		return {
			selectedCategoriesWithoutDesignTier: selectedCategories.filter(
				( slug: string ) => ! isDesignTierCategory( slug )
			),
			selectedDesignTiers: selectedCategories.filter( ( slug: string ) =>
				isDesignTierCategory( slug )
			),
		};
	}, [ selectedCategories ] );

	return {
		selectedCategories,
		selectedCategoriesWithoutDesignTier,
		selectedDesignTiers,
		setSelectedCategories,
		resetFilters: () => {
			setSelectedCategories( [] );
		},
	};
};
