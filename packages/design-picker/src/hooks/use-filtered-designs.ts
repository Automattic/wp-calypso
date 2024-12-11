import { useMemo } from 'react';
import { isBlankCanvasDesign } from '../utils/available-designs';
import { useDesignPickerFilters } from './use-design-picker-filters';
import type { Design } from '../types';

// Returns designs that match the features, subjects and tiers.
// Designs with `showFirst` are always included regardless of the selected features and subjects.
export const getFilteredDesignsByCategory = (
	designs: Design[],
	categorySlugs: string[] | null | undefined,
	selectedDesignTier: string = ''
) => {
	const filteredDesigns = designs.filter(
		( design ) =>
			( ! selectedDesignTier || design.design_tier === selectedDesignTier ) &&
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
	const categorySlugsSet = new Set( categorySlugs );
	for ( let i = 0; i < filteredDesigns.length; i++ ) {
		const design = filteredDesigns[ i ];
		let lastMatchedCategory = null;
		let matchedCount = 0;
		for ( let j = 0; j < design.categories.length; j++ ) {
			const category = design.categories[ j ];
			if ( categorySlugsSet.has( category.slug ) ) {
				// We show the designs for the last selected category on top first
				// so it would be better to put the design into the last matched category
				// if it doesn't match all selected categories.
				lastMatchedCategory = category.slug;
				matchedCount++;
			}
		}

		// For designs that match all selected categories.
		// Limit the best matches to at least 2 selected categories.
		if ( categorySlugs.length > 1 && matchedCount === categorySlugs.length ) {
			filteredDesignsByCategory.best.push( design );
			continue;
		}

		if ( lastMatchedCategory ) {
			filteredDesignsByCategory[ lastMatchedCategory ].push( design );
		}
	}

	return filteredDesignsByCategory;
};

export const useFilteredDesignsByGroup = ( designs: Design[] ): { [ key: string ]: Design[] } => {
	const { selectedCategories, selectedDesignTier } = useDesignPickerFilters();

	const filteredDesigns = useMemo( () => {
		if ( selectedCategories.length > 0 || selectedDesignTier ) {
			return getFilteredDesignsByCategory( designs, selectedCategories, selectedDesignTier );
		}

		return {
			all: designs,
		};
	}, [ designs, selectedCategories, selectedDesignTier ] );

	return filteredDesigns;
};
