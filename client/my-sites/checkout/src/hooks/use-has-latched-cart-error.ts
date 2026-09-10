import { useEffect, useState } from 'react';
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * Whether the cart has reported `errorCode` at any point since this page
 * loaded.
 *
 * Regular cart errors are transient: they are returned only by the request that
 * caused them, so any later fetch of the cart (the cart refetches on window
 * focus) would drop the error and leave behind an empty cart with no
 * explanation of what went wrong. An error that checkout answers with a screen
 * of its own therefore has to be latched: once we have seen the code we keep
 * reporting it for the rest of the page's life.
 */
export function useHasLatchedCartError( responseCart: ResponseCart, errorCode: string ): boolean {
	const isInCurrentCart = ( responseCart.messages?.errors ?? [] ).some(
		( error ) => error.code === errorCode
	);
	const [ wasInAnyCart, setWasInAnyCart ] = useState( false );
	useEffect( () => {
		if ( isInCurrentCart ) {
			setWasInAnyCart( true );
		}
	}, [ isInCurrentCart ] );
	return isInCurrentCart || wasInAnyCart;
}
