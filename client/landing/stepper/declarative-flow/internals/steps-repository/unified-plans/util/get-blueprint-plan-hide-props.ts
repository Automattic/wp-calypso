import {
	isBusinessPlan,
	isEcommercePlan,
	isFreePlan,
	isPersonalPlan,
	isPremiumPlan,
} from '@automattic/calypso-products';

export interface BlueprintPlanHideProps {
	hideFreePlan?: boolean;
	hidePersonalPlan?: boolean;
	hidePremiumPlan?: boolean;
	hideBusinessPlan?: boolean;
	hideEcommercePlan?: boolean;
}

/**
 * Turn a blueprint's suggested plans (WordPress.com plan product slugs from the
 * library's `_blueprint_plan` meta, e.g. `value_bundle`, `business-bundle`) into
 * the hide props the plans grid understands, so only the suggested plans show.
 *
 * The grid applies these on top of whatever intent picked the base plan mix, so a
 * plan the intent already leaves out stays out. An empty list means the blueprint
 * suggests nothing, and returns no props so the grid is left as it is.
 */
export function getBlueprintPlanHideProps( suggestedPlans: string[] ): BlueprintPlanHideProps {
	if ( ! suggestedPlans.length ) {
		return {};
	}

	const suggests = ( matches: ( planSlug: string ) => boolean ) =>
		suggestedPlans.some( ( planSlug ) => matches( planSlug ) );

	return {
		hideFreePlan: ! suggests( isFreePlan ),
		hidePersonalPlan: ! suggests( isPersonalPlan ),
		hidePremiumPlan: ! suggests( isPremiumPlan ),
		hideBusinessPlan: ! suggests( isBusinessPlan ),
		hideEcommercePlan: ! suggests( isEcommercePlan ),
	};
}
