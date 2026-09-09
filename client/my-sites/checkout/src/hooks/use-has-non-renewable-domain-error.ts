import { useHasLatchedCartError } from './use-has-latched-cart-error';
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * The cart error code returned when a domain renewal arrives after both the
 * renewal and the redemption period have ended. Must match the code sent by the
 * shopping cart backend.
 */
export const NON_RENEWABLE_DOMAIN_ERROR_CODE = 'renewal-domain-not-renewable';

/**
 * Whether the cart has rejected a domain renewal because the domain is out of
 * time: it is past its renewal period and past its redemption period, so there
 * is no longer anything to renew.
 */
export function useHasNonRenewableDomainError( responseCart: ResponseCart ): boolean {
	return useHasLatchedCartError( responseCart, NON_RENEWABLE_DOMAIN_ERROR_CODE );
}
