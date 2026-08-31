/**
 * TEMPORARY — visual exploration of Pressable's plan rename (Signature/Premium ->
 * Standard/Agency/Performance). Display layer only: it maps product slugs to the
 * proposed names and to the proposed tab grouping, and it is applied where plan
 * names are rendered. Nothing here changes slugs, prices, entitlements, or carts.
 *
 * Delete this file and its imports to revert the exploration.
 */

export const DISPLAY_TIER_STANDARD = 'standard';
export const DISPLAY_TIER_AGENCY = 'agency';
export const DISPLAY_TIER_PERFORMANCE = 'performance';

export type PressableDisplayTier =
	| typeof DISPLAY_TIER_STANDARD
	| typeof DISPLAY_TIER_AGENCY
	| typeof DISPLAY_TIER_PERFORMANCE;

/**
 * Proposed plan name per product slug. Sub-tier numbers are site counts now, so
 * the numbering does not carry over one for one from the Signature plans.
 */
const DISPLAY_NAMES: Record< string, string > = {
	'pressable-signature-1': 'Standard 1',
	'pressable-signature-2': 'Standard 3',
	'pressable-signature-3': 'Standard 5',
	'pressable-signature-4': 'Standard 10',
	'pressable-signature-5': 'Agency 20',
	'pressable-signature-6': 'Agency 50',
	'pressable-signature-7': 'Agency 80',
	'pressable-signature-8': 'Agency 100',
	'pressable-signature-9': 'Agency 120',
	'pressable-signature-10': 'Agency 150',
	'pressable-signature-11': 'Agency 200',
	'pressable-signature-12': 'Agency 250',
	'pressable-signature-13': 'Agency 300',
	'pressable-signature-14': 'Agency 350',
	'pressable-signature-15': 'Agency 400',
	'pressable-signature-16': 'Agency 450',
	'pressable-signature-17': 'Agency 500',
	'pressable-premium-1': 'Performance 1',
	'pressable-premium-2': 'Performance 2',
	'pressable-premium-3': 'Performance 3',
	'pressable-premium-4': 'Performance 4',
	'pressable-premium-5': 'Performance 5',
	'pressable-premium-6': 'Performance 6',
	'pressable-premium-7': 'Performance 7',
	'pressable-premium-8': 'Performance 8',
	'pressable-premium-9': 'Performance 9',
	'pressable-premium-10': 'Performance 10',
	'pressable-premium-11': 'Performance 11',
};

const DISPLAY_TIERS: Record< string, PressableDisplayTier > = {
	'pressable-signature-1': DISPLAY_TIER_STANDARD,
	'pressable-signature-2': DISPLAY_TIER_STANDARD,
	'pressable-signature-3': DISPLAY_TIER_STANDARD,
	'pressable-signature-4': DISPLAY_TIER_STANDARD,
	'pressable-signature-5': DISPLAY_TIER_AGENCY,
	'pressable-signature-6': DISPLAY_TIER_AGENCY,
	'pressable-signature-7': DISPLAY_TIER_AGENCY,
	'pressable-signature-8': DISPLAY_TIER_AGENCY,
	'pressable-signature-9': DISPLAY_TIER_AGENCY,
	'pressable-signature-10': DISPLAY_TIER_AGENCY,
	'pressable-signature-11': DISPLAY_TIER_AGENCY,
	'pressable-signature-12': DISPLAY_TIER_AGENCY,
	'pressable-signature-13': DISPLAY_TIER_AGENCY,
	'pressable-signature-14': DISPLAY_TIER_AGENCY,
	'pressable-signature-15': DISPLAY_TIER_AGENCY,
	'pressable-signature-16': DISPLAY_TIER_AGENCY,
	'pressable-signature-17': DISPLAY_TIER_AGENCY,
	'pressable-premium-1': DISPLAY_TIER_PERFORMANCE,
	'pressable-premium-2': DISPLAY_TIER_PERFORMANCE,
	'pressable-premium-3': DISPLAY_TIER_PERFORMANCE,
	'pressable-premium-4': DISPLAY_TIER_PERFORMANCE,
	'pressable-premium-5': DISPLAY_TIER_PERFORMANCE,
	'pressable-premium-6': DISPLAY_TIER_PERFORMANCE,
	'pressable-premium-7': DISPLAY_TIER_PERFORMANCE,
	'pressable-premium-8': DISPLAY_TIER_PERFORMANCE,
	'pressable-premium-9': DISPLAY_TIER_PERFORMANCE,
	'pressable-premium-10': DISPLAY_TIER_PERFORMANCE,
	'pressable-premium-11': DISPLAY_TIER_PERFORMANCE,
};

/**
 * Proposed name for a plan, falling back to the catalog name for plans the
 * rename does not cover (the legacy lineup offered to pre-Signature agencies).
 */
export function getPressablePlanDisplayName( slug?: string, fallbackName = '' ) {
	return ( slug && DISPLAY_NAMES[ slug ] ) || fallbackName;
}

export function getPressableDisplayTier( slug?: string ) {
	return slug ? DISPLAY_TIERS[ slug ] : undefined;
}

export function isDisplayTier( slug: string | undefined, tier: PressableDisplayTier ) {
	return getPressableDisplayTier( slug ) === tier;
}
