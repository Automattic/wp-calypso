import { PLAN_100_YEARS, WPCOM_DIFM_LITE } from '@automattic/calypso-products';
import { ResponseCartProduct } from '@automattic/shopping-cart';

export function useProductsAllowPremiumSupport( products: ResponseCartProduct[] ) {
	const productHasPremiumSupport = ( product: ResponseCartProduct ) => {
		switch ( true ) {
			case [ PLAN_100_YEARS, WPCOM_DIFM_LITE ].includes( product?.product_slug ):
				return true;
			case product?.extra?.is_hundred_year_domain:
				return true;
			default:
				return false;
		}
	};

	return products?.some( ( product ) => productHasPremiumSupport( product ) );
}
