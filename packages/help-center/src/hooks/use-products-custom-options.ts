import { isDIFMProduct } from '@automattic/calypso-products';
import { ResponseCartProduct } from '@automattic/shopping-cart';

// We want to give the Help Center custom options based on the products in the cart ( the flow in which the user is in )
export function useProductsCustomOptions( products: ResponseCartProduct[] ) {
	for ( const product of products ) {
		if ( isDIFMProduct( product ) ) {
			return {
				hideBackButton: true,
			};
		}
	}

	return null;
}
