import {
	isBusinessPlan,
	isEcommercePlan,
	isFreePlan,
	isPersonalPlan,
	isPremiumPlan,
	PlanSlug,
} from '@automattic/calypso-products';
import { GridPlan } from 'calypso/my-sites/plan-features-2023-grid/hooks/npm-ready/data-store/use-wpcom-plans-with-intent';

interface Props {
	plans: Record< PlanSlug, GridPlan >;
	isDisplayingPlansNeededForFeature: boolean;
	selectedPlan?: string;
	hideFreePlan?: boolean;
	hidePersonalPlan?: boolean;
	hidePremiumPlan?: boolean;
	hideBusinessPlan?: boolean;
	hideEcommercePlan?: boolean;
}

const useFilterPlansForPlanFeatures = ( {
	plans,
	isDisplayingPlansNeededForFeature,
	selectedPlan,
	hideFreePlan,
	hidePersonalPlan,
	hidePremiumPlan,
	hideBusinessPlan,
	hideEcommercePlan,
}: Props ) => {
	const filteredPlans = isDisplayingPlansNeededForFeature
		? Object.entries( plans ).reduce( ( acc, [ planSlug, gridPlan ] ) => {
				if ( selectedPlan && isEcommercePlan( selectedPlan ) ) {
					return isEcommercePlan( planSlug ) ? { ...acc, [ planSlug ]: gridPlan } : acc;
				}

				if ( selectedPlan && isBusinessPlan( selectedPlan ) ) {
					return isBusinessPlan( planSlug ) || isEcommercePlan( planSlug )
						? { ...acc, [ planSlug ]: gridPlan }
						: acc;
				}

				if ( selectedPlan && isPremiumPlan( selectedPlan ) ) {
					return isPremiumPlan( planSlug ) ||
						isBusinessPlan( planSlug ) ||
						isEcommercePlan( planSlug )
						? { ...acc, [ planSlug ]: gridPlan }
						: acc;
				}

				return acc;
		  }, {} as Record< PlanSlug, GridPlan > )
		: plans;

	return Object.entries( filteredPlans ).reduce( ( acc, [ planSlug, gridPlan ] ) => {
		if (
			( hideFreePlan && isFreePlan( planSlug ) ) ||
			( hidePersonalPlan && isPersonalPlan( planSlug ) ) ||
			( hidePremiumPlan && isPremiumPlan( planSlug ) ) ||
			( hideBusinessPlan && isBusinessPlan( planSlug ) ) ||
			( hideEcommercePlan && isEcommercePlan( planSlug ) )
		) {
			return acc;
		}

		return { ...acc, [ planSlug ]: gridPlan };
	}, {} as Record< PlanSlug, GridPlan > );
};

export default useFilterPlansForPlanFeatures;
