import { useMemo } from '@wordpress/element';
import { type UseGridPlansParams } from './types';
import useGridPlans from './use-grid-plans';
import usePlanFeaturesForGridPlans from './use-plan-features-for-grid-plans';
import type { GridPlan } from '../../types';

const useGridPlansForFeaturesGrid = ( {
	allFeaturesList,
	coupon,
	eligibleForFreeHostingTrial,
	hiddenPlans,
	intent,
	isDisplayingPlansNeededForFeature,
	isInSignup,
	isSubdomainNotGenerated,
	selectedFeature,
	selectedPlan,
	showLegacyStorageFeature,
	siteId,
	storageAddOns,
	term,
	useCheckPlanAvailabilityForPurchase,
	useFreeTrialPlanSlugs,
}: UseGridPlansParams ): GridPlan[] | null => {
	const gridPlans = useGridPlans( {
		allFeaturesList,
		coupon,
		eligibleForFreeHostingTrial,
		hiddenPlans,
		intent,
		isDisplayingPlansNeededForFeature,
		isSubdomainNotGenerated,
		selectedFeature,
		selectedPlan,
		siteId,
		showLegacyStorageFeature,
		storageAddOns,
		term,
		useCheckPlanAvailabilityForPurchase,
		useFreeTrialPlanSlugs,
	} );

	const planFeaturesForFeaturesGrid = usePlanFeaturesForGridPlans( {
		gridPlans: gridPlans || [],
		allFeaturesList,
		intent,
		isInSignup,
		selectedFeature,
		showLegacyStorageFeature,
	} );

	return useMemo( () => {
		if ( ! gridPlans ) {
			return null;
		}

		return gridPlans.reduce( ( acc, gridPlan ) => {
			if ( gridPlan.isVisible ) {
				return [
					...acc,
					{
						...gridPlan,
						features: planFeaturesForFeaturesGrid[ gridPlan.planSlug ],
					},
				];
			}
			return acc;
		}, [] as GridPlan[] );
	}, [ gridPlans, planFeaturesForFeaturesGrid ] );
};

export default useGridPlansForFeaturesGrid;
