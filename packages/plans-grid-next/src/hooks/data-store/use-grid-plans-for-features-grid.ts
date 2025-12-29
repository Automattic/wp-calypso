import { useMemo } from '@wordpress/element';
import useGridPlans from './use-grid-plans';
import usePlanFeaturesForGridPlans from './use-plan-features-for-grid-plans';
import { useSummerSpecialStatus } from './use-summer-special-status';
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
	useLongSetFeatures,
	useLongSetStackedFeatures,
	useShortSetStackedFeatures,
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
		term,
		useCheckPlanAvailabilityForPurchase,
		useFreeTrialPlanSlugs,
		highlightLabelOverrides,
		isDomainOnlySite,
		reflectStorageSelectionInPlanPrices,
	} );

	// Get summer special status early
	const isSummerSpecial = useSummerSpecialStatus( { isInSignup, siteId } );

	const planFeaturesForFeaturesGrid = usePlanFeaturesForGridPlans( {
		allFeaturesList,
		gridPlans: gridPlans || [],
		hasRedeemedDomainCredit,
		intent,
		isInSignup,
		selectedFeature,
		showLegacyStorageFeature,
		isSummerSpecial,
		useLongSetFeatures,
		useLongSetStackedFeatures,
		useShortSetStackedFeatures,
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
