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
import useReloadCartIfCartKeyChanges from './use-reload-cart-if-cart-key-changes';

export default function useShoppingCartManager( {
	cartKey,
	setCart,
	getCart,
}: ShoppingCartManagerArguments ): ShoppingCartManager {
	const setServerCart = useCallback( ( cartParam ) => setCart( String( cartKey ), cartParam ), [
		cartKey,
		setCart,
	] );
	const getServerCart = useCallback( () => getCart( String( cartKey ) ), [ cartKey, getCart ] );

	const [ hookState, hookDispatch ] = useShoppingCartReducer();

	const responseCart: ResponseCart = hookState.responseCart;
	const couponStatus: CouponStatus = hookState.couponStatus;
	const cacheStatus: CacheStatus = hookState.cacheStatus;
	const loadingError: string | undefined = hookState.loadingError;
	const loadingErrorType: ShoppingCartError | undefined = hookState.loadingErrorType;

	const canInitializeCart = !! cartKey;

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

	const reloadFromServer: () => void = useCallback( () => {
		hookDispatch( { type: 'CART_RELOAD' } );
	}, [ hookDispatch ] );

	useReloadCartIfCartKeyChanges( cartKey, reloadFromServer );

	return {
		isLoading: cacheStatus === 'fresh' || ! canInitializeCart,
		loadingError: cacheStatus === 'error' ? loadingError : null,
		loadingErrorType,
		isPendingUpdate: cacheStatus !== 'valid' || ! canInitializeCart,
		addProductsToCart,
		removeProductFromCart,
		applyCoupon,
		removeCoupon,
		couponStatus,
		updateLocation,
		replaceProductInCart,
		replaceProductsInCart,
		reloadFromServer,
		responseCart,
	};
}
