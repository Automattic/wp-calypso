/**
 * External dependencies
 */
import { useEffect, useRef, useState } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import type { RequestCartProduct } from './use-shopping-cart-manager/types';

const debug = debugFactory( 'calypso:composite-checkout:use-add-products-from-url' );

export type isPendingAddingProductsFromUrl = boolean;

export default function useAddProductsFromUrl( {
	isLoadingCart,
	isCartPendingUpdate,
	productsForCart,
	areCartProductsPreparing,
	couponCodeFromUrl,
	applyCoupon,
	addProductsToCart,
}: {
	isLoadingCart: boolean;
	isCartPendingUpdate: boolean;
	productsForCart: RequestCartProduct[];
	areCartProductsPreparing: boolean;
	couponCodeFromUrl: string | null | undefined;
	applyCoupon: ( couponId: string ) => void;
	addProductsToCart: ( products: RequestCartProduct[] ) => void;
} ): isPendingAddingProductsFromUrl {
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
			setIsLoading( false );
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

	// If we have made requests to update the cart, and the cart has finished
	// updating, mark this hook complete.
	useEffect( () => {
		if ( ! isLoading ) {
			return;
		}
		if ( ! hasRequestedInitialProducts.current ) {
			return;
		}
		if ( ! isCartPendingUpdate && ! isLoadingCart ) {
			debug( 'initial cart requests have been completed' );
			setIsLoading( false );
			return;
		}
	}, [ isLoading, isCartPendingUpdate, isLoadingCart ] );

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
		if ( productsForCart.length > 0 ) {
			addProductsToCart( productsForCart );
		}
		debug( 'adding initial coupon to cart', couponCodeFromUrl );
		if ( couponCodeFromUrl ) {
			applyCoupon( couponCodeFromUrl );
		}
		hasRequestedInitialProducts.current = true;
	}, [
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
