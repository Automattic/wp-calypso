/**
 * External dependencies
 */
import { useEffect, useRef, useState } from 'react';

/**
 * Internal dependencies
 */
import { ReactStandardAction } from './use-shopping-cart-manager/types';
import type { RequestCartProduct } from '../types/backend/shopping-cart-endpoint';

export type IsInitialCartLoading = boolean;

export default function useAddProductsFromUrl( {
	isLoadingCart,
	isCartPendingUpdate,
	productsForCart,
	areCartProductsPreparing,
	couponCodeFromUrl,
	applyCoupon,
	recordEvent,
	addProductsToCart,
}: {
	isLoadingCart: boolean;
	isCartPendingUpdate: boolean;
	productsForCart: RequestCartProduct[];
	areCartProductsPreparing: boolean;
	couponCodeFromUrl: string | null | undefined;
	applyCoupon: ( couponId: string ) => void;
	recordEvent: ( action: ReactStandardAction ) => void;
	addProductsToCart: ( products: RequestCartProduct[] ) => void;
} ): IsInitialCartLoading {
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
		recordEvent,
		isLoadingCart,
		couponCodeFromUrl,
		applyCoupon,
		productsForCart,
		addProductsToCart,
	] );

	return isLoading;
}
