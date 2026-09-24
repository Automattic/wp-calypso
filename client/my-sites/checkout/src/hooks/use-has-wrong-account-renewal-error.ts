import { useHasLatchedCartError } from './use-has-latched-cart-error';
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * The cart error code returned when a renewal names a subscription that belongs
 * to another user. Must match the code sent by the shopping cart backend.
 */
export const WRONG_ACCOUNT_RENEWAL_ERROR_CODE = 'renewal-wrong-account';

/**
 * Whether the cart has rejected a renewal because it belongs to a different
 * WordPress.com account, which usually means the customer has more than one
 * account and followed a renewal link while signed in to the wrong one.
 */
export function useHasWrongAccountRenewalError( responseCart: ResponseCart ): boolean {
	return useHasLatchedCartError( responseCart, WRONG_ACCOUNT_RENEWAL_ERROR_CODE );
}
