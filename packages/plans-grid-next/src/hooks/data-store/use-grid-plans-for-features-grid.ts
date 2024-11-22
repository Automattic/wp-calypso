import { useMemo } from '@wordpress/element';
import { EFFECTIVE_TERMS_LIST } from '../../constants';
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
}: UseGridPlansParams ): {
	[ term in ( typeof EFFECTIVE_TERMS_LIST )[ number ] ]?: GridPlan[] | null;
} => {
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

	const gridPlans = {
		[ EFFECTIVE_TERMS_LIST[ 0 ] ]: useGridPlans( {
			...useGridPlansParams,
			term: EFFECTIVE_TERMS_LIST[ 0 ],
		} ),
		[ EFFECTIVE_TERMS_LIST[ 1 ] ]: useGridPlans( {
			...useGridPlansParams,
			term: EFFECTIVE_TERMS_LIST[ 1 ],
		} ),
		[ EFFECTIVE_TERMS_LIST[ 2 ] ]: useGridPlans( {
			...useGridPlansParams,
			term: EFFECTIVE_TERMS_LIST[ 2 ],
		} ),
		[ EFFECTIVE_TERMS_LIST[ 3 ] ]: useGridPlans( {
			...useGridPlansParams,
			term: EFFECTIVE_TERMS_LIST[ 3 ],
		} ),
	};

	const usePlanFeaturesForGridPlansParams = {
		allFeaturesList,
		hasRedeemedDomainCredit,
		intent,
		isInSignup,
		selectedFeature,
		showLegacyStorageFeature,
	};

	const planFeaturesForFeaturesGrid = {
		[ EFFECTIVE_TERMS_LIST[ 0 ] ]: usePlanFeaturesForGridPlans( {
			...usePlanFeaturesForGridPlansParams,
			gridPlans: gridPlans[ EFFECTIVE_TERMS_LIST[ 0 ] ] || [],
		} ),
		[ EFFECTIVE_TERMS_LIST[ 1 ] ]: usePlanFeaturesForGridPlans( {
			...usePlanFeaturesForGridPlansParams,
			gridPlans: gridPlans[ EFFECTIVE_TERMS_LIST[ 1 ] ] || [],
		} ),
		[ EFFECTIVE_TERMS_LIST[ 2 ] ]: usePlanFeaturesForGridPlans( {
			...usePlanFeaturesForGridPlansParams,
			gridPlans: gridPlans[ EFFECTIVE_TERMS_LIST[ 2 ] ] || [],
		} ),
		[ EFFECTIVE_TERMS_LIST[ 3 ] ]: usePlanFeaturesForGridPlans( {
			...usePlanFeaturesForGridPlansParams,
			gridPlans: gridPlans[ EFFECTIVE_TERMS_LIST[ 3 ] ] || [],
		} ),
	};

	return useMemo(
		() => {
			return Object.fromEntries(
				EFFECTIVE_TERMS_LIST.map( ( term ) => {
					return [
						term,
						gridPlans[ term ]?.reduce( ( acc, gridPlan ) => {
							if ( gridPlan.isVisible ) {
								return [
									...acc,
									{
										...gridPlan,
										features: planFeaturesForFeaturesGrid[ term ][ gridPlan.planSlug ],
									},
								];
							}
							return acc;
						}, [] as GridPlan[] ),
					];
				} )
			);
		},
		/* eslint-disable react-hooks/exhaustive-deps */
		/**
		 * It is asking for `gridPlans`, but we don't want that dependency here. The code needed to get `gridPlans` memoized is complex,
		 * so grabbing the values directly from the hooks is a bit more efficient, also for potential extensions (introducing more terms, etc.)
		 */ [
			gridPlans[ EFFECTIVE_TERMS_LIST[ 0 ] ],
			gridPlans[ EFFECTIVE_TERMS_LIST[ 1 ] ],
			gridPlans[ EFFECTIVE_TERMS_LIST[ 2 ] ],
			gridPlans[ EFFECTIVE_TERMS_LIST[ 3 ] ],
			planFeaturesForFeaturesGrid[ EFFECTIVE_TERMS_LIST[ 0 ] ],
			planFeaturesForFeaturesGrid[ EFFECTIVE_TERMS_LIST[ 1 ] ],
			planFeaturesForFeaturesGrid[ EFFECTIVE_TERMS_LIST[ 2 ] ],
			planFeaturesForFeaturesGrid[ EFFECTIVE_TERMS_LIST[ 3 ] ],
		]
	);
};

export default useGridPlansForFeaturesGrid;
