import { PlanSlug } from '@automattic/calypso-products';
import { usePlansGridContext } from '../../grid-context';

type HighlightAdjacencyMatrix = {
	[ planSlug in PlanSlug ]: {
		leftOfHighlight: boolean;
		rightOfHighlight: boolean;
		isOnlyHighlight?: boolean;
	};
};

const useHighlightIndices = () => {
	const { visiblePlans, planRecords } = usePlansGridContext();

	return visiblePlans.reduce< number[] >( ( acc, planSlug, index ) => {
		if ( planRecords[ planSlug ].highlightLabel ) {
			acc.push( index );
		}

		return acc;
	}, [] );
};

const useHighlightAdjacencyMatrix = () => {
	const { visiblePlans } = usePlansGridContext();
	const highlightIndices = useHighlightIndices();
	const adjacencyMatrix: HighlightAdjacencyMatrix = {} as HighlightAdjacencyMatrix;

	visiblePlans.forEach( ( planSlug, index ) => {
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
		adjacencyMatrix[ visiblePlans[ highlightIndices[ 0 ] ] ].isOnlyHighlight = true;
	}

	return adjacencyMatrix;
};

export default useHighlightAdjacencyMatrix;
