/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { Plans } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { PLANS_STORE } from '../stores/plans';
import { FEATURE_LIST } from '../onboarding-block/features/data';

const order = [
	Plans.PLAN_PERSONAL,
	Plans.PLAN_PREMIUM,
	Plans.PLAN_BUSINESS,
	Plans.PLAN_ECOMMERCE,
];

export function useRecommendedPlanSlug() {
	const selectedFeatures = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedFeatures() );

	if ( ! selectedFeatures.length ) return;

	return selectedFeatures.reduce( ( currentMinSupportedPlan, featureId ) => {
		const featureMinSupportedPlan = FEATURE_LIST[ featureId ].minSupportedPlan;
		return order.indexOf( featureMinSupportedPlan ) > order.indexOf( currentMinSupportedPlan )
			? featureMinSupportedPlan
			: currentMinSupportedPlan;
	}, FEATURE_LIST[ selectedFeatures[ 0 ] ].minSupportedPlan );
}

export default function useRecommendedPlan() {
	const recommendedPlanSlug = useRecommendedPlanSlug();

	return useSelect( ( select ) => {
		return recommendedPlanSlug
			? select( PLANS_STORE ).getPlanBySlug( recommendedPlanSlug )
			: undefined;
	} );
}
