import {
	isBusinessPlan,
	isPersonalPlan,
	isPremiumPlan,
	planLevelsMatch,
} from '@automattic/calypso-products';
import { usePlansGridContext } from '../grid-context';
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
	currentSitePlanSlug?: string | null;
	selectedPlan?: string;
}

const useHighlightIndices = ( { visiblePlans, currentSitePlanSlug, selectedPlan }: Props ) => {
	const { intent } = usePlansGridContext();

	return visiblePlans.reduce< number[] >( ( acc, { planName }, index ) => {
		let isHighlight = false;

		const isCurrentPlan = currentSitePlanSlug === planName;
		const isSuggestedPlan = !! ( selectedPlan && planLevelsMatch( planName, selectedPlan ) );

		if ( 'plans-newsletter' === intent ) {
			isHighlight = isPersonalPlan( planName ) || isCurrentPlan;
		} else if ( 'plans-link-in-bio' === intent ) {
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
	currentSitePlanSlug,
	selectedPlan,
}: Props ) => {
	const highlightIndices = useHighlightIndices( {
		visiblePlans,
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
