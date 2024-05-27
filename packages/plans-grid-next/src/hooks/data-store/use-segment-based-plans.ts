import {
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TYPE_ENTERPRISE_GRID_WPCOM,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
} from '@automattic/calypso-products';
import useGuidedFlowGetSegment from './use-guided-flow-get-segment';

function useSegmentedPlans( segment: string ) {
	switch ( segment ) {
		case 'Unknown':
			return [
				TYPE_FREE,
				TYPE_PERSONAL,
				TYPE_PREMIUM,
				TYPE_BUSINESS,
				TYPE_ECOMMERCE,
				TYPE_ENTERPRISE_GRID_WPCOM,
			];
		case 'Blogger':
			return [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ];
		case 'Consumer / Business':
			return [ TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ];
		case 'Merchant':
			return [ TYPE_BUSINESS, TYPE_ECOMMERCE, TYPE_ENTERPRISE_GRID_WPCOM ];
		case 'Developer / Agency':
			return [ TYPE_BUSINESS, TYPE_ECOMMERCE, TYPE_ENTERPRISE_GRID_WPCOM ];
		default:
			return [
				TYPE_FREE,
				TYPE_PERSONAL,
				TYPE_PREMIUM,
				TYPE_BUSINESS,
				TYPE_ECOMMERCE,
				TYPE_ENTERPRISE_GRID_WPCOM,
			];
	}
}

export const useGetGuidedFlowPlanTypes = ( guidedFlowSegmentAnswers: {
	[ key: string ]: string[];
} ) => {
	const guidedSegment =
		guidedFlowSegmentAnswers?.[ 'what-brings-you-to-wordpress' ]?.[ 0 ] || 'Unknown';
	const guidedSegmentGoals = guidedFlowSegmentAnswers?.[ 'what-are-your-goals' ] || [];
	const guidedFlowSegment = useGuidedFlowGetSegment( guidedSegment, guidedSegmentGoals );
	const guidedFlowSegmentPlans = useSegmentedPlans( guidedFlowSegment );
	return guidedFlowSegmentPlans;
};
