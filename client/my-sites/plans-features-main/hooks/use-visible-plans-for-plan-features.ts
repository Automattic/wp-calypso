import {
	isBusinessPlan,
	isEcommercePlan,
	isFreePlan,
	isPersonalPlan,
	isPremiumPlan,
} from '@automattic/calypso-products';
import { GridPlan } from 'calypso/my-sites/plan-features-2023-grid/hooks/npm-ready/use-wpcom-plans-with-intent';

interface Props {
	availablePlans: GridPlan[];
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
					return isEcommercePlan( plan.planSlug );
				}
				if ( selectedPlan && isBusinessPlan( selectedPlan ) ) {
					return isBusinessPlan( plan.planSlug ) || isEcommercePlan( plan.planSlug );
				}
				if ( selectedPlan && isPremiumPlan( selectedPlan ) ) {
					return (
						isPremiumPlan( plan.planSlug ) ||
						isBusinessPlan( plan.planSlug ) ||
						isEcommercePlan( plan.planSlug )
					);
				}
		  } )
		: availablePlans;

	if ( hideFreePlan ) {
		plans = plans.filter( ( plan ) => ! isFreePlan( plan.planSlug ) );
	}

	if ( hidePersonalPlan ) {
		plans = plans.filter( ( plan ) => ! isPersonalPlan( plan.planSlug ) );
	}

	if ( hidePremiumPlan ) {
		plans = plans.filter( ( plan ) => ! isPremiumPlan( plan.planSlug ) );
	}

	if ( hideBusinessPlan ) {
		plans = plans.filter( ( plan ) => ! isBusinessPlan( plan.planSlug ) );
	}

	if ( hideEcommercePlan ) {
		plans = plans.filter( ( plan ) => ! isEcommercePlan( plan.planSlug ) );
	}

	return plans;
};

export default useVisiblePlansForPlanFeatures;
