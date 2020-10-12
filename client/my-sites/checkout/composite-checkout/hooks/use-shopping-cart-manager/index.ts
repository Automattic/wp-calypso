/**
 * External dependencies
 */
import { useCallback } from 'react';

/**
 * Internal dependencies
 */
import {
	ResponseCart,
	RequestCartProduct,
	CartLocation,
	ShoppingCartManager,
	ShoppingCartManagerArguments,
	CacheStatus,
	CouponStatus,
	ShoppingCartError,
	ReplaceProductInCart,
} from './types';
import useShoppingCartReducer from './use-shopping-cart-reducer';
import useInitializeCartFromServer from './use-initialize-cart-from-server';
import useCartUpdateAndRevalidate from './use-cart-update-and-revalidate';

export default function useShoppingCartManager( {
	cartKey,
	canInitializeCart,
	setCart,
	getCart,
}: ShoppingCartManagerArguments ): ShoppingCartManager {
	const cartKeyString = String( cartKey || 'no-site' );
	const setServerCart = useCallback( ( cartParam ) => setCart( cartKeyString, cartParam ), [
		cartKeyString,
		setCart,
	] );
	const getServerCart = useCallback( () => getCart( cartKeyString ), [ cartKeyString, getCart ] );

	const [ hookState, hookDispatch ] = useShoppingCartReducer();

	const responseCart: ResponseCart = hookState.responseCart;
	const couponStatus: CouponStatus = hookState.couponStatus;
	const cacheStatus: CacheStatus = hookState.cacheStatus;
	const loadingError: string | undefined = hookState.loadingError;
	const loadingErrorType: ShoppingCartError | undefined = hookState.loadingErrorType;

	// Asynchronously initialize the cart. This should happen exactly once.
	useInitializeCartFromServer(
		cacheStatus,
		canInitializeCart,
		getServerCart,
		setServerCart,
		hookDispatch
	);

	// Asynchronously re-validate when the cache is dirty.
	useCartUpdateAndRevalidate( cacheStatus, responseCart, setServerCart, hookDispatch );

	const addProductsToCart: ( products: RequestCartProduct[] ) => void = useCallback(
		( products ) => {
			hookDispatch( { type: 'CART_PRODUCTS_ADD', products } );
		},
		[ hookDispatch ]
	);

	const replaceProductsInCart: ( products: RequestCartProduct[] ) => void = useCallback(
		( products ) => {
			hookDispatch( { type: 'CART_PRODUCTS_REPLACE_ALL', products } );
		},
		[ hookDispatch ]
	);

	const removeProductFromCart: ( uuidToRemove: string ) => void = useCallback(
		( uuidToRemove ) => {
			hookDispatch( { type: 'REMOVE_CART_ITEM', uuidToRemove } );
		},
		[ hookDispatch ]
	);

	const replaceProductInCart: ReplaceProductInCart = useCallback(
		( uuidToReplace: string, productPropertiesToChange: Partial< RequestCartProduct > ) => {
			hookDispatch( { type: 'CART_PRODUCT_REPLACE', uuidToReplace, productPropertiesToChange } );
		},
		[ hookDispatch ]
	);

	const updateLocation: ( arg0: CartLocation ) => void = useCallback(
		( location ) => {
			hookDispatch( { type: 'SET_LOCATION', location } );
		},
		[ hookDispatch ]
	);

	const applyCoupon: ( arg0: string ) => void = useCallback(
		( newCoupon ) => {
			hookDispatch( { type: 'ADD_COUPON', couponToAdd: newCoupon } );
		},
		[ hookDispatch ]
	);

	const removeCoupon: () => void = useCallback( () => {
		hookDispatch( { type: 'REMOVE_COUPON' } );
	}, [ hookDispatch ] );

	return {
		isLoading: cacheStatus === 'fresh',
		loadingError: cacheStatus === 'error' ? loadingError : null,
		loadingErrorType,
		isPendingUpdate: cacheStatus !== 'valid',
		addProductsToCart,
		removeProductFromCart,
		applyCoupon,
		removeCoupon,
		couponStatus,
		updateLocation,
		replaceProductInCart,
		replaceProductsInCart,
		responseCart,
	};
}
