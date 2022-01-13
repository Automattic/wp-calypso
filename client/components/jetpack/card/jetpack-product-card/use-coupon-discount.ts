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

	if ( ! originalPrice ) {
		return {};
	}

	// add the intro discount and any Jetpack sale together
	const couponDiscountRatio =
		( billingTerm === TERM_ANNUALLY ? INTRO_PRICING_DISCOUNT_PERCENTAGE / 100 : 0 ) +
		jetpackSaleDiscountRatio;

	const finalPrice =
		couponDiscountRatio > 0
			? Math.floor( ( originalPrice ?? discountedPrice ) * ( 1 - couponDiscountRatio ) * 100 ) / 100
			: originalPrice ?? discountedPrice;

	const finalDiscount =
		couponDiscountRatio > 0
			? Math.floor( ( ( originalPrice - finalPrice ) / originalPrice ) * 100 )
			: 0;

	return {
		price: finalPrice,
		discount: finalDiscount,
	};
}
