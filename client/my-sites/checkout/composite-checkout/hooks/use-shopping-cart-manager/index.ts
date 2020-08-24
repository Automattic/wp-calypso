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
} from '../../types/backend/shopping-cart-endpoint';
import {
	ShoppingCartManager,
	ShoppingCartManagerArguments,
	CacheStatus,
	CouponStatus,
	VariantRequestStatus,
} from './types';
import useShoppingCartReducer from './use-shopping-cart-reducer';
import useInitializeCartFromServer from './use-initialize-cart-from-server';
import useCartUpdateAndRevalidate from './use-cart-update-and-revalidate';

export default function useShoppingCartManager( {
	cartKey,
	canInitializeCart,
	productsToAdd,
	couponToAdd,
	setCart,
	getCart,
	onEvent,
}: ShoppingCartManagerArguments ): ShoppingCartManager {
	const cartKeyString: string = cartKey || 'no-site';
	const setServerCart = useCallback( ( cartParam ) => setCart( cartKeyString, cartParam ), [
		cartKeyString,
		setCart,
	] );
	const getServerCart = useCallback( () => getCart( cartKeyString ), [ cartKeyString, getCart ] );

	const [ hookState, hookDispatch ] = useShoppingCartReducer();

	const responseCart: ResponseCart = hookState.responseCart;
	const couponStatus: CouponStatus = hookState.couponStatus;
	const cacheStatus: CacheStatus = hookState.cacheStatus;
	const loadingError: string = hookState.loadingError;
	const variantRequestStatus: VariantRequestStatus = hookState.variantRequestStatus;
	const variantSelectOverride = hookState.variantSelectOverride;

	// Asynchronously initialize the cart. This should happen exactly once.
	useInitializeCartFromServer(
		cacheStatus,
		canInitializeCart,
		productsToAdd,
		couponToAdd,
		getServerCart,
		setServerCart,
		hookDispatch,
		onEvent
	);

	// Asynchronously re-validate when the cache is dirty.
	useCartUpdateAndRevalidate( cacheStatus, responseCart, setServerCart, hookDispatch, onEvent );

	const addItem: ( arg0: RequestCartProduct ) => void = useCallback(
		( requestCartProductToAdd ) => {
			hookDispatch( { type: 'ADD_CART_ITEM', requestCartProductToAdd } );
			onEvent?.( {
				type: 'CART_ADD_ITEM',
				payload: requestCartProductToAdd,
			} );
		},
		[ hookDispatch, onEvent ]
	);

	const removeItem: ( arg0: string ) => void = useCallback(
		( uuidToRemove ) => {
			hookDispatch( { type: 'REMOVE_CART_ITEM', uuidToRemove } );
		},
		[ hookDispatch ]
	);

	const changeItemVariant: (
		uuidToReplace: string,
		newProductSlug: string,
		newProductId: number
	) => void = useCallback(
		( uuidToReplace, newProductSlug, newProductId ) => {
			hookDispatch( { type: 'REPLACE_CART_ITEM', uuidToReplace, newProductSlug, newProductId } );
		},
		[ hookDispatch ]
	);

	const updateLocation: ( arg0: CartLocation ) => void = useCallback(
		( location ) => {
			hookDispatch( { type: 'SET_LOCATION', location } );
		},
		[ hookDispatch ]
	);

	const submitCoupon: ( arg0: string ) => void = useCallback(
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
		isPendingUpdate: cacheStatus !== 'valid',
		addItem,
		removeItem,
		submitCoupon,
		removeCoupon,
		couponStatus,
		updateLocation,
		variantRequestStatus,
		variantSelectOverride,
		changeItemVariant,
		responseCart,
	} as ShoppingCartManager;
}
