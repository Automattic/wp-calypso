/**
 * Internal dependencies
 */
import type { State } from './reducer';
import type { FeatureId } from './types';

import { plansOrder } from '../plans/constants';
import type { PlanSlug } from '../plans';

export const getAllFeatures = ( state: State ) => state;

export const getRecommendedPlanSlug = (
	state: State,
	selectedFeatures: FeatureId[]
): PlanSlug | undefined => {
	const allFeatures = getAllFeatures( state );

	if ( ! selectedFeatures.length ) return undefined;

	return selectedFeatures.reduce( ( currentMinSupportedPlan, featureId ) => {
		const featureMinSupportedPlan = allFeatures[ featureId ].minSupportedPlan;

		return plansOrder.indexOf( featureMinSupportedPlan as never ) >
			plansOrder.indexOf( currentMinSupportedPlan as never )
			? featureMinSupportedPlan
			: currentMinSupportedPlan;
	}, allFeatures[ selectedFeatures[ 0 ] ].minSupportedPlan );
};
