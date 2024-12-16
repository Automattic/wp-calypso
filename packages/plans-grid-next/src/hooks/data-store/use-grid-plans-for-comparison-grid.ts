import {
	PLAN_ENTERPRISE_GRID_WPCOM,
	PLAN_HOSTING_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import useGridPlans from './use-grid-plans';
import useRestructuredPlanFeaturesForComparisonGrid from './use-restructured-plan-features-for-comparison-grid';
import type { UseGridPlansParams } from './types';
import type { GridPlan } from '../../types';

const HIDDEN_PLANS = [ PLAN_HOSTING_TRIAL_MONTHLY, PLAN_ENTERPRISE_GRID_WPCOM ];

const useGridPlansForComparisonGrid = ( {
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
	isDomainOnlySite,
	reflectStorageSelectionInPlanPrices,
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
		isDomainOnlySite,
		reflectStorageSelectionInPlanPrices,
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
