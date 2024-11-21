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
	intent,
	isDisplayingPlansNeededForFeature,
	isInSignup,
	isSubdomainNotGenerated,
	selectedFeature,
	selectedPlan,
	showLegacyStorageFeature,
	siteId,
	storageAddOns,
	useCheckPlanAvailabilityForPurchase,
	useFreeTrialPlanSlugs,
	highlightLabelOverrides,
	isDomainOnlySite,
}: UseGridPlansParams ): GridPlan[] | null => {
	const useGridPlansParams = {
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
		useCheckPlanAvailabilityForPurchase,
		useFreeTrialPlanSlugs,
		highlightLabelOverrides,
		isDomainOnlySite,
	};

	const monthlyGridPlans = useGridPlans( { ...useGridPlansParams, term: 'TERM_MONTHLY' } );
	const yearlyGridPlans = useGridPlans( { ...useGridPlansParams, term: 'TERM_ANNUALLY' } );

	const gridPlans = useMemo( () => {
		return {
			monthly: monthlyGridPlans,
			yearly: yearlyGridPlans,
		};
	}, [ monthlyGridPlans, yearlyGridPlans ] );

	const usePlanFeaturesForGridPlansParams = {
		allFeaturesList,
		hasRedeemedDomainCredit,
		intent,
		isInSignup,
		selectedFeature,
		showLegacyStorageFeature,
	};

	const _planFeaturesForFeaturesGrid = {
		monthly: usePlanFeaturesForGridPlans( {
			...usePlanFeaturesForGridPlansParams,
			gridPlans: gridPlans.monthly || [],
		} ),
		yearly: usePlanFeaturesForGridPlans( {
			...usePlanFeaturesForGridPlansParams,
			gridPlans: gridPlans.yearly || [],
		} ),
	};

	return useMemo( () => {
		return Object.fromEntries(
			Object.entries( gridPlans ).map( ( [ term, gridPlans ] ) => {
				return [
					term,
					gridPlans?.reduce( ( acc, gridPlan ) => {
						if ( gridPlan.isVisible ) {
							return [
								...acc,
								{
									...gridPlan,
									features: _planFeaturesForFeaturesGrid[ term ][ gridPlan.planSlug ],
								},
							];
						}
						return acc;
					}, [] as GridPlan[] ),
				];
			} )
		);
	}, [ gridPlans, _planFeaturesForFeaturesGrid ] );
};

export default useGridPlansForFeaturesGrid;
