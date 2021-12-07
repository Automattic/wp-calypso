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

	const couponDiscountRatio =
		billingTerm === TERM_ANNUALLY && jetpackSaleDiscountRatio
			? 1 - jetpackSaleDiscountRatio
			: 1 - INTRO_PRICING_DISCOUNT_PERCENTAGE / 100;
	const finalPrice = parseFloat(
		( ( discountedPrice ?? originalPrice ) * couponDiscountRatio ).toFixed( 2 )
	);
	const finalDiscount = ( ( originalPrice - finalPrice ) / originalPrice ) * 100;

	return {
		price: finalPrice,
		discount: finalDiscount,
	};
}
