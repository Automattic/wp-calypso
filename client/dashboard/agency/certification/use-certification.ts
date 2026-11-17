import { activeAgencyQuery, agencyApwdDiscountCodeQuery } from '@automattic/api-queries';
import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { getIntlLocale } from '../../utils/locale';
import { ALL_TIERS } from '../tiers/constants';
import getCurrentAgencyTier from '../tiers/get-current-agency-tier';
import { BASE_DISCOUNT, PROMO_LAST_DAY, PROMO_MULTIPLIER } from './constants';
import { getCertificationShareMessage } from './share-message';
import type { AgencyTierId } from '@automattic/api-core';

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

	// A tier id this client doesn't know yet falls back to the first tier.
	const tierId = ( getCurrentAgencyTier( agency?.tier?.id ) ?? ALL_TIERS[ 0 ] ).id;

	const isPromo = isPromoRunning();
	const promoLastDay = new Date( `${ PROMO_LAST_DAY }T12:00:00Z` ).toLocaleDateString( locale, {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	} );

	// HubSpot leaves the property empty when it isn't set on the coupon. An active
	// coupon with no discount is a data error, so zero falls back to the tier's too.
	const couponDiscount = Number.parseFloat( coupon?.discount_percent ?? '' );
	const hasCouponDiscount = Number.isFinite( couponDiscount ) && couponDiscount > 0;

	const code = coupon?.code ?? '';
	const discount = hasCouponDiscount ? couponDiscount : getDiscount( tierId, isPromo );

	return {
		// Nothing to show unless the agency has an active coupon.
		isEligible: isApproved && !! code,
		isLoading,
		code,
		tierId,
		discount,
		isPromo,
		promoLastDay,
		shareMessage: getCertificationShareMessage( { code, discount, isPromo, promoLastDay } ),
	};
}
