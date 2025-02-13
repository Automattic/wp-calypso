import { isDIFMProduct, PLAN_100_YEARS } from '@automattic/calypso-products';
import { ResponseCartProduct } from '@automattic/shopping-cart';

export function useProductsAllowPremiumSupport( products: ResponseCartProduct[] ) {
	const productHasPremiumSupport = ( product: ResponseCartProduct ) => {
		switch ( true ) {
			case isDIFMProduct( product ):
			case PLAN_100_YEARS === product?.product_slug:
				return true;
			case product?.extra?.is_hundred_year_domain:
				return true;
			default:
				return false;
		}
	};

	return products?.some( ( product ) => productHasPremiumSupport( product ) );
}
