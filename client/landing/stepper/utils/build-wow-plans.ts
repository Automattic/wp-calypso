import { isBusinessPlan, isPersonalPlan, isPremiumPlan } from '@automattic/calypso-products';

/**
 * Which plans route the AI build through build-wow, in the post-checkout AI
 * setup chooser and the AI site builder onboarding. Commerce is left out here:
 * the onboarding adds it on its own, and the chooser keeps it on the legacy builder.
 */
export function planSupportsBuildWow( planSlug: string | null | undefined ): boolean {
	return (
		!! planSlug &&
		( isPersonalPlan( planSlug ) || isPremiumPlan( planSlug ) || isBusinessPlan( planSlug ) )
	);
}
