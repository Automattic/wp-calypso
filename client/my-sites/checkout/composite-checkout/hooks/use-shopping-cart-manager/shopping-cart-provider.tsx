/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { RequestCart, ResponseCart } from './types';
import useShoppingCartManager from './index';
import ShoppingCartContext from './shopping-cart-context';

export default function ShoppingCartProvider( {
	cartKey,
	setCart,
	getCart,
	children,
}: {
	cartKey: string | number | null | undefined;
	setCart: ( cartKey: string, arg1: RequestCart ) => Promise< ResponseCart >;
	getCart: ( cartKey: string ) => Promise< ResponseCart >;
	children: JSX.Element;
} ): JSX.Element {
	const {
		removeProductFromCart,
		couponStatus,
		applyCoupon,
		removeCoupon,
		updateLocation,
		replaceProductInCart,
		isLoading,
		isPendingUpdate,
		responseCart,
		loadingError,
		loadingErrorType,
		addProductsToCart,
		reloadFromServer,
		replaceProductsInCart,
	} = useShoppingCartManager( {
		cartKey,
		canInitializeCart: true,
		setCart,
		getCart,
	} );

	const value = {
		removeProductFromCart,
		couponStatus,
		applyCoupon,
		removeCoupon,
		updateLocation,
		replaceProductInCart,
		isLoading,
		isPendingUpdate,
		responseCart,
		loadingError,
		loadingErrorType,
		addProductsToCart,
		reloadFromServer,
		replaceProductsInCart,
	};

	return <ShoppingCartContext.Provider value={ value }>{ children }</ShoppingCartContext.Provider>;
}
