import { useMemo } from 'react';
import { isBlankCanvasDesign } from '../utils';
import { useDesignPickerFilters } from './use-design-picker-filters';
import type { Design } from '../types';

// Returns designs that match the features, subjects and tiers.
// Designs with `showFirst` are always included regardless of the selected features and subjects.
export const getFilteredDesignsByCategory = (
	designs: Design[],
	categorySlugs: string[] | null | undefined,
	designTierSlugs: string[],
	priorityThemes: Record< string, string > | null
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
		if ( categorySlugs.length > 1 && matchedCount > 1 ) {
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

	// sort best designs by highest number of matched categories
	filteredDesignsByCategory.best.sort( ( a, b ) => {
		const aMatchedCategorySlugs = categorySlugs.filter( ( categorySlug ) =>
			a.categories.map( ( category ) => category.slug ).includes( categorySlug )
		);
		const bMatchedCategorySlugs = categorySlugs.filter( ( categorySlug ) =>
			b.categories.map( ( category ) => category.slug ).includes( categorySlug )
		);

		return bMatchedCategorySlugs.length - aMatchedCategorySlugs.length;
	} );

	// limit the best designs to 6
	filteredDesignsByCategory.best = filteredDesignsByCategory.best.slice( 0, 6 );

	// Prioritize themes based on the priorityThemes mapping
	if ( categorySlugs && priorityThemes ) {
		for ( const categorySlug of categorySlugs ) {
			const priorityThemeSlug = priorityThemes[ categorySlug ];

			if ( priorityThemeSlug && filteredDesignsByCategory[ categorySlug ] ) {
				filteredDesignsByCategory[ categorySlug ].sort( ( a, b ) => {
					if ( a.slug === priorityThemeSlug ) {
						return -1;
					}
					if ( b.slug === priorityThemeSlug ) {
						return 1;
					}
					return 0;
				} );
			}
		}
	}

	return filteredDesignsByCategory;
};

export const useFilteredDesignsByGroup = (
	designs: Design[],
	priorityThemes: Record< string, string > | null
): { [ key: string ]: Design[] } => {
	const { selectedCategoriesWithoutDesignTier, selectedDesignTiers } = useDesignPickerFilters();

	const filteredDesigns = useMemo( () => {
		if ( selectedCategoriesWithoutDesignTier.length > 0 || selectedDesignTiers.length > 0 ) {
			return getFilteredDesignsByCategory(
				designs,
				selectedCategoriesWithoutDesignTier,
				selectedDesignTiers,
				priorityThemes
			);
		}

		return {
			all: designs,
		};
	}, [ designs, selectedCategoriesWithoutDesignTier, selectedDesignTiers, priorityThemes ] );

	return filteredDesigns;
};
