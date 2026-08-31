/**
 * TEMPORARY — visual exploration of Pressable's plan rename
 * (Standard/Agency/Performance). Display layer only: it maps the catalog slugs in
 * `mock-data.ts` to the proposed names and to the proposed plan-type grouping.
 * Nothing here changes slugs, prices, entitlements, or carts.
 *
 * This dashboard's catalog is the legacy Build/Growth/.../Enterprise lineup rather
 * than the Signature plans, so the rows below are matched on install count — the
 * new sub-tier numbers are site counts, and both lineups share the same ladder
 * (1, 3, 5, 10, 20 ... 500).
 *
 * Delete this file and its imports to revert the exploration.
 */

export const DISPLAY_TIER_STANDARD = 'standard';
export const DISPLAY_TIER_AGENCY = 'agency';

export type PressableDisplayTier = typeof DISPLAY_TIER_STANDARD | typeof DISPLAY_TIER_AGENCY;

const DISPLAY_NAMES: Record< string, string > = {
	'pressable-build': 'Standard 1',
	'pressable-growth': 'Standard 3',
	'pressable-advanced': 'Standard 5',
	'pressable-pro': 'Standard 10',
	'pressable-premium': 'Agency 20',
	'pressable-business': 'Agency 50',
	'pressable-business-80': 'Agency 80',
	'pressable-business-100': 'Agency 100',
	'pressable-business-120': 'Agency 120',
	'pressable-business-150': 'Agency 150',
	'pressable-enterprise-4': 'Agency 200',
	'pressable-enterprise-5': 'Agency 250',
	'pressable-enterprise-6': 'Agency 300',
	'pressable-enterprise-7': 'Agency 350',
	'pressable-enterprise-8': 'Agency 400',
	'pressable-enterprise-9': 'Agency 450',
	'pressable-enterprise-10': 'Agency 500',
};

const DISPLAY_TIERS: Record< string, PressableDisplayTier > = {
	'pressable-build': DISPLAY_TIER_STANDARD,
	'pressable-growth': DISPLAY_TIER_STANDARD,
	'pressable-advanced': DISPLAY_TIER_STANDARD,
	'pressable-pro': DISPLAY_TIER_STANDARD,
	'pressable-premium': DISPLAY_TIER_AGENCY,
	'pressable-business': DISPLAY_TIER_AGENCY,
	'pressable-business-80': DISPLAY_TIER_AGENCY,
	'pressable-business-100': DISPLAY_TIER_AGENCY,
	'pressable-business-120': DISPLAY_TIER_AGENCY,
	'pressable-business-150': DISPLAY_TIER_AGENCY,
	'pressable-enterprise-4': DISPLAY_TIER_AGENCY,
	'pressable-enterprise-5': DISPLAY_TIER_AGENCY,
	'pressable-enterprise-6': DISPLAY_TIER_AGENCY,
	'pressable-enterprise-7': DISPLAY_TIER_AGENCY,
	'pressable-enterprise-8': DISPLAY_TIER_AGENCY,
	'pressable-enterprise-9': DISPLAY_TIER_AGENCY,
	'pressable-enterprise-10': DISPLAY_TIER_AGENCY,
};

export function getPressablePlanDisplayName( slug?: string, fallbackName = '' ) {
	return ( slug && DISPLAY_NAMES[ slug ] ) || fallbackName;
}

export function getPressableDisplayTier( slug?: string ) {
	return slug ? DISPLAY_TIERS[ slug ] : undefined;
}
