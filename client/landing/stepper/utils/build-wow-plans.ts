import { isBusinessPlan, isPersonalPlan, isPremiumPlan } from '@automattic/calypso-products';

/**
 * Which plans the post-checkout AI setup chooser sends to build-wow from its
 * "Create a custom design" card. Commerce is left out here: the AI site builder
 * onboarding sends a Commerce checkout to build-wow on its own.
 */
export function planSupportsBuildWow( planSlug: string | null | undefined ): boolean {
	return (
		!! planSlug &&
		( isPersonalPlan( planSlug ) || isPremiumPlan( planSlug ) || isBusinessPlan( planSlug ) )
	);
}
