import { isBusinessPlan, isPersonalPlan, isPremiumPlan } from '@automattic/calypso-products';

/**
 * Which plans route the AI build through build-wow. The post-checkout AI
 * setup chooser offers "Create a custom design" on Personal and higher, and a
 * Commerce checkout skips the chooser entirely, so Personal, Premium and
 * Business land on build-wow.
 */
export function planSupportsBuildWow( planSlug: string | null | undefined ): boolean {
	return (
		!! planSlug &&
		( isPersonalPlan( planSlug ) || isPremiumPlan( planSlug ) || isBusinessPlan( planSlug ) )
	);
}
