import { isBusinessPlan, isPremiumPlan, isEcommercePlan } from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { PlanProperties } from '../types';

const useHighlightIndices = ( visiblePlans: PlanProperties[] ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, selectedSiteId ) );

	return useMemo( () => {
		return visiblePlans.reduce< number[] >( ( acc, { planName }, index ) => {
			const ishighlight =
				isBusinessPlan( planName ) ||
				isPremiumPlan( planName ) ||
				isEcommercePlan( planName ) ||
				currentPlan?.productSlug === planName;

			if ( ishighlight ) {
				acc.push( index );
			}

			return acc;
		}, [] );
	}, [ currentPlan?.productSlug, visiblePlans ] );
};

const useHighlightAdjacencyMatrix = ( visiblePlans: PlanProperties[] ) => {
	const highlightIndices = useHighlightIndices( visiblePlans );

	return useMemo( () => {
		const adjacencyMatrix: {
			[ key: string ]: {
				leftOfHighlight: boolean;
				rightOfHighlight: boolean;
				isOnlyHighlight?: boolean;
			};
		} = {};

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
	}, [ highlightIndices, visiblePlans ] );
};

export default useHighlightAdjacencyMatrix;
