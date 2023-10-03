import { FEATURE_CUSTOM_DOMAIN, isMonthly, isWooExpressPlan } from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import type {
	GridPlan,
	PlanFeaturesForGridPlan,
	PlansIntent,
} from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';

/**
 * Helper function to correctly process the plan features for Woo Express plans
 * with an introductory offer, where we may need to remove some features.
 */
const buildPlanFeaturesForWooExpressIntroductoryOffers = (
	gridPlans: Omit< GridPlan, 'features' >[],
	planSlug: string,
	planFeatures: PlanFeaturesForGridPlan
): PlanFeaturesForGridPlan => {
	if ( ! isWooExpressPlan( planSlug ) || isMonthly( planSlug ) ) {
		return planFeatures;
	}

	const gridPlan = gridPlans.find( ( gridPlan ) => gridPlan.planSlug === planSlug );

	if ( ! gridPlan || ! gridPlan.pricing.introOffer ) {
		return planFeatures;
	}

	planFeatures.wpcomFeatures = planFeatures.wpcomFeatures.filter( ( feature ) => {
		// Remove the custom domain feature for Woo Express plans with an introductory offer.
		if ( FEATURE_CUSTOM_DOMAIN === feature.getSlug() ) {
			return false;
		}

		return true;
	} );

	return planFeatures;
};

/**
 * Hook to transform the plan features for Woo Express plans,
 * as we need some post-processing to apply for introductory offers.
 */
const useGridPlanFeaturesForWooExpressIntroductoryOffers = (
	intent: PlansIntent | null | undefined,
	gridPlans: Omit< GridPlan, 'features' >[] | null,
	gridFeatures: { [ planSlug: string ]: PlanFeaturesForGridPlan }
): { [ planSlug: string ]: PlanFeaturesForGridPlan } => {
	// Note that we memoize the main logic here to avoid unnecessary reprocessing.
	return useMemo( () => {
		if ( intent !== 'plans-woocommerce' || ! gridPlans ) {
			return gridFeatures;
		}

		return Object.fromEntries(
			Object.entries( gridFeatures ).map( ( [ planSlug, planFeatures ] ) => [
				planSlug,
				buildPlanFeaturesForWooExpressIntroductoryOffers( gridPlans, planSlug, planFeatures ),
			] )
		) as { [ planSlug: string ]: PlanFeaturesForGridPlan };
	}, [ intent, gridPlans, gridFeatures ] );
};

export default useGridPlanFeaturesForWooExpressIntroductoryOffers;
