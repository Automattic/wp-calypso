import {
	PLAN_ENTERPRISE_GRID_WPCOM,
	PLAN_HOSTING_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import useGridPlans from './use-grid-plans';
import useRestructuredPlanFeaturesForComparisonGrid from './use-restructured-plan-features-for-comparison-grid';
import type { UseGridPlansParams, UseGridPlansType } from './types';
import type { GridPlan } from '../../types';

const HIDDEN_PLANS = [ PLAN_HOSTING_TRIAL_MONTHLY, PLAN_ENTERPRISE_GRID_WPCOM ];

const useGridPlansForComparisonGrid = (
	{
		allFeaturesList,
		coupon,
		eligibleForFreeHostingTrial,
		hasRedeemedDomainCredit,
		getPlanAction,
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
	}: UseGridPlansParams,
	useGridPlansData: UseGridPlansType = useGridPlans
): GridPlan[] | null => {
	const gridPlans = useGridPlansData( {
		allFeaturesList,
		coupon,
		eligibleForFreeHostingTrial,
		getPlanAction,
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

	const planFeaturesForComparisonGrid = useRestructuredPlanFeaturesForComparisonGrid( {
		gridPlans: gridPlans || [],
		allFeaturesList,
		hasRedeemedDomainCredit,
		intent,
		selectedFeature,
		showLegacyStorageFeature,
	} );

	return useMemo( () => {
		if ( ! gridPlans ) {
			return null;
		}

		return gridPlans.reduce( ( acc, gridPlan ) => {
			if ( gridPlan.isVisible && ! HIDDEN_PLANS.includes( gridPlan.planSlug ) ) {
				return [
					...acc,
					{
						...gridPlan,
						features: planFeaturesForComparisonGrid[ gridPlan.planSlug ],
					},
				];
			}

			return acc;
		}, [] as GridPlan[] );
	}, [ gridPlans, planFeaturesForComparisonGrid ] );
};

export default useGridPlansForComparisonGrid;
