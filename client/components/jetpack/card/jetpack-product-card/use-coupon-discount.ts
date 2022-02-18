import { useSelector } from 'react-redux';
import { getJetpackSaleCouponDiscountRatio } from 'calypso/state/marketing/selectors';

export default function useCouponDiscount(
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

	const finalPrice =
		Math.floor( ( discountedPrice ?? originalPrice ) * ( 1 - jetpackSaleDiscountRatio ) * 100 ) /
		100;

	const finalDiscount = Math.floor( ( ( originalPrice - finalPrice ) / originalPrice ) * 100 );

	const hasDiscount = finalPrice < originalPrice;

	return {
		price: hasDiscount ? finalPrice : discountedPrice ?? originalPrice,
		discount: hasDiscount ? finalDiscount : 0,
	};
}
