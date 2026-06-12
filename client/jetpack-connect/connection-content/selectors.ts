import { FAMILY_PRIORITY, getFamilyFromSlug } from './families';
import { getPluginEntry } from './plugin-registry';
import type { Family } from './families';
import type { FeatureCardKey } from './family-features';

/**
 * Maximum number of brand-keyed cards the unified connect-account
 * features section will surface at once. Mirrors the all-three-families
 * stacked layout (A4A on top, Woo + Jetpack below) and is the single
 * source of truth shared by the "top families" helper and the layout
 * selector so a future layout change only needs one edit.
 */
export const MAX_FEATURED_CARDS = 3;

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
 * Return up to `max` highest-priority families present in the active
 * plugin list. Defaults to `MAX_FEATURED_CARDS` so the helper stays in
 * sync with the layout's card cap.
 */
export function getTopFamilies(
	pluginSlugs: readonly string[],
	max: number = MAX_FEATURED_CARDS
): Family[] {
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
 * Used to choose between the "full Jetpack" copy variants and the
 * individual-plugin variants when the Jetpack family is active.
 */
export function hasFullJetpack( pluginSlugs: readonly string[] ): boolean {
	return pluginSlugs.some( ( slug ) => getPluginEntry( slug )?.isFullJetpack === true );
}

/**
 * Result of `getFeatureSelection()` — the exact set of cards to render
 * in the features section, in priority order.
 */
export interface FeatureSelection {
	cardKeys: FeatureCardKey[];
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
 * Pick the cards to feature in the connect-account features section,
 * capped at `max` cards (default `MAX_FEATURED_CARDS` so the function
 * stays aligned with the layout's card cap).
 *
 * Decision order:
 *  1. Take the highest-priority families with known copy (`a4a`, `woo`,
 *     `jetpack`), capped at `max`.
 *  2. Map each family to its card key, with per-plugin overrides for the
 *     "single individual Jetpack plugin" case.
 *
 * The single `'other'` fallback card only renders when no known family is
 * present at all (the empty-input or only-unknown-plugins edge case).
 */
export function getFeatureSelection(
	pluginSlugs: readonly string[],
	max: number = MAX_FEATURED_CARDS
): FeatureSelection {
	const knownFamilies = getPresentFamilies( pluginSlugs ).filter(
		( family ) => family !== 'other'
	);

	if ( knownFamilies.length === 0 ) {
		return { cardKeys: [ 'other' ] };
	}

	const featured = knownFamilies.slice( 0, max );
	const cardKeys = featured.map( ( family ) => getFamilyCardKey( family, pluginSlugs ) );

	return { cardKeys };
}
