import { useMemo } from 'react';
import { isBlankCanvasDesign } from '../utils';
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

export const useFilteredDesignsByGroup = ( designs: Design[] ): { [ key: string ]: Design[] } => {
	const { selectedCategoriesWithoutDesignTier, selectedDesignTiers } = useDesignPickerFilters();

	const filteredDesigns = useMemo( () => {
		if ( selectedCategoriesWithoutDesignTier.length > 0 || selectedDesignTiers.length > 0 ) {
			return getFilteredDesignsByCategory(
				designs,
				selectedCategoriesWithoutDesignTier,
				selectedDesignTiers
			);
		}

		return {
			all: designs,
		};
	}, [ designs, selectedCategoriesWithoutDesignTier ] );

	return filteredDesigns;
};
