import { useEffect, useState } from 'react';
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
 *
 * Regular cart errors are transient: they are returned only by the request that
 * caused them, so any later fetch of the cart (the cart refetches on window
 * focus) would drop this one and leave behind an empty cart with no explanation
 * of what went wrong. Once we have seen the error we therefore keep reporting
 * it for the rest of the page's life.
 */
export function useHasWrongAccountRenewalError( responseCart: ResponseCart ): boolean {
	const isInCurrentCart = ( responseCart.messages?.errors ?? [] ).some(
		( error ) => error.code === WRONG_ACCOUNT_RENEWAL_ERROR_CODE
	);
	const [ wasInAnyCart, setWasInAnyCart ] = useState( false );
	useEffect( () => {
		if ( isInCurrentCart ) {
			setWasInAnyCart( true );
		}
	}, [ isInCurrentCart ] );
	return isInCurrentCart || wasInAnyCart;
}
