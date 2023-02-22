import { isBusinessPlan, isPremiumPlan, isEcommercePlan } from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import type { PlanProperties } from '../types';

interface HighlightAdjacencyMatrix {
	[ planName: string ]: {
		leftOfHighlight: boolean;
		rightOfHighlight: boolean;
		isOnlyHighlight?: boolean;
	};
}

const useHighlightAdjacencyMatrix = ( visiblePlans: PlanProperties[] ) => {
	return useMemo( () => {
		const adjacencyMatrix: HighlightAdjacencyMatrix = {};
		const highlightIndices = visiblePlans.reduce< number[] >( ( acc, { planName }, index ) => {
			const isHighlight =
				isBusinessPlan( planName ) || isPremiumPlan( planName ) || isEcommercePlan( planName );

			if ( isHighlight ) {
				acc.push( index );
			}

			return acc;
		}, [] );

		visiblePlans.forEach( ( { planName }, index ) => {
			let leftOfHighlight = false;
			let rightOfHighlight = false;

			highlightIndices.forEach( ( highlightIndex ) => {
				if ( highlightIndex === index - 1 ) {
					rightOfHighlight = true;
				}
				if ( highlightIndex === index + 1 ) {
					leftOfHighlight = true;
				}
			} );

			adjacencyMatrix[ planName ] = { leftOfHighlight, rightOfHighlight };
		} );

		if ( highlightIndices.length === 1 ) {
			adjacencyMatrix[ visiblePlans[ highlightIndices[ 0 ] ].planName ].isOnlyHighlight = true;
		}

		return adjacencyMatrix;
	}, [ visiblePlans ] );
};

export default useHighlightAdjacencyMatrix;
