/**
 * External dependencies
 */
import { useEffect, useRef, useState } from 'react';

/**
 * Internal dependencies
 */
import type { RequestCartProduct } from '../types/backend/shopping-cart-endpoint';

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

	useEffect( () => {
		if ( ! isCartPendingUpdate && ! isLoadingCart && hasRequestedInitialProducts.current ) {
			setIsLoading( false );
			return;
		}
		if (
			! areCartProductsPreparing &&
			productsForCart.length === 0 &&
			! couponCodeFromUrl &&
			! isLoadingCart &&
			! isCartPendingUpdate
		) {
			setIsLoading( false );
			return;
		}
	}, [
		isCartPendingUpdate,
		isLoadingCart,
		areCartProductsPreparing,
		productsForCart.length,
		couponCodeFromUrl,
	] );

	useEffect( () => {
		if ( areCartProductsPreparing || isLoadingCart || hasRequestedInitialProducts.current ) {
			return;
		}
		if ( productsForCart.length > 0 ) {
			addProductsToCart( productsForCart );
		}
		if ( couponCodeFromUrl ) {
			applyCoupon( couponCodeFromUrl );
		}
		hasRequestedInitialProducts.current = true;
	}, [
		areCartProductsPreparing,
		isLoadingCart,
		couponCodeFromUrl,
		applyCoupon,
		productsForCart,
		addProductsToCart,
	] );

	return isLoading;
}
