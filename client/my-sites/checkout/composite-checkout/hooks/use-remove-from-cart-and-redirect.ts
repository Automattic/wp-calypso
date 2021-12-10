import { useShoppingCart } from '@automattic/shopping-cart';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { leaveCheckout } from 'calypso/my-sites/checkout/composite-checkout/lib/leave-checkout';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import getPreviousPath from 'calypso/state/selectors/get-previous-path';
import useValidCheckoutBackUrl from './use-valid-checkout-back-url';
import type { RemoveProductFromCart, ResponseCart } from '@automattic/shopping-cart';

export default function useRemoveFromCartAndRedirect(
	siteSlug: string | undefined,
	createUserAndSiteBeforeTransaction: boolean
): {
	isRemovingProductFromCart: boolean;
	removeProductFromCartAndMaybeRedirect: RemoveProductFromCart;
} {
	const previousPath = useSelector( getPreviousPath );
	const dispatch = useDispatch();
	const cartKey = useCartKey();
	const { removeProductFromCart } = useShoppingCart( cartKey );

	// In some cases, the cloud.jetpack.com/pricing page sends a `checkoutBackUrl` url query param to checkout.
	const jetpackCheckoutBackUrl = useValidCheckoutBackUrl( siteSlug );

	const redirectDueToEmptyCart = useCallback( () => {
		leaveCheckout( {
			siteSlug,
			jetpackCheckoutBackUrl,
			createUserAndSiteBeforeTransaction,
			previousPath,
			dispatch,
		} );
	}, [
		createUserAndSiteBeforeTransaction,
		siteSlug,
		jetpackCheckoutBackUrl,
		previousPath,
		dispatch,
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
			return removeProductFromCart( uuid ).then( ( cart: ResponseCart ) => {
				if ( cart.products.length === 0 ) {
					redirectDueToEmptyCart();
					// Don't turn off isRemovingProductFromCart if we are redirecting so that the loading page remains active.
					return cart;
				}
				isMounted.current && setIsRemovingFromCart( false );
				return cart;
			} );
		},
		[ redirectDueToEmptyCart, removeProductFromCart ]
	);

	return {
		isRemovingProductFromCart,
		removeProductFromCartAndMaybeRedirect,
	};
}
