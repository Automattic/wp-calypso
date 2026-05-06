import { getFamilyFromSlug } from './families';
import { getPluginEntry } from './plugin-registry';

/**
 * Identifier for the subtitle scenario that drives copy selection on every
 * connector-flow surface (login / auth / signup).
 *
 * Scenarios reflect *which families* are present (A4A, Woo, Jetpack) and —
 * for the single-family Woo and Jetpack cases — *which specific plugins*.
 * Unknown plugins ("other" family) never change the scenario when a known
 * family is present; they only land in the "Also used by" overflow row in
 * PR 4. `OTHER_ONLY` is the fallback when no known family is present at
 * all (including the empty-plugin-list edge case).
 *
 * The 17 keys are the canonical scenario set the plan calls out, and each
 * surface's pre-composed subtitle table is keyed by exactly these values
 * — see `copy.ts`.
 */
export type SubtitleScenario =
	| 'A4A_ONLY'
	| 'A4A_WOO'
	| 'A4A_JETPACK'
	| 'ALL_THREE'
	| 'WOO_ONLY'
	| 'WOOPAY_ONLY'
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
 *    - Woo: distinguish WooCommerce-only / WooPayments-only / both.
 *    - Jetpack: distinguish full Jetpack / a single individual plugin /
 *      two-or-more individuals (collapses to `JETPACK_MULTI`, which reuses
 *      the full-Jetpack copy by design — see the plan's "any 2+ individual
 *      Jetpacks" rule).
 *    - A4A: only one plugin in this family.
 * 3. `OTHER_ONLY` for empty input or only-unknown plugins.
 *
 * Unknown ("other"-family) plugins are silently ignored once a known family
 * is present — they get surfaced in the PR 4 "Also used by" row instead of
 * driving subtitle copy.
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
		const hasCore = wooSlugs.includes( 'woocommerce' );
		const hasPayments = wooSlugs.includes( 'woocommerce-payments' );
		if ( hasCore && hasPayments ) {
			return 'WOO_AND_PAY';
		}
		if ( hasPayments && ! hasCore ) {
			return 'WOOPAY_ONLY';
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
