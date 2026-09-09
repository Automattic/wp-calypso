import { isBusinessPlan, isPersonalPlan, isPremiumPlan } from '@automattic/calypso-products';

/**
 * wpcom grants the underlying Big Sky feature to Commerce too, but the
 * post-checkout AI setup chooser only offers the AI build on Personal, Premium
 * and Business (a Commerce checkout skips the chooser and lands on My Home),
 * so build-wow routing matches that gate.
 */
export function planSupportsBuildWow( planSlug: string | null | undefined ): boolean {
	return (
		!! planSlug &&
		( isPersonalPlan( planSlug ) || isPremiumPlan( planSlug ) || isBusinessPlan( planSlug ) )
	);
}
