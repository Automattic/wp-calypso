import { isFreePlan, isPersonalPlan, isPremiumPlan } from '@automattic/calypso-products';
import { useExperiment } from 'calypso/lib/explat';

/**
 * Placeholder name until DATSCI-1787 names the experiment. ExPlat returns no
 * assignment for an unregistered experiment, so every caller gets `control`.
 */
export const DIFM_OFFER_EXPERIMENT = 'wpcom_difm_post_signup_offer_placeholder';

/**
 * The upper bound on site age is an open question for product and data.
 */
export const DIFM_OFFER_MAX_SITE_AGE_DAYS = 7;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Placeholder variations for copy angles A, B and C.
 */
export type DifmOfferVariation = 'control' | 'skip_setup' | 'expert_help' | 'no_time';

export interface DifmOfferEligibilityInput {
	planSlug?: string;
	siteCreatedAt?: string;
	localeSlug?: string;
}

export interface DifmOfferResult {
	isEligible: boolean;
	isLoading: boolean;
	variation: DifmOfferVariation;
}

/**
 * Map an ExPlat variation name onto a known variation. Anything unrecognized (including
 * null/undefined for an unassigned or not-yet-loaded user) is treated as `control`,
 * so an absent or misconfigured experiment degrades to today's default behavior.
 */
export function normalizeDifmOfferVariation(
	variationName: string | null | undefined
): DifmOfferVariation {
	switch ( variationName ) {
		case 'skip_setup':
			return 'skip_setup';
		case 'expert_help':
			return 'expert_help';
		case 'no_time':
			return 'no_time';
		default:
			return 'control';
	}
}

function isEligiblePlan( planSlug: string ): boolean {
	return isFreePlan( planSlug ) || isPersonalPlan( planSlug ) || isPremiumPlan( planSlug );
}

function isRecentSite( siteCreatedAt: string, now: number ): boolean {
	const createdAt = Date.parse( siteCreatedAt );
	if ( Number.isNaN( createdAt ) ) {
		return false;
	}

	const ageMs = now - createdAt;
	return ageMs >= 0 && ageMs <= DIFM_OFFER_MAX_SITE_AGE_DAYS * MS_PER_DAY;
}

function isEnglishLocale( localeSlug: string ): boolean {
	return localeSlug === 'en' || localeSlug.startsWith( 'en-' );
}

export function isEligibleForDifmOffer(
	{ planSlug, siteCreatedAt, localeSlug }: DifmOfferEligibilityInput,
	now: number = Date.now()
): boolean {
	if ( ! planSlug || ! siteCreatedAt || ! localeSlug ) {
		return false;
	}

	return (
		isEligiblePlan( planSlug ) &&
		isRecentSite( siteCreatedAt, now ) &&
		isEnglishLocale( localeSlug )
	);
}

/**
 * Takes plain values rather than a site object so that callers holding either the
 * redux site model or the api-core site model can use it.
 */
export function useDifmOffer( input: DifmOfferEligibilityInput ): DifmOfferResult {
	const isEligible = isEligibleForDifmOffer( input );

	// Always call the hook, and let `isEligible` keep ineligible users out of the experiment.
	const [ isLoading, experimentAssignment ] = useExperiment( DIFM_OFFER_EXPERIMENT, {
		isEligible,
	} );

	if ( ! isEligible ) {
		return { isEligible, isLoading: false, variation: 'control' };
	}

	return {
		isEligible,
		isLoading,
		variation: normalizeDifmOfferVariation( experimentAssignment?.variationName ),
	};
}
