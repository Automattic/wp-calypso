import { useShoppingCart } from '@automattic/shopping-cart';
import { useCallback, useState, useRef, useEffect } from 'react';
import { leaveCheckout } from 'calypso/my-sites/checkout/src/lib/leave-checkout';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useSelector } from 'calypso/state';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import useValidCheckoutBackUrl from './use-valid-checkout-back-url';
import type { RemoveProductFromCart, ResponseCart } from '@automattic/shopping-cart';

export default function useRemoveFromCartAndRedirect(
	siteSlug: string | undefined,
	createUserAndSiteBeforeTransaction: boolean,
	customizedPreviousPath?: string
): {
	isRemovingProductFromCart: boolean;
	removeProductFromCartAndMaybeRedirect: RemoveProductFromCart;
} {
	const previousPath = useSelector( getPreviousRoute );
	const cartKey = useCartKey();
	const { removeProductFromCart } = useShoppingCart( cartKey );

	// In some cases, the cloud.jetpack.com/pricing page sends a `checkoutBackUrl` url query param to checkout.
	const forceCheckoutBackUrl = useValidCheckoutBackUrl( siteSlug );

	const redirectDueToEmptyCart = useCallback( () => {
		leaveCheckout( {
			siteSlug,
			forceCheckoutBackUrl,
			createUserAndSiteBeforeTransaction,
			previousPath: customizedPreviousPath || previousPath,
			tracksEvent: 'calypso_empty_cart_redirect',
			userHasClearedCart: true,
		} );
	}, [
		createUserAndSiteBeforeTransaction,
		siteSlug,
		forceCheckoutBackUrl,
		previousPath,
		customizedPreviousPath,
	] );

	const isMounted = useRef( true );
	useEffect( () => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, [] );

	const [ isRemovingProductFromCart, setIsRemovingFromCart ] = useState< boolean >( false );
	const removeProductFromCartAndMaybeRedirect = useCallback(
		( uuid: string ) => {
			setIsRemovingFromCart( true );
			return removeProductFromCart( uuid )
				.then( ( cart: ResponseCart ) => {
					if ( cart.products.length === 0 ) {
						redirectDueToEmptyCart();
						// Don't turn off isRemovingProductFromCart if we are redirecting so that the loading page remains active.
						return cart;
					}
					isMounted.current && setIsRemovingFromCart( false );
					return cart;
				} )
				.catch( ( error ) => {
					isMounted.current && setIsRemovingFromCart( false );
					// Re-throw error so that the consumer of this action can treat it the same as removeProductFromCart
					throw error;
				} );
		},
		[ redirectDueToEmptyCart, removeProductFromCart ]
	);

	return {
		isRemovingProductFromCart,
		removeProductFromCartAndMaybeRedirect,
	};
}
