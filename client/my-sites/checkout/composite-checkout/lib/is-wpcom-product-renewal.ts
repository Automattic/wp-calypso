/**
 * External dependencies
 */
import type { ResponseCartProduct } from '@automattic/shopping-cart';

export default function isWpComProductRenewal( product: ResponseCartProduct ): boolean {
	return product?.extra?.purchaseType === 'renewal';
}
