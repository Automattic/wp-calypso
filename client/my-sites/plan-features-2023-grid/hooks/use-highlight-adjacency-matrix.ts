import { isBusinessPlan, isPersonalPlan, isPremiumPlan } from '@automattic/calypso-products';
import { isNewsletterFlow } from '@automattic/onboarding';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { PlanProperties } from '../types';

interface HighlightAdjacencyMatrix {
	[ planName: string ]: {
		leftOfHighlight: boolean;
		rightOfHighlight: boolean;
		isOnlyHighlight?: boolean;
	};
}

const useHighlightIndices = ( visiblePlans: PlanProperties[], flowName: string ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, selectedSiteId ) );

	return visiblePlans.reduce< number[] >( ( acc, { planName }, index ) => {
		let isHighlight = false;

		if ( isNewsletterFlow( flowName ) ) {
			isHighlight = isPersonalPlan( planName ) || currentPlan?.productSlug === planName;
		} else {
			isHighlight =
				isBusinessPlan( planName ) ||
				isPremiumPlan( planName ) ||
				currentPlan?.productSlug === planName;
		}

		if ( isHighlight ) {
			acc.push( index );
		}

		return acc;
	}, [] );
};

const useHighlightAdjacencyMatrix = ( visiblePlans: PlanProperties[], flowName: string ) => {
	const highlightIndices = useHighlightIndices( visiblePlans, flowName );
	const adjacencyMatrix: HighlightAdjacencyMatrix = {};

	visiblePlans.forEach( ( { planName }, index ) => {
		adjacencyMatrix[ planName ] = { leftOfHighlight: false, rightOfHighlight: false };

		highlightIndices.forEach( ( highlightIndex ) => {
			if ( highlightIndex === index - 1 ) {
				adjacencyMatrix[ planName ].rightOfHighlight = true;
			}
			if ( highlightIndex === index + 1 ) {
				adjacencyMatrix[ planName ].leftOfHighlight = true;
			}
		} );
	} );

	if ( highlightIndices.length === 1 ) {
		adjacencyMatrix[ visiblePlans[ highlightIndices[ 0 ] ].planName ].isOnlyHighlight = true;
	}

	return adjacencyMatrix;
};

export default useHighlightAdjacencyMatrix;
