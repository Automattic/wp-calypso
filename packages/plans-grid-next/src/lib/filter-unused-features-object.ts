import type { GridPlan } from '../types';
import type { FeatureObject } from '@automattic/calypso-products';

/**
 * Removes features that are not available in any of the visible grid plans.
 */
const filterUnusedFeaturesObject = (
	visibleGridPlans: GridPlan[],
	features: FeatureObject[]
): FeatureObject[] => {
	if ( ! visibleGridPlans || ! features ) {
		return [];
	}

	// Get all unique feature slugs in all gridPlans.
	const uniqueFeaturesAvailable = new Set(
		visibleGridPlans
			.map( ( gridPlan ) =>
				[ ...gridPlan.features.wpcomFeatures, ...gridPlan.features.jetpackFeatures ].map(
					( feature ) => feature.getSlug()
				)
			)
			.flat()
	);

	return features.filter( ( feature ) => {
		return uniqueFeaturesAvailable.has( feature.getSlug() );
	} );
};

export default filterUnusedFeaturesObject;
