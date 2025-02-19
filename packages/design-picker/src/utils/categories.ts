import { FEATURE_CATEGORIES, DESIGN_TIER_CATEGORIES } from '../constants';

const featureCategorySet = new Set( Object.values( FEATURE_CATEGORIES ) );

const designTierCategorySet = new Set( Object.values( DESIGN_TIER_CATEGORIES ) );

export const isFeatureCategory = ( categorySlug: string ) => featureCategorySet.has( categorySlug );

export const isDesignTierCategory = ( categorySlug: string ) =>
	designTierCategorySet.has( categorySlug );

export const getCategoryType = ( categorySlug: string ) => {
	if ( featureCategorySet.has( categorySlug ) ) {
		return 'feature';
	}

	if ( designTierCategorySet.has( categorySlug ) ) {
		return 'tier';
	}

	return 'subject';
};
