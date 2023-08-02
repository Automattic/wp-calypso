import { PlanSlug } from '@automattic/calypso-products';
import { usePlansGridContext } from '../../grid-context';

type HighlightAdjacencyMatrix = {
	[ planSlug in PlanSlug ]: {
		leftOfHighlight: boolean;
		rightOfHighlight: boolean;
		isOnlyHighlight?: boolean;
	};
};

interface Props {
	renderedPlans: PlanSlug[];
}

const useHighlightIndices = ( { renderedPlans }: Props ) => {
	const { planRecords } = usePlansGridContext();

	return renderedPlans.reduce< number[] >( ( acc, planSlug, index ) => {
		if ( planRecords[ planSlug ].highlightLabel ) {
			acc.push( index );
		}

		return acc;
	}, [] );
};

const useHighlightAdjacencyMatrix = ( { renderedPlans }: Props ) => {
	const highlightIndices = useHighlightIndices( { renderedPlans } );
	const adjacencyMatrix = {} as HighlightAdjacencyMatrix;

	renderedPlans.forEach( ( planSlug, index ) => {
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
		adjacencyMatrix[ renderedPlans[ highlightIndices[ 0 ] ] ].isOnlyHighlight = true;
	}

	return adjacencyMatrix;
};

export default useHighlightAdjacencyMatrix;
