import { isPressablePlanLicense } from './pressable-products';
import type { JetpackLicense } from '@automattic/api-core';

export const PRESSABLE_Q3_2026_OFFER_START_DATE = '2026-08-11';
export const PRESSABLE_Q3_2026_OFFER_DEADLINE = new Date( '2026-09-30T23:59:59.999Z' );

export const PRESSABLE_INTRODUCTORY_OFFER_TERMS_URL =
	'https://pressable.com/legal/late-summer-promotion-terms-and-conditions/';
export const PRESSABLE_EXPANSION_OFFER_TERMS_URL =
	'https://pressable.com/legal/summer-2026-expansion-incentive-terms-and-conditions/';

// The expansion offer only covers moves up within the Signature and Premium
// tiers. The trailing hyphen keeps the legacy bare 'pressable-premium' plan out.
const EXPANSION_OFFER_PLAN_PREFIXES = [ 'pressable-signature-', 'pressable-premium-' ];

export const isOfferWindowOpen = () => new Date() <= PRESSABLE_Q3_2026_OFFER_DEADLINE;

// The introductory offer applies automatically to plans bought after its start
// date, so an agency whose earliest plan license is that recent has already
// benefited from it. Null when the agency has no plan license.
export function hasBenefitedFromIntroductoryOffer( licenses: JetpackLicense[] ): boolean | null {
	const planLicenses = licenses.filter( isPressablePlanLicense );
	if ( planLicenses.length === 0 ) {
		return null;
	}
	const earliest = planLicenses.reduce( ( result, license ) =>
		license.issued_at < result.issued_at ? license : result
	);
	return earliest.issued_at.slice( 0, 10 ) >= PRESSABLE_Q3_2026_OFFER_START_DATE;
}

export const hasPlanEligibleForExpansionOffer = ( licenses: JetpackLicense[] ) =>
	licenses
		.filter( isPressablePlanLicense )
		.some( ( license ) =>
			EXPANSION_OFFER_PLAN_PREFIXES.some( ( prefix ) => license.license_key.startsWith( prefix ) )
		);
