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
 * planMayBuildStoreOnBuildWow().
 */
export function planSupportsBuildWow( planSlug: string | null | undefined ): boolean {
	return (
		!! planSlug &&
		( isPersonalPlan( planSlug ) || isPremiumPlan( planSlug ) || isBusinessPlan( planSlug ) )
	);
}

/**
 * A Commerce build makes a store, which build-wow does only for the accounts on
 * the store rollout; commerceUsesBuildWow() asks the server about the account.
 */
export function planMayBuildStoreOnBuildWow( planSlug: string | null | undefined ): boolean {
	return !! planSlug && isEcommercePlan( planSlug );
}
