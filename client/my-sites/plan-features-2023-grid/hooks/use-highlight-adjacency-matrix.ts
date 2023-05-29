import {
	isBusinessPlan,
	isPersonalPlan,
	isPremiumPlan,
	planLevelsMatch,
} from '@automattic/calypso-products';
import { isNewsletterFlow, isLinkInBioFlow } from '@automattic/onboarding';
import type { PlanProperties } from '../types';

interface HighlightAdjacencyMatrix {
	[ planName: string ]: {
		leftOfHighlight: boolean;
		rightOfHighlight: boolean;
		isOnlyHighlight?: boolean;
	};
}

interface Props {
	visiblePlans: PlanProperties[];
	flowName: string;
	currentSitePlanSlug?: string;
	selectedPlan?: string;
}

const useHighlightIndices = ( {
	visiblePlans,
	flowName,
	currentSitePlanSlug,
	selectedPlan,
}: Props ) => {
	return visiblePlans.reduce< number[] >( ( acc, { planName }, index ) => {
		let isHighlight = false;

		const isCurrentPlan = currentSitePlanSlug === planName;
		const isSuggestedPlan = !! ( selectedPlan && planLevelsMatch( planName, selectedPlan ) );

		if ( flowName && isNewsletterFlow( flowName ) ) {
			isHighlight = isPersonalPlan( planName ) || isCurrentPlan;
		} else if ( flowName && isLinkInBioFlow( flowName ) ) {
			isHighlight = isPremiumPlan( planName ) || isCurrentPlan;
		} else {
			isHighlight =
				( isBusinessPlan( planName ) && ! selectedPlan ) ||
				( isPremiumPlan( planName ) && ! selectedPlan ) ||
				isCurrentPlan ||
				isSuggestedPlan;
		}

		if ( isHighlight ) {
			acc.push( index );
		}

		return acc;
	}, [] );
};

const useHighlightAdjacencyMatrix = ( {
	visiblePlans,
	flowName,
	currentSitePlanSlug,
	selectedPlan,
}: Props ) => {
	const highlightIndices = useHighlightIndices( {
		visiblePlans,
		flowName,
		currentSitePlanSlug,
		selectedPlan,
	} );
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
