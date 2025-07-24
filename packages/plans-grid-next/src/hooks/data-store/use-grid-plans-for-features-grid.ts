import { useMemo } from '@wordpress/element';
import { useSelector } from 'react-redux';
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
	hideCurrentPlan,
	intent,
	isDisplayingPlansNeededForFeature,
	isInSignup,
	isSubdomainNotGenerated,
	selectedFeature,
	selectedPlan,
	showLegacyStorageFeature,
	siteId,
	term,
	useCheckPlanAvailabilityForPurchase,
	useFreeTrialPlanSlugs,
	highlightLabelOverrides,
	isDomainOnlySite,
	reflectStorageSelectionInPlanPrices,
}: UseGridPlansParams ): GridPlan[] | null => {
	const gridPlansResult = useGridPlans( {
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
		term,
		useCheckPlanAvailabilityForPurchase,
		useFreeTrialPlanSlugs,
		highlightLabelOverrides,
		isDomainOnlySite,
		reflectStorageSelectionInPlanPrices,
	} );

	// Get active promotions from Redux state directly
	const activePromotions = useSelector( ( state: any ) => state.activePromotions?.items || [] );

	const gridPlans = gridPlansResult.gridPlans;
	const currentSitePlanSlug = gridPlansResult.currentSitePlanSlug;

	const planFeaturesForFeaturesGrid = usePlanFeaturesForGridPlans( {
		allFeaturesList,
		gridPlans: gridPlans || [],
		hasRedeemedDomainCredit,
		intent,
		isInSignup,
		selectedFeature,
		showLegacyStorageFeature,
		currentSitePlanSlug,
		activePromotions,
	} );

	return useMemo( () => {
		if ( ! gridPlans ) {
			return null;
		}

		return gridPlans.reduce( ( acc, gridPlan ) => {
			if ( ! gridPlan.isVisible ) {
				return acc;
			}
			if ( hideCurrentPlan && gridPlan.current ) {
				return acc;
			}
			return [
				...acc,
				{
					...gridPlan,
					features: planFeaturesForFeaturesGrid[ gridPlan.planSlug ],
				},
			];
		}, [] as GridPlan[] );
	}, [ gridPlans, planFeaturesForFeaturesGrid, hideCurrentPlan ] );
};

export default useGridPlansForFeaturesGrid;
