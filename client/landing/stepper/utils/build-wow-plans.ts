import { isBusinessPlan, isPremiumPlan } from '@automattic/calypso-products';

/**
 * Which plans route the AI build through build-wow. The post-checkout AI
 * setup chooser offers "Create a custom design" on Personal and higher, but
 * Personal stays on the legacy Big Sky builder and a Commerce checkout skips
 * the chooser entirely, so only Premium and Business land on build-wow.
 */
export function planSupportsBuildWow( planSlug: string | null | undefined ): boolean {
	return !! planSlug && ( isPremiumPlan( planSlug ) || isBusinessPlan( planSlug ) );
}
