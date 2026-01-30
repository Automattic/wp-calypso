import type { ResponseCartProduct } from '@automattic/shopping-cart';

/**
 * @param product Product to check.
 * @returns boolean indicating whether the product is an A4A siteless checkout product.
 */
export function isA4ASitelessCheckoutProduct( product: ResponseCartProduct ): boolean {
	return Boolean( product?.extra?.isA4ASitelessCheckout );
}
