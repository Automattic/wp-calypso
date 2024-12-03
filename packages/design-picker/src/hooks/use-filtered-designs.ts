import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isBlankCanvasDesign } from '../utils/available-designs';
import type { Categorization } from './use-categorization';
import type { Design } from '../types';

// Returns designs that match the features, subjects and tiers.
// Designs with `showFirst` are always included regardless of the selected features and subjects.
export function filterDesigns(
	designs: Design[],
	categorySlug: string | null | undefined,
	selectedDesignTier: string = ''
): Design[] {
	return designs.filter(
		( design ) =>
			( design.showFirst ||
				! categorySlug ||
				design.categories.find( ( { slug } ) => slug === categorySlug ) ) &&
			( ! selectedDesignTier || design.design_tier === selectedDesignTier ) &&
			! isBlankCanvasDesign( design )
	);
}

export const useFilteredDesigns = ( designs: Design[], categorization?: Categorization ) => {
	const [ searchParams ] = useSearchParams();

	const selectedDesignTier = searchParams.get( 'tier' ) ?? '';

	const filteredDesigns = useMemo( () => {
		if ( categorization?.selection || selectedDesignTier ) {
			return filterDesigns( designs, categorization?.selection, selectedDesignTier );
		}

		return designs;
	}, [ designs, categorization?.selection, selectedDesignTier ] );

	return filteredDesigns;
};
