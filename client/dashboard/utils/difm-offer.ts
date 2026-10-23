import { DIFM_OFFER_ARMS, DotcomPlans } from '@automattic/api-core';
import config from '@automattic/calypso-config';
import { englishLocales } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import { useExperiment } from 'calypso/lib/explat';
import type { DifmOfferBuildRequestVariation } from '@automattic/api-core';

/**
 * Registered on the calypso platform. The Site Setup banner in jetpack-mu-wpcom
 * assigns the same experiment on the server, so a user gets one variation on every surface.
 */
export const DIFM_OFFER_EXPERIMENT = 'calypso_difm_free_with_upgrade_wpadmin_202610_v1';

/**
 * A QA flag that puts an eligible user in `DIFM_OFFER_FORCED_ARM` without an ExPlat assignment.
 * Every config file sets it to false. Turn it on with `?flags=difm-offer/force-treatment`,
 * which Calypso honours only for Automatticians, so real users cannot turn it on.
 */
export const DIFM_OFFER_FORCE_TREATMENT_FLAG = 'difm-offer/force-treatment';

/**
 * The oldest site, in days, that still gets the offer. The Site Setup banner in
 * jetpack-mu-wpcom uses the same limit.
 */
export const DIFM_OFFER_MAX_SITE_AGE_DAYS = 14;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * One of the experiment's copy arms. Each arm shows the offer with its own copy, and
 * `control` shows no offer.
 */
export type DifmOfferArm = DifmOfferBuildRequestVariation;

export type DifmOfferVariation = 'control' | DifmOfferArm;

/**
 * The arm that the QA flag forces.
 */
export const DIFM_OFFER_FORCED_ARM: DifmOfferArm = 'no_time_to_build';

export interface DifmOfferEligibilityInput {
	planSlug?: string;
	siteCreatedAt?: string;
	localeSlug?: string;
	/**
	 * An agency builds an A4A dev site for a client, so the offer does not apply. Only an
	 * explicit `false` is eligible. The key is required so that a caller cannot leave it out
	 * by mistake; pass the site's value even while it is still `undefined`. Agency-managed
	 * Atomic sites need no check: Atomic requires a Business plan or higher, which is
	 * already ineligible.
	 */
	isA4ADevSite: boolean | undefined;
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
	return DIFM_OFFER_ARMS.find( ( arm ) => arm === variationName ) ?? 'control';
}

const ELIGIBLE_PLAN_SLUGS = new Set< string >( [
	DotcomPlans.FREE_PLAN,
	DotcomPlans.PERSONAL_MONTHLY,
	DotcomPlans.PERSONAL_TRIAL_MONTHLY,
	DotcomPlans.PERSONAL,
	DotcomPlans.PERSONAL_2_YEARS,
	DotcomPlans.PERSONAL_3_YEARS,
	DotcomPlans.PREMIUM_MONTHLY,
	DotcomPlans.PREMIUM,
	DotcomPlans.PREMIUM_2_YEARS,
	DotcomPlans.PREMIUM_3_YEARS,
] );

function isEligiblePlan( planSlug: string ): boolean {
	return ELIGIBLE_PLAN_SLUGS.has( planSlug );
}

// Site models can hand back a space-separated `YYYY-MM-DD HH:MM:SS` (GMT) string
// that not every engine parses, and that the native parser would read as local
// time. Rewrite that shape to explicit ISO 8601 UTC; pass ISO 8601 inputs through.
export function normalizeCreatedAt( siteCreatedAt: string ): string {
	const wpDate = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$/.exec( siteCreatedAt );
	return wpDate ? `${ wpDate[ 1 ] }T${ wpDate[ 2 ] }Z` : siteCreatedAt;
}

function parseSiteCreatedAt( siteCreatedAt: string ): number {
	return Date.parse( normalizeCreatedAt( siteCreatedAt ) );
}

function isRecentSite( siteCreatedAt: string, now: number ): boolean {
	const createdAt = parseSiteCreatedAt( siteCreatedAt );
	if ( Number.isNaN( createdAt ) ) {
		return false;
	}

	// No lower bound: the server never emits a future created_at, and omitting it
	// avoids rejecting a just-created site when the browser clock lags the server.
	return now - createdAt <= DIFM_OFFER_MAX_SITE_AGE_DAYS * MS_PER_DAY;
}

function isEnglishLocale( localeSlug: string ): boolean {
	return englishLocales.includes( localeSlug );
}

export function isEligibleForDifmOffer(
	{ planSlug, siteCreatedAt, localeSlug, isA4ADevSite }: DifmOfferEligibilityInput,
	now: number = Date.now()
): boolean {
	if ( ! planSlug || ! siteCreatedAt || ! localeSlug || isA4ADevSite !== false ) {
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
	const isForcedTreatment = isEligible && config.isEnabled( DIFM_OFFER_FORCE_TREATMENT_FLAG );

	// Always call the hook. Keep ineligible users and forced testers out of the experiment.
	const [ isLoading, experimentAssignment ] = useExperiment( DIFM_OFFER_EXPERIMENT, {
		isEligible: isEligible && ! isForcedTreatment,
	} );

	if ( ! isEligible ) {
		return { isEligible, isLoading: false, variation: 'control' };
	}

	if ( isForcedTreatment ) {
		return { isEligible, isLoading: false, variation: DIFM_OFFER_FORCED_ARM };
	}

	return {
		isEligible,
		isLoading,
		variation: normalizeDifmOfferVariation( experimentAssignment?.variationName ),
	};
}

export interface DifmOfferCopy {
	title: string;
	description: string;
	ctaText: string;
}

/**
 * Banner copy for each arm, from the Figma copy variations. Every placement renders this
 * copy with its own surface's components. `control` gets no banner.
 */
export function getDifmOfferCopy( variation: DifmOfferVariation ): DifmOfferCopy | null {
	const ctaText = __( 'See the offer' );

	switch ( variation ) {
		case 'expert_help':
			return {
				title: __( 'Expert help to get you started' ),
				description: __( 'A human builds your site based on your needs — free with Business.' ),
				ctaText,
			};
		case 'no_time_to_build':
			return {
				title: __( 'No time to build your site?' ),
				description: __(
					'Let us take that off your plate. Ready in 4 days and free with Business.'
				),
				ctaText,
			};
		case 'skip_the_setup':
			return {
				title: __( 'Skip the setup' ),
				description: __(
					'For a limited time, our experts will bring your vision to life. Free with Business.'
				),
				ctaText,
			};
		default:
			return null;
	}
}
