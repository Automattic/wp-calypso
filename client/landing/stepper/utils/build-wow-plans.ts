import {
	isBusinessPlan,
	isEcommercePlan,
	isPersonalPlan,
	isPremiumPlan,
} from '@automattic/calypso-products';

/**
 * Which plans route the AI build through build-wow. The post-checkout AI
 * setup chooser offers "Create a custom design" on Personal and higher, and
 * Personal, Premium and Business land on build-wow. Commerce is left to
 * planBuildsStoreOnBuildWow().
 */
export function planSupportsBuildWow( planSlug: string | null | undefined ): boolean {
	return (
		!! planSlug &&
		( isPersonalPlan( planSlug ) || isPremiumPlan( planSlug ) || isBusinessPlan( planSlug ) )
	);
}

/**
 * Commerce builds a store, also on build-wow; the server picks the generator.
 */
export function planBuildsStoreOnBuildWow( planSlug: string | null | undefined ): boolean {
	return !! planSlug && isEcommercePlan( planSlug );
}
