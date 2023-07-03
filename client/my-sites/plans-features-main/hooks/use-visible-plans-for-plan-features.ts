import {
	PlanSlug,
	isBusinessPlan,
	isEcommercePlan,
	isFreePlan,
	isPersonalPlan,
	isPremiumPlan,
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

	return plans;
};

export default useVisiblePlansForPlanFeatures;
