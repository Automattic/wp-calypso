import { activeAgencyQuery, agencyApwdDiscountCodeQuery } from '@automattic/api-queries';
import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { getIntlLocale } from '../../utils/locale';
import { BASE_DISCOUNT, PROMO_LAST_DAY, PROMO_MULTIPLIER, TIER_ORDER } from './constants';
import type { AgencyTierId } from '@automattic/api-core';

function readSearchParam( name: string ) {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	return new URLSearchParams( window.location.search ).get( name );
}

function isPromoRunning() {
	return new Date().toISOString().slice( 0, 10 ) <= PROMO_LAST_DAY;
}

export function getDiscount( tierId: AgencyTierId, isPromo: boolean ) {
	return BASE_DISCOUNT[ tierId ] * ( isPromo ? PROMO_MULTIPLIER : 1 );
}

export function useCertification() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	// Not the dashboard's useIntlLocale(): it needs the dashboard's AuthProvider,
	// and classic A4A renders these cards too.
	const locale = getIntlLocale( useLocale() );

	const approvalStatus = agency?.approval_status;
	// Agencies predating the field report an empty string and are treated as approved.
	const isApproved = !! agency && ( approvalStatus === 'approved' || approvalStatus === '' );

	const { data: coupon, isLoading } = useQuery( {
		...agencyApwdDiscountCodeQuery( agency?.id ?? 0 ),
		enabled: isApproved,
	} );

	// Review switch to see another tier's discount on the same agency.
	const tierOverride = readSearchParam( 'certtier' ) as AgencyTierId | null;
	const tierId: AgencyTierId =
		tierOverride && TIER_ORDER.includes( tierOverride )
			? tierOverride
			: ( agency?.tier?.id ?? 'emerging-partner' );

	const isPromo = isPromoRunning();
	const promoLastDay = new Date( `${ PROMO_LAST_DAY }T12:00:00Z` ).toLocaleDateString( locale, {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	} );

	// HubSpot leaves the property empty when it isn't set on the coupon.
	const couponDiscount = Number.parseFloat( coupon?.discount_percent ?? '' );

	return {
		// Nothing to show unless the agency has an active coupon.
		isEligible: isApproved && !! coupon?.code,
		isLoading,
		code: coupon?.code ?? '',
		tierId,
		discount: Number.isFinite( couponDiscount ) ? couponDiscount : getDiscount( tierId, isPromo ),
		isPromo,
		promoLastDay,
	};
}
