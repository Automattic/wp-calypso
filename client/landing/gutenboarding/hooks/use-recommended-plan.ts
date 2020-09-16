/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { Plans } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { PLANS_STORE } from '../stores/plans';
import { WPCOM_FEATURES_STORE } from '../stores/wpcom-features';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';

const order = [
	Plans.PLAN_PERSONAL,
	Plans.PLAN_PREMIUM,
	Plans.PLAN_BUSINESS,
	Plans.PLAN_ECOMMERCE,
];

export function useRecommendedPlanSlug() {
	const allFeatures = useSelect( ( select ) => select( WPCOM_FEATURES_STORE ).getAllFeatures() );
	const selectedFeatures = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedFeatures() );

	if ( ! selectedFeatures.length ) return;

	return selectedFeatures.reduce( ( currentMinSupportedPlan, featureId ) => {
		const featureMinSupportedPlan = allFeatures[ featureId ].minSupportedPlan;
		return order.indexOf( featureMinSupportedPlan ) > order.indexOf( currentMinSupportedPlan )
			? featureMinSupportedPlan
			: currentMinSupportedPlan;
	}, allFeatures[ selectedFeatures[ 0 ] ].minSupportedPlan );
}

export default function useRecommendedPlan() {
	const recommendedPlanSlug = useRecommendedPlanSlug();

	return useSelect( ( select ) => {
		return recommendedPlanSlug
			? select( PLANS_STORE ).getPlanBySlug( recommendedPlanSlug )
			: undefined;
	} );
}
