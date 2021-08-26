import { ResponseCartProduct } from '@automattic/shopping-cart';

export function isRenewal( cartItem: ResponseCartProduct ): boolean {
	return cartItem.extra.purchaseType === 'renewal';
}
