import { useMemo } from '@wordpress/element';
import type { GridPlan } from './data-store/use-grid-plans';
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

const useHighlightIndices = ( { renderedGridPlans }: Props ) => {
	return useMemo(
		() =>
			renderedGridPlans.reduce< number[] >( ( acc, gridPlan, index ) => {
				if ( gridPlan.highlightLabel ) {
					acc.push( index );
				}

				return acc;
			}, [] ),
		[ renderedGridPlans ]
	);
};

const useHighlightAdjacencyMatrix = ( { renderedGridPlans }: Props ) => {
	const highlightIndices = useHighlightIndices( { renderedGridPlans } );

	return useMemo( () => {
		const adjacencyMatrix = {} as HighlightAdjacencyMatrix;

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
	}, [ renderedGridPlans, highlightIndices ] );
};

export default useHighlightAdjacencyMatrix;
