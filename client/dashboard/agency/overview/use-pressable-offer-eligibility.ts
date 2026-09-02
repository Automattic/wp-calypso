import {
	JetpackLicenseFilter,
	JetpackLicenseSortDirection,
	JetpackLicenseSortField,
} from '@automattic/api-core';
import { jetpackAgencyLicensesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { PRESSABLE_Q3_2026_OFFER_ENDS_AT, PRESSABLE_Q3_2026_OFFER_START_DATE } from './constants';
import type { Agency, JetpackLicense } from '@automattic/api-core';

// The offer only covers moves up within the Signature and Premium tiers, the
// same plans the checkout coupon is built from. The trailing hyphen keeps the
// legacy bare 'pressable-premium' plan out.
const EXPANSION_OFFER_PLAN_PREFIXES = [ 'pressable-signature-', 'pressable-premium-' ];

export function getAgencyPlanLicenses( licenses: JetpackLicense[] = [] ): JetpackLicense[] {
	return licenses.filter(
		( license ) =>
			( license.license_key.startsWith( 'pressable-' ) ||
				license.license_key.startsWith( 'jetpack-pressable' ) ) &&
			! license.license_key.startsWith( 'pressable-addon' ) &&
			! license.referral
	);
}

// The introductory offer applies automatically to plans purchased after its
// start date, so an agency whose earliest plan license was issued on or after
// that date has benefited from it (or is a new customer who bought outside the
// offer window). Returns null when no plan license is found.
export function hasBenefitedFromIntroductoryOffer( licenses: JetpackLicense[] ): boolean | null {
	const planLicenses = getAgencyPlanLicenses( licenses );

	if ( ! planLicenses.length ) {
		return null;
	}

	const earliestLicense = planLicenses.reduce( ( earliest, license ) =>
		license.issued_at < earliest.issued_at ? license : earliest
	);

	return earliestLicense.issued_at.slice( 0, 10 ) >= PRESSABLE_Q3_2026_OFFER_START_DATE;
}

// An agency on a legacy plan has no upgrade path the offer applies to, so the
// discount would never materialize at checkout.
export function hasPlanEligibleForExpansionOffer( licenses: JetpackLicense[] ): boolean {
	return getAgencyPlanLicenses( licenses ).some( ( license ) =>
		EXPANSION_OFFER_PLAN_PREFIXES.some( ( prefix ) => license.license_key.startsWith( prefix ) )
	);
}

/**
 * The dashboard's port of the classic app's Pressable Q3 2026 offer
 * eligibility (client/a8c-for-agencies/components/a4a-pressable-offer): the
 * introductory offer targets agencies without a Pressable plan through the A4A
 * marketplace, the expansion offer agencies with one that did not benefit from
 * the introductory offer. The license check behind the expansion offer only
 * fires for agencies that pass the cheaper plan-ownership check.
 */
export default function usePressableOfferEligibility( agency: Agency | null | undefined ) {
	const pressable = agency?.third_party?.pressable;
	// A regular Pressable plan (not bought through the A4A marketplace) has a null A4A id.
	const ownsPressableThroughA4A = !! pressable?.pressable_id && pressable?.a4a_id !== null;
	const isBillingDragonAgency = agency?.billing_system === 'billingdragon';
	// Once the offer ends the cards can never render, so don't pay for the
	// license fetch either.
	const isOfferActive = new Date() < new Date( PRESSABLE_Q3_2026_OFFER_ENDS_AT );
	const mayBeEligibleForExpansionOffer =
		isOfferActive && isBillingDragonAgency && ownsPressableThroughA4A;

	const { data: licenses, isFetched } = useQuery( {
		...jetpackAgencyLicensesQuery( agency?.id ?? 0, {
			filter: JetpackLicenseFilter.NotRevoked,
			search: 'pressable',
			sortField: JetpackLicenseSortField.IssuedAt,
			sortDirection: JetpackLicenseSortDirection.Ascending,
		} ),
		enabled: !! agency?.id && mayBeEligibleForExpansionOffer,
		refetchOnWindowFocus: false,
	} );

	return {
		isEligibleForPressableIntroOffer: isBillingDragonAgency && ! ownsPressableThroughA4A,
		// Unknown history (query pending, or no plan license found) counts as
		// ineligible so the offer stays hidden.
		isEligibleForPressableExpansionOffer:
			mayBeEligibleForExpansionOffer &&
			isFetched &&
			hasPlanEligibleForExpansionOffer( licenses ?? [] ) &&
			hasBenefitedFromIntroductoryOffer( licenses ?? [] ) === false,
	};
}
