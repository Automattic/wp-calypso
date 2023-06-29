import {
	PlanSlug,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TYPE_ENTERPRISE_GRID_WPCOM,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	isBusinessPlan,
	isEcommercePlan,
	isFreePlan,
	isPersonalPlan,
	isPremiumPlan,
	planMatches,
} from '@automattic/calypso-products';

interface Props {
	availablePlans: PlanSlug[];
	isDisplayingPlansNeededForFeature: boolean;
	selectedPlan?: string;
	hideFreePlan?: boolean;
	hidePersonalPlan?: boolean;
	hidePremiumPlan?: boolean;
	hideBusinessPlan?: boolean;
	hideEcommercePlan?: boolean;
}

const useVisiblePlansForPlanFeatures = ( {
	availablePlans,
	isDisplayingPlansNeededForFeature,
	selectedPlan,
	hideFreePlan,
	hidePersonalPlan,
	hidePremiumPlan,
	hideBusinessPlan,
	hideEcommercePlan,
}: Props ) => {
	const isPlanOneOfType = ( plan: string, types: string[] ) =>
		types.filter( ( type ) => planMatches( plan, { type } ) ).length > 0;

	let plans = isDisplayingPlansNeededForFeature
		? availablePlans.filter( ( plan ) => {
				if ( selectedPlan && isEcommercePlan( selectedPlan ) ) {
					return isEcommercePlan( plan );
				}
				if ( selectedPlan && isBusinessPlan( selectedPlan ) ) {
					return isBusinessPlan( plan ) || isEcommercePlan( plan );
				}
				if ( selectedPlan && isPremiumPlan( selectedPlan ) ) {
					return isPremiumPlan( plan ) || isBusinessPlan( plan ) || isEcommercePlan( plan );
				}
		  } )
		: availablePlans;

	if ( hideFreePlan ) {
		plans = plans.filter( ( planSlug ) => ! isFreePlan( planSlug ) );
	}

	if ( hidePersonalPlan ) {
		plans = plans.filter( ( planSlug ) => ! isPersonalPlan( planSlug ) );
	}

	if ( hidePremiumPlan ) {
		plans = plans.filter( ( planSlug ) => ! isPremiumPlan( planSlug ) );
	}

	if ( hideBusinessPlan ) {
		plans = plans.filter( ( planSlug ) => ! isBusinessPlan( planSlug ) );
	}

	if ( hideEcommercePlan ) {
		plans = plans.filter( ( planSlug ) => ! isEcommercePlan( planSlug ) );
	}

	// TODO clk - should probably remove this (why the retriction to these plans?)
	// plans = plans.filter( ( plan ) =>
	// 	isPlanOneOfType( plan, [
	// 		TYPE_FREE,
	// 		TYPE_PERSONAL,
	// 		TYPE_PREMIUM,
	// 		TYPE_BUSINESS,
	// 		TYPE_ECOMMERCE,
	// 		TYPE_ENTERPRISE_GRID_WPCOM,
	// 	] )
	// );

	return plans;
};

export default useVisiblePlansForPlanFeatures;
