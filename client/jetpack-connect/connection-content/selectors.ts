import { FAMILY_PRIORITY, getFamilyFromSlug } from './families';
import { getPluginEntry } from './plugin-registry';
import type { Family } from './families';
import type { FeatureCardKey } from './family-features';

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
 * plugin whose family isn't featured falls into this list. Currently
 * exported as a building block; `getFeatureSelection()` uses a different,
 * comprehensive Used-by list rather than this filtered view.
 */
export function getOverflowSlugs(
	pluginSlugs: readonly string[],
	featuredFamilies: readonly Family[]
): string[] {
	return pluginSlugs.filter( ( slug ) => ! featuredFamilies.includes( getFamilyFromSlug( slug ) ) );
}

/**
 * Result of `getFeatureSelection()` — the exact set of cards to render in
 * the features section, plus the trailing Used-by row that lists every
 * active plugin (including the slugs the cards already represent) when
 * more than one plugin is connected.
 */
export interface FeatureSelection {
	cardKeys: FeatureCardKey[];
	overflowSlugs: string[];
}

/**
 * Resolve the family-priority card key for a single family.
 *
 * The Jetpack family is special-cased: a single individual Jetpack plugin
 * (without the full Jetpack plugin) earns a per-plugin card so the copy can
 * be specific to that plugin. Two-or-more individual Jetpack plugins (or
 * any unrecognised individual slug) collapse back to the generic
 * `'jetpack'` family card. This mirrors the `JETPACK_MULTI` collapse rule
 * in `scenarios.ts`.
 */
function getFamilyCardKey( family: Family, pluginSlugs: readonly string[] ): FeatureCardKey {
	if ( family !== 'jetpack' ) {
		return family;
	}

	const jetpackSlugs = pluginSlugs.filter( ( slug ) => getFamilyFromSlug( slug ) === 'jetpack' );
	const hasFull = jetpackSlugs.some( ( slug ) => getPluginEntry( slug )?.isFullJetpack === true );
	if ( hasFull || jetpackSlugs.length !== 1 ) {
		return 'jetpack';
	}

	switch ( jetpackSlugs[ 0 ] ) {
		case 'jetpack-backup':
			return 'jetpack-backup';
		case 'jetpack-protect':
			return 'jetpack-protect';
		case 'jetpack-boost':
			return 'jetpack-boost';
		case 'jetpack-search':
			return 'jetpack-search';
		case 'jetpack-social':
			return 'jetpack-social';
		case 'jetpack-videopress':
			return 'jetpack-videopress';
		default:
			return 'jetpack';
	}
}

/**
 * Pick the cards to feature plus the comprehensive Used-by plugin list,
 * capped at `max` cards (default 2 to match the two-up layout).
 *
 * Decision order:
 *  1. Take the highest-priority families with known copy (`a4a`, `woo`,
 *     `jetpack`), capped at `max`.
 *  2. Map each family to its card key, with per-plugin overrides for the
 *     "single individual Jetpack plugin" case.
 *  3. The Used-by row repeats every active plugin slug — including the
 *     ones the cards already represent — whenever more than one plugin is
 *     connected. Order mirrors the input so caller intent is preserved.
 *     Single-plugin connections (or no plugins at all) skip the row
 *     because there's nothing to disambiguate.
 *
 * The redundancy is deliberate: every Jetpack-family card shares the same
 * brand mark (and the per-plugin variants share the wordmark), so the
 * explicit list is the only place users can tell *which* Jetpack
 * plugin(s) the connection actually covers.
 *
 * The single `'other'` fallback card only renders when no known family is
 * present at all (the empty-input or only-unknown-plugins edge case).
 */
export function getFeatureSelection( pluginSlugs: readonly string[], max = 2 ): FeatureSelection {
	const knownFamilies = getPresentFamilies( pluginSlugs ).filter(
		( family ) => family !== 'other'
	);

	const overflowSlugs = pluginSlugs.length > 1 ? [ ...pluginSlugs ] : [];

	if ( knownFamilies.length === 0 ) {
		return { cardKeys: [ 'other' ], overflowSlugs };
	}

	const featured = knownFamilies.slice( 0, max );
	const cardKeys = featured.map( ( family ) => getFamilyCardKey( family, pluginSlugs ) );

	return { cardKeys, overflowSlugs };
}
