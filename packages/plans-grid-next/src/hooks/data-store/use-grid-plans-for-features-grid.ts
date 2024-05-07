import { useMemo } from '@wordpress/element';
import useGridPlans from './use-grid-plans';
import usePlanFeaturesForGridPlans from './use-plan-features-for-grid-plans';
import type { UseGridPlansParams } from './types';
import type { GridPlan } from '../../types';

const useGridPlansForFeaturesGrid = ( {
	allFeaturesList,
	coupon,
	eligibleForFreeHostingTrial,
	hasRedeemedDomainCredit,
	hiddenPlans,
	includePreviousPlanFeatures,
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
		hasRedeemedDomainCredit,
		hiddenPlans,
		intent,
		isDisplayingPlansNeededForFeature,
		isSubdomainNotGenerated,
		selectedFeature,
		selectedPlan,
		showLegacyStorageFeature,
		siteId,
		storageAddOns,
		term,
		useCheckPlanAvailabilityForPurchase,
		useFreeTrialPlanSlugs,
	} );

	const planFeaturesForFeaturesGrid = usePlanFeaturesForGridPlans( {
		allFeaturesList,
		gridPlans: gridPlans || [],
		hasRedeemedDomainCredit,
		includePreviousPlanFeatures,
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
