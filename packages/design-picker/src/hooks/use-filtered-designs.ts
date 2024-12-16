import { useMemo } from 'react';
import { isBlankCanvasDesign, getDesignSlug } from '../utils';
import { useDesignPickerFilters } from './use-design-picker-filters';
import type { Design } from '../types';

// Returns designs that match the features, subjects and tiers.
// Designs with `showFirst` are always included regardless of the selected features and subjects.
export const getFilteredDesignsByCategory = (
	designs: Design[],
	categorySlugs: string[] | null | undefined,
	designTierSlugs: string[]
) => {
	const filteredDesigns = designs.filter(
		( design ) =>
			( ! designTierSlugs.length ||
				( design.design_tier && designTierSlugs.includes( design.design_tier ) ) ) &&
			! isBlankCanvasDesign( design )
	);

	const filteredDesignsByCategory: { [ key: string ]: Design[] } = {
		all: filteredDesigns,
		best: [],
		...Object.fromEntries( ( categorySlugs || [] ).map( ( slug ) => [ slug, [] ] ) ),
	};

	// Return early if none of the category is selected.
	if ( ! categorySlugs || categorySlugs.length === 0 ) {
		return filteredDesignsByCategory;
	}

	// Get designs by the selected category.
	// Note that we don't want to show a theme in multiple sections.
	// See https://github.com/Automattic/dotcom-forge/issues/10110.
	for ( let i = 0; i < filteredDesigns.length; i++ ) {
		const design = filteredDesigns[ i ];
		const designCategorySlugsSet = new Set(
			design.categories.map( ( category ) => category.slug )
		);

		const matchedCategorySlugs = categorySlugs.filter( ( categorySlug ) =>
			designCategorySlugsSet.has( categorySlug )
		);

		const matchedCount = matchedCategorySlugs.length;

		// For designs that match all selected categories.
		// Limit the best matches to at least 2 selected categories.
		if ( categorySlugs.length > 1 && matchedCount === categorySlugs.length ) {
			filteredDesignsByCategory.best.push( design );
			continue;
		}

		// We show the designs for the last selected category on top first
		// so it would be better to put the design into the last matched category
		// if it doesn't match all selected categories.
		const lastMatchedCategorySlug = matchedCategorySlugs[ matchedCategorySlugs.length - 1 ];
		if ( lastMatchedCategorySlug ) {
			filteredDesignsByCategory[ lastMatchedCategorySlug ].push( design );
		}
	}

	return filteredDesignsByCategory;
};

interface UseFilteredDesignsByGroupOptions {
	excludeDesigns?: Design[];
}

export const useFilteredDesignsByGroup = (
	designs: Design[],
	{ excludeDesigns }: UseFilteredDesignsByGroupOptions = {}
): { [ key: string ]: Design[] } => {
	const { selectedCategoriesWithoutDesignTier, selectedDesignTiers } = useDesignPickerFilters();

	const filteredDesigns = useMemo( () => {
		const excludeDesignSlugs = excludeDesigns
			? excludeDesigns.map( ( design ) => getDesignSlug( design ) )
			: [];
		const excludeDesignSlugsSet = new Set( excludeDesignSlugs );
		const all =
			excludeDesignSlugs.length > 0
				? designs.filter( ( design ) => ! excludeDesignSlugsSet.has( getDesignSlug( design ) ) )
				: designs;

		if ( selectedCategoriesWithoutDesignTier.length > 0 || selectedDesignTiers.length > 0 ) {
			return getFilteredDesignsByCategory(
				all,
				selectedCategoriesWithoutDesignTier,
				selectedDesignTiers
			);
		}

		return {
			all,
		};
	}, [ designs, excludeDesigns, selectedCategoriesWithoutDesignTier, selectedDesignTiers ] );

	return filteredDesigns;
};
