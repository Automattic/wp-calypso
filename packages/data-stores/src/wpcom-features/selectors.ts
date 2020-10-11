/**
 * Internal dependencies
 */
import type { State } from './reducer';
import type { FeatureId } from './types';

import { plansOrder } from '../plans/constants';

export const getAllFeatures = ( state: State ) => state;

export const getRecommendedPlanSlug = ( state: State, selectedFeatures: FeatureId[] ) => {
	const allFeatures = getAllFeatures( state );

	if ( ! selectedFeatures.length ) return '';

	return selectedFeatures.reduce( ( currentMinSupportedPlan, featureId ) => {
		const featureMinSupportedPlan = allFeatures[ featureId ].minSupportedPlan;

		return plansOrder.indexOf( featureMinSupportedPlan ) >
			plansOrder.indexOf( currentMinSupportedPlan )
			? featureMinSupportedPlan
			: currentMinSupportedPlan;
	}, allFeatures[ selectedFeatures[ 0 ] ].minSupportedPlan );
};
