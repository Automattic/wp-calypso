import {
	RequestCartProduct,
	ApplyCouponToCart,
	AddProductsToCart,
	useShoppingCart,
} from '@automattic/shopping-cart';
import debugFactory from 'debug';
import { useEffect, useRef, useState } from 'react';
import useCartKey from '../../use-cart-key';

const debug = debugFactory( 'calypso:use-add-products-from-url' );

export type IsPendingAddingProductsFromUrl = boolean;

/**
 * Product requests can be sent to checkout using various methods including URL
 * or localStorage. Those requests are turned into `RequestCartProduct` objects
 * by `usePrepareProductsForCart()` and then they are added to the cart by this
 * hook.
 *
 * This hook will return true when its adding process is complete or if there is
 * nothing to add.
 */
export default function useAddProductsFromUrl( {
	isLoadingCart,
	isCartPendingUpdate,
	productsForCart,
	areCartProductsPreparing,
	couponCodeFromUrl,
	applyCoupon,
	addProductsToCart,
	addingRenewals,
}: {
	isLoadingCart: boolean;
	isCartPendingUpdate: boolean;
	productsForCart: RequestCartProduct[];
	areCartProductsPreparing: boolean;
	couponCodeFromUrl: string | null | undefined;
	applyCoupon: ApplyCouponToCart;
	addProductsToCart: AddProductsToCart;
	addingRenewals: boolean;
} ): IsPendingAddingProductsFromUrl {
	const cartKey = useCartKey();
	const { updateLocation, replaceProductsInCart } = useShoppingCart( cartKey );
	const isMounted = useRef( true );
	useEffect( () => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, [] );
	const [ isLoading, setIsLoading ] = useState< boolean >( true );
	const hasRequestedInitialProducts = useRef< boolean >( false );

	// If there are no products to add, no coupon to add, and nothing is loading,
	// then mark this hook complete (it has nothing to do).
	useEffect( () => {
		if ( ! isLoading ) {
			return;
		}
		if (
			! areCartProductsPreparing &&
			productsForCart.length === 0 &&
			! couponCodeFromUrl &&
			! isLoadingCart &&
			! isCartPendingUpdate
		) {
			debug( 'no products or coupons to add; skipping initial cart requests' );
			isMounted.current && setIsLoading( false );
			return;
		}
	}, [
		isLoading,
		isCartPendingUpdate,
		isLoadingCart,
		areCartProductsPreparing,
		productsForCart.length,
		couponCodeFromUrl,
	] );

	// If we have products or a coupon to add, and we have not requested they be
	// added, and nothing is loading, request that the shopping cart add those
	// products.
	useEffect( () => {
		if ( ! isLoading ) {
			return;
		}
		if ( areCartProductsPreparing || isLoadingCart || hasRequestedInitialProducts.current ) {
			return;
		}
		debug( 'adding initial products to cart', productsForCart );
		const cartPromises = [];
		if ( addingRenewals && productsForCart.length === 0 ) {
			// Clear the cart if a renewal was requested but there are no valid
			// renewals prepared. This is because if a renewal was requested by URL
			// and was invalid, we don't want them to see what may have been in their
			// cart previously to avoid the appearance that the URL succeeded.
			debug( 'clearing the cart due to a renewal request with no products' );
			cartPromises.push( replaceProductsInCart( [] ) );
		}
		if ( productsForCart.length > 0 ) {
			// When this hook adds products to the cart, we have just loaded checkout
			// and we haven't yet confirmed the user's tax details. The cart may
			// already have those details but there's at least a moderate chance that
			// they could change when we get to the next step of the checkout
			// process. Since calculating taxes is a very slow process for the cart,
			// and that calculation requires tax details, here we clear the tax
			// details in the cart to prevent calculating taxes until the user or
			// autocomplete confirms those details.
			cartPromises.push( updateLocation( { countryCode: '' } ) );

			cartPromises.push( addProductsToCart( productsForCart ) );
		}
		debug( 'adding initial coupon to cart', couponCodeFromUrl );
		if ( couponCodeFromUrl ) {
			cartPromises.push( applyCoupon( couponCodeFromUrl ) );
		}
		Promise.allSettled( cartPromises )
			.then( () => {
				debug( 'initial cart requests have completed' );
				isMounted.current && setIsLoading( false );
			} )
			.catch( () => {
				debug( 'initial cart requests have failed' );
				isMounted.current && setIsLoading( false );
			} );
		hasRequestedInitialProducts.current = true;
	}, [
		replaceProductsInCart,
		addingRenewals,
		updateLocation,
		isLoading,
		areCartProductsPreparing,
		isLoadingCart,
		couponCodeFromUrl,
		applyCoupon,
		productsForCart,
		addProductsToCart,
	] );

	debug( 'useAddProductsFromUrl isLoading', isLoading );
	return isLoading;
}
