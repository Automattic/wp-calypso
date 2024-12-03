import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isBlankCanvasDesign } from '../utils/available-designs';
import type { Categorization } from './use-categorization';
import type { Design } from '../types';

const getDesignSlug = ( design: Design ) => design.recipe?.slug ?? design.slug;

// Returns designs that match the features, subjects and tiers.
// Designs with `showFirst` are always included regardless of the selected features and subjects.
export const filterDesigns = (
	designs: Design[],
	categorySlugs: string[] | null | undefined,
	selectedDesignTier: string = ''
): Design[] => {
	const categorySlugsSet = new Set( categorySlugs || [] );
	const filteredDesigns = designs.filter(
		( design ) =>
			( design.showFirst ||
				categorySlugsSet.size === 0 ||
				design.categories.find( ( { slug } ) => categorySlugsSet.has( slug ) ) ) &&
			( ! selectedDesignTier || design.design_tier === selectedDesignTier ) &&
			! isBlankCanvasDesign( design )
	);

	if ( categorySlugsSet.size > 1 ) {
		const scores: { [ key: string ]: number } = filteredDesigns.reduce(
			( result, design ) => ( {
				...result,
				[ getDesignSlug( design ) ]: design.categories.reduce(
					( sum, { slug } ) => sum + ( categorySlugsSet.has( slug ) ? 1 : 0 ),
					0
				),
			} ),
			{}
		);

		filteredDesigns.sort( ( a: Design, b: Design ) => {
			const aScore = scores[ getDesignSlug( a ) ];
			const bScore = scores[ getDesignSlug( b ) ];

			if ( aScore > bScore ) {
				return -1;
			} else if ( aScore < bScore ) {
				return 1;
			}
			return 0;
		} );
	}

	return filteredDesigns;
};

export const useFilteredDesigns = ( designs: Design[], categorization?: Categorization ) => {
	const [ searchParams ] = useSearchParams();

	const selectedDesignTier = searchParams.get( 'tier' ) ?? '';

	const filteredDesigns = useMemo( () => {
		if ( categorization?.selections || selectedDesignTier ) {
			return filterDesigns( designs, categorization?.selections, selectedDesignTier );
		}

		return designs;
	}, [ designs, categorization?.selections, selectedDesignTier ] );

	return filteredDesigns;
};
