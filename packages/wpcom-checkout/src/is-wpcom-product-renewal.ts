/**
 * External dependencies
 */
import type { ResponseCartProduct } from '@automattic/shopping-cart';

export function isWpComProductRenewal( product: ResponseCartProduct ): boolean {
	return product?.extra?.purchaseType === 'renewal';
}
