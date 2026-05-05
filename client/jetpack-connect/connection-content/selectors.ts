import { FAMILY_PRIORITY, getFamilyFromSlug } from './families';
import { getPluginEntry } from './plugin-registry';
import type { Family } from './families';

/**
 * Return families present in the active plugin list, ordered by priority
 * (A4A → Woo → Jetpack → Other). Each family appears at most once.
 */
export function getPresentFamilies( pluginSlugs: readonly string[] ): Family[] {
	const present = new Set< Family >();
	for ( const slug of pluginSlugs ) {
		present.add( getFamilyFromSlug( slug ) );
	}
	return FAMILY_PRIORITY.filter( ( family ) => present.has( family ) );
}

/**
 * Return up to `max` highest-priority families present in the active plugin
 * list. Defaults to two to match the "Connection enables" two-up layout.
 */
export function getTopFamilies( pluginSlugs: readonly string[], max = 2 ): Family[] {
	return getPresentFamilies( pluginSlugs ).slice( 0, max );
}

/**
 * Return true when any active plugin is part of the WooCommerce family.
 *
 * The single decision point for whether the flow refers to the property as
 * "store" or "site" in user-facing copy.
 */
export function isStore( pluginSlugs: readonly string[] ): boolean {
	return pluginSlugs.some( ( slug ) => getFamilyFromSlug( slug ) === 'woo' );
}

/**
 * Return true when the full Jetpack plugin is among the active plugins.
 *
 * Used by later PRs to choose between the "full Jetpack" copy variants and
 * the individual-plugin variants.
 */
export function hasFullJetpack( pluginSlugs: readonly string[] ): boolean {
	return pluginSlugs.some( ( slug ) => getPluginEntry( slug )?.isFullJetpack === true );
}

/**
 * Active plugin slugs that aren't represented by a featured family card.
 *
 * `featuredFamilies` is typically the result of `getTopFamilies(...)`. Any
 * plugin whose family isn't featured falls into the "Also used by" overflow
 * row that lands in PR 4.
 */
export function getOverflowSlugs(
	pluginSlugs: readonly string[],
	featuredFamilies: readonly Family[]
): string[] {
	return pluginSlugs.filter( ( slug ) => ! featuredFamilies.includes( getFamilyFromSlug( slug ) ) );
}
