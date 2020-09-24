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
	couponCodeFromUrl,
	applyCoupon,
	recordEvent,
	addProductsToCart,
}: {
	isLoadingCart: boolean;
	isCartPendingUpdate: boolean;
	productsForCart: RequestCartProduct[];
	couponCodeFromUrl: string | null | undefined;
	applyCoupon: ( couponId: string ) => void;
	recordEvent: ( action: ReactStandardAction ) => void;
	addProductsToCart: ( products: RequestCartProduct[] ) => void;
} ): IsInitialCartLoading {
	const [ isLoading, setIsLoading ] = useState< boolean >( true );
	const hasRequestedInitialProducts = useRef< boolean >( false );

	useEffect( () => {
		if ( isCartPendingUpdate || isLoadingCart ) {
			return;
		}
		if ( ! hasRequestedInitialProducts.current ) {
			return;
		}
		setIsLoading( false );
	}, [ isCartPendingUpdate, isLoadingCart ] );

	useEffect( () => {
		if ( isLoadingCart || hasRequestedInitialProducts.current ) {
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
		recordEvent,
		isLoadingCart,
		couponCodeFromUrl,
		applyCoupon,
		productsForCart,
		addProductsToCart,
	] );

	return isLoading;
}
