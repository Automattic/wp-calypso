import { TERM_ANNUALLY } from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import { INTRO_PRICING_DISCOUNT_PERCENTAGE } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { getJetpackSaleCouponDiscountRatio } from 'calypso/state/marketing/selectors';
import type { Duration } from 'calypso/my-sites/plans/jetpack-plans/types';

export default function useCouponDiscount(
	billingTerm: Duration,
	originalPrice?: number,
	discountedPrice?: number
): {
	price?: number;
	discount?: number;
} {
	const jetpackSaleDiscountRatio = useSelector( getJetpackSaleCouponDiscountRatio );
	const introDiscountRatio =
		billingTerm === TERM_ANNUALLY ? INTRO_PRICING_DISCOUNT_PERCENTAGE / 100 : 0;

	if ( ! originalPrice ) {
		return {};
	}

	const finalPrice =
		Math.floor(
			( discountedPrice ?? originalPrice ) *
				( 1 - jetpackSaleDiscountRatio ) *
				( 1 - introDiscountRatio ) *
				100
		) / 100;

	const finalDiscount = Math.floor( ( ( originalPrice - finalPrice ) / originalPrice ) * 100 );

	const hasDiscount = jetpackSaleDiscountRatio > 0 || introDiscountRatio > 0;

	return {
		price: hasDiscount ? finalPrice : discountedPrice ?? originalPrice,
		discount: hasDiscount ? finalDiscount : 0,
	};
}
