import { getFamilyFromSlug } from './families';
import { getPluginEntry } from './plugin-registry';

/**
 * Identifier for the subtitle scenario that drives copy selection on every
 * connector-flow surface (login / auth / signup).
 *
 * Scenarios reflect *which families* are present (A4A, Woo, Jetpack) and —
 * for the single-family Woo and Jetpack cases — *which specific plugins*.
 * Unknown plugins ("other" family) are silently ignored when a known family
 * is present. `OTHER_ONLY` is the fallback when no known family is present
 * at all (including the empty-plugin-list edge case).
 *
 * Note: there is intentionally no `WOOPAY_ONLY` scenario. WooPayments has
 * WooCommerce core as a hard activation dependency, so a Woo-family plugin
 * set that contains `woocommerce-payments` always also contains
 * `woocommerce` and routes through `WOO_AND_PAY`. A defensive fall-through
 * handles the impossible-but-still-possible case where the plugin list
 * arrives malformed (URL truncation, etc.) — see the Woo branch below.
 *
 * The 16 keys are the canonical scenario set, and each surface's
 * pre-composed subtitle table is keyed by exactly these values — see
 * `copy.ts`.
 */
export type SubtitleScenario =
	| 'A4A_ONLY'
	| 'A4A_WOO'
	| 'A4A_JETPACK'
	| 'ALL_THREE'
	| 'WOO_ONLY'
	| 'WOO_AND_PAY'
	| 'WOO_JETPACK'
	| 'JETPACK_FULL'
	| 'JETPACK_BACKUP'
	| 'JETPACK_PROTECT'
	| 'JETPACK_BOOST'
	| 'JETPACK_SEARCH'
	| 'JETPACK_SOCIAL'
	| 'JETPACK_VIDEOPRESS'
	| 'JETPACK_MULTI'
	| 'OTHER_ONLY';

/**
 * Map a single Jetpack-family slug to its dedicated single-plugin scenario,
 * or `null` for the full Jetpack plugin (which routes through `JETPACK_FULL`)
 * and for any unrecognised Jetpack-prefixed slug (which routes through the
 * `JETPACK_MULTI`/`JETPACK_FULL` fallbacks).
 */
function getJetpackSingleScenario( slug: string ): SubtitleScenario | null {
	switch ( slug ) {
		case 'jetpack-backup':
			return 'JETPACK_BACKUP';
		case 'jetpack-protect':
			return 'JETPACK_PROTECT';
		case 'jetpack-boost':
			return 'JETPACK_BOOST';
		case 'jetpack-search':
			return 'JETPACK_SEARCH';
		case 'jetpack-social':
			return 'JETPACK_SOCIAL';
		case 'jetpack-videopress':
			return 'JETPACK_VIDEOPRESS';
		default:
			return null;
	}
}

/**
 * Resolve the subtitle scenario for the active plugin set.
 *
 * Decision order, top-down:
 *
 * 1. Multi-family combinations (A4A + Woo + Jetpack), in priority order.
 * 2. Single-family combinations:
 *    - Woo: WooCommerce + WooPayments together routes to `WOO_AND_PAY`;
 *      everything else (including a malformed `woocommerce-payments`-only
 *      list, which the WooPayments dependency on WooCommerce core makes
 *      impossible in practice) falls through to `WOO_ONLY`.
 *    - Jetpack: distinguish full Jetpack / a single individual plugin /
 *      two-or-more individuals. Two or more individual Jetpack plugins
 *      (without the full plugin) collapse to `JETPACK_MULTI`, which reuses
 *      the full-Jetpack copy by design — the per-plugin specificity lives
 *      in the feature cards, not in the subtitle.
 *    - A4A: only one plugin in this family.
 * 3. `OTHER_ONLY` for empty input or only-unknown plugins.
 *
 * Unknown ("other"-family) plugins are silently ignored once a known family
 * is present — they don't influence subtitle copy.
 */
export function getSubtitleScenario( pluginSlugs: readonly string[] = [] ): SubtitleScenario {
	const families = new Set( pluginSlugs.map( getFamilyFromSlug ) );
	const hasA4A = families.has( 'a4a' );
	const hasWoo = families.has( 'woo' );
	const hasJetpack = families.has( 'jetpack' );

	if ( hasA4A && hasWoo && hasJetpack ) {
		return 'ALL_THREE';
	}
	if ( hasA4A && hasWoo ) {
		return 'A4A_WOO';
	}
	if ( hasA4A && hasJetpack ) {
		return 'A4A_JETPACK';
	}
	if ( hasWoo && hasJetpack ) {
		return 'WOO_JETPACK';
	}

	if ( hasA4A ) {
		return 'A4A_ONLY';
	}

	if ( hasWoo ) {
		const wooSlugs = pluginSlugs.filter( ( slug ) => getFamilyFromSlug( slug ) === 'woo' );
		if ( wooSlugs.includes( 'woocommerce' ) && wooSlugs.includes( 'woocommerce-payments' ) ) {
			return 'WOO_AND_PAY';
		}
		return 'WOO_ONLY';
	}

	if ( hasJetpack ) {
		const jetpackSlugs = pluginSlugs.filter( ( slug ) => getFamilyFromSlug( slug ) === 'jetpack' );
		const hasFull = jetpackSlugs.some( ( slug ) => getPluginEntry( slug )?.isFullJetpack === true );
		if ( hasFull ) {
			return 'JETPACK_FULL';
		}
		if ( jetpackSlugs.length === 1 ) {
			return getJetpackSingleScenario( jetpackSlugs[ 0 ] ) ?? 'JETPACK_MULTI';
		}
		return 'JETPACK_MULTI';
	}

	return 'OTHER_ONLY';
}
