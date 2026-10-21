import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useIntlLocale } from '../../app/locale';
import {
	BASE_DISCOUNT,
	PROMO_LAST_DAY,
	PROMO_MULTIPLIER,
	TIER_ORDER,
	getCertificationCode,
} from './constants';
import type { AgencyTierId } from '@automattic/api-core';

function readSearchParam( name: string ) {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	return new URLSearchParams( window.location.search ).get( name );
}

function isPromoRunning() {
	// Review switch for the state after the promotion ends on April 1, 2027.
	if ( readSearchParam( 'certpromo' ) === 'ended' ) {
		return false;
	}
	return new Date().toISOString().slice( 0, 10 ) <= PROMO_LAST_DAY;
}

export function getDiscount( tierId: AgencyTierId, isPromo: boolean ) {
	return BASE_DISCOUNT[ tierId ] * ( isPromo ? PROMO_MULTIPLIER : 1 );
}

export function useCertification() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const locale = useIntlLocale();

	const approvalStatus = agency?.approval_status;
	// Agencies predating the field report an empty string and are treated as approved.
	const isEligible = !! agency && ( approvalStatus === 'approved' || approvalStatus === '' );

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

	return {
		isEligible,
		code: agency ? getCertificationCode( agency.id ) : '',
		tierId,
		discount: getDiscount( tierId, isPromo ),
		isPromo,
		promoLastDay,
	};
}
