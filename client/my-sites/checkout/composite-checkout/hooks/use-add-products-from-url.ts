import debugFactory from 'debug';
import { useEffect, useRef, useState } from 'react';
import type {
	RequestCartProduct,
	ApplyCouponToCart,
	AddProductsToCart,
	ReplaceProductsInCart,
} from '@automattic/shopping-cart';

const debug = debugFactory( 'calypso:composite-checkout:use-add-products-from-url' );

export type isPendingAddingProductsFromUrl = boolean;

export default function useAddProductsFromUrl( {
	isLoadingCart,
	isCartPendingUpdate,
	isJetpackSitelessCheckout,
	productsForCart,
	areCartProductsPreparing,
	couponCodeFromUrl,
	applyCoupon,
	addProductsToCart,
	replaceProductsInCart,
}: {
	isLoadingCart: boolean;
	isCartPendingUpdate: boolean;
	isJetpackSitelessCheckout: boolean;
	productsForCart: RequestCartProduct[];
	areCartProductsPreparing: boolean;
	couponCodeFromUrl: string | null | undefined;
	applyCoupon: ApplyCouponToCart;
	addProductsToCart: AddProductsToCart;
	replaceProductsInCart: ReplaceProductsInCart;
} ): isPendingAddingProductsFromUrl {
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
		if ( productsForCart.length > 0 ) {
			// The siteless checkout backend cannot handle multiple product checkout yet,
			// so therefore we only want one product in the cart (The most recently selected).
			if ( isJetpackSitelessCheckout ) {
				debug(
					'siteless checkout: replacing the cart with the most recently selected product',
					productsForCart[ productsForCart.length - 1 ]
				);
				cartPromises.push(
					replaceProductsInCart( [ productsForCart[ productsForCart.length - 1 ] ] )
				);
			} else {
				cartPromises.push( addProductsToCart( productsForCart ) );
			}
		}
		debug( 'adding initial coupon to cart', couponCodeFromUrl );
		if ( couponCodeFromUrl ) {
			cartPromises.push( applyCoupon( couponCodeFromUrl ) );
		}
		Promise.allSettled( cartPromises ).then( () => {
			debug( 'initial cart requests have completed' );
			isMounted.current && setIsLoading( false );
		} );
		hasRequestedInitialProducts.current = true;
	}, [
		isLoading,
		areCartProductsPreparing,
		isLoadingCart,
		couponCodeFromUrl,
		applyCoupon,
		productsForCart,
		addProductsToCart,
		isJetpackSitelessCheckout,
		replaceProductsInCart,
	] );

	debug( 'useAddProductsFromUrl isLoading', isLoading );
	return isLoading;
}
