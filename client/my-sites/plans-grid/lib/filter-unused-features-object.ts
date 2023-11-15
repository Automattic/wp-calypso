import type { FeatureObject } from '@automattic/calypso-products';
import type { GridPlan } from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';

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
	const uniqueFeaturesAvailable = Array.from(
		new Set(
			visibleGridPlans
				.map( ( gridPlan ) =>
					gridPlan.features.wpcomFeatures.map( ( feature ) => feature.getSlug() )
				)
				.flat()
		)
	);

	return features.filter( ( feature ) => {
		return uniqueFeaturesAvailable.includes( feature.getSlug() );
	} );
};

export default filterUnusedFeaturesObject;
