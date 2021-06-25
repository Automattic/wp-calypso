/**
 * Internal dependencies
 */
import type { PlanFeature } from '../types';

export const buildPlanFeaturesDict = (
	planFeatures: PlanFeature[]
): Record< string, PlanFeature > =>
	planFeatures.reduce(
		( dict, feature ) => ( {
			...dict,
			[ feature.id ]: feature,
		} ),
		{}
	);
