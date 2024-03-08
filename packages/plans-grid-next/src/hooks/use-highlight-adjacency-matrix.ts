import { useMemo } from '@wordpress/element';
import type { GridPlan } from '../types';
import type { PlanSlug } from '@automattic/calypso-products';

type HighlightAdjacencyMatrix = {
	[ planSlug in PlanSlug ]: {
		leftOfHighlight: boolean;
		rightOfHighlight: boolean;
		isOnlyHighlight?: boolean;
	};
};

interface Props {
	renderedGridPlans: GridPlan[];
}

const useHighlightAdjacencyMatrix = ( { renderedGridPlans }: Props ) => {
	return useMemo( () => {
		const adjacencyMatrix = {} as HighlightAdjacencyMatrix;
		const highlightIndices = renderedGridPlans.reduce( ( acc, gridPlan, index ) => {
			if ( gridPlan.highlightLabel ) {
				acc.push( index );
			}
			return acc;
		}, [] as number[] );

		renderedGridPlans.forEach( ( { planSlug }, index ) => {
			adjacencyMatrix[ planSlug ] = { leftOfHighlight: false, rightOfHighlight: false };

			highlightIndices.forEach( ( highlightIndex ) => {
				if ( highlightIndex === index - 1 ) {
					adjacencyMatrix[ planSlug ].rightOfHighlight = true;
				}
				if ( highlightIndex === index + 1 ) {
					adjacencyMatrix[ planSlug ].leftOfHighlight = true;
				}
			} );
		} );

		if ( highlightIndices.length === 1 ) {
			adjacencyMatrix[ renderedGridPlans[ highlightIndices[ 0 ] ].planSlug ].isOnlyHighlight = true;
		}

		return adjacencyMatrix;
	}, [ renderedGridPlans ] );
};

export default useHighlightAdjacencyMatrix;
