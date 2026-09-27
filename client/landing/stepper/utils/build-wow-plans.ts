import { isBusinessPlan, isPersonalPlan, isPremiumPlan } from '@automattic/calypso-products';

/**
 * Which plans route the AI build through build-wow. The post-checkout AI
 * setup chooser offers "Create a custom design" on Personal and higher, but
 * Personal stays on the legacy Big Sky builder and a Commerce checkout skips
 * the chooser entirely, so only Premium and Business land on build-wow.
 */
export function planSupportsBuildWow( planSlug: string | null | undefined ): boolean {
	return !! planSlug && ( isPremiumPlan( planSlug ) || isBusinessPlan( planSlug ) );
}

/**
 * Which plans get the pre-production "Build on the DSL graph" choice. Wider
 * than planSupportsBuildWow(): the DSL build is a testing path, so Personal
 * rides build-wow here too.
 */
export function planSupportsBuildWowDsl( planSlug: string | null | undefined ): boolean {
	return !! planSlug && ( isPersonalPlan( planSlug ) || planSupportsBuildWow( planSlug ) );
}
