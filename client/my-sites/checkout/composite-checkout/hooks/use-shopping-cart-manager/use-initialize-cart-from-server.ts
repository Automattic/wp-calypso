/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	convertResponseCartToRequestCart,
	ResponseCart,
	RequestCart,
	RequestCartProduct,
	addItemToResponseCart,
	convertRawResponseCartToResponseCart,
	addCouponToResponseCart,
} from '../../types/backend/shopping-cart-endpoint';
import { CacheStatus, ShoppingCartAction } from './types';

const debug = debugFactory( 'calypso:composite-checkout:use-initialize-cart-from-server' );

export default function useInitializeCartFromServer(
	cacheStatus: CacheStatus,
	canInitializeCart: boolean,
	productsToAddOnInitialize: RequestCartProduct[] | null,
	couponToAddOnInitialize: string | null,
	getCart: () => Promise< ResponseCart >,
	setCart: ( arg0: RequestCart ) => Promise< ResponseCart >,
	hookDispatch: ( arg0: ShoppingCartAction ) => void
): void {
	const isInitialized = useRef( false );
	const initializedProducts = useRef< RequestCartProduct[] | null >( null );
	const initializedCoupon = useRef< string | null >( null );

	useEffect( () => {
		if ( cacheStatus !== 'fresh' ) {
			debug( 'not initializing cart; cacheStatus is not fresh' );
			return;
		}
		if ( canInitializeCart !== true ) {
			debug( 'not initializing cart; canInitializeCart is not true' );
			return;
		}

		if ( isInitialized.current ) {
			debug( 'not initializing cart; already initialized' );
			if ( productsToAddOnInitialize !== initializedProducts.current ) {
				// eslint-disable-next-line no-console
				console.warn(
					'The products list provided to useInitializeCartFromServer',
					productsToAddOnInitialize,
					'did not match the products list used for initialization',
					initializedProducts.current,
					'; they will not be added because the cart has already initialized. productsToAddOnInitialize should not change once canInitializeCart is true!'
				);
			}
			if ( couponToAddOnInitialize !== initializedCoupon.current ) {
				// eslint-disable-next-line no-console
				console.warn(
					'The coupon provided to useInitializeCartFromServer',
					couponToAddOnInitialize,
					'did not match the coupon used for initialization',
					initializedCoupon.current,
					'; it will not be added because the cart has already initialized. couponToAddOnInitialize should not change once canInitializeCart is true!'
				);
			}
			return;
		}
		isInitialized.current = true;
		debug( `initializing the cart; cacheStatus is ${ cacheStatus }` );
		initializedProducts.current = productsToAddOnInitialize;
		initializedCoupon.current = couponToAddOnInitialize;

		getCart()
			.then( ( response ) => {
				if ( productsToAddOnInitialize?.length || couponToAddOnInitialize ) {
					debug(
						'initialized cart is',
						response,
						'; proceeding to add initial products',
						productsToAddOnInitialize,
						' and coupons',
						couponToAddOnInitialize
					);
					let responseCart = convertRawResponseCartToResponseCart( response );
					if ( productsToAddOnInitialize?.length ) {
						responseCart = productsToAddOnInitialize.reduce(
							( updatedCart, productToAdd ) => addItemToResponseCart( updatedCart, productToAdd ),
							responseCart
						);
					}
					if ( couponToAddOnInitialize ) {
						responseCart = addCouponToResponseCart( responseCart, couponToAddOnInitialize );
					}
					return setCart( convertResponseCartToRequestCart( responseCart ) );
				}
				return response;
			} )
			.then( ( response ) => {
				debug( 'initialized cart is', response );
				const initialResponseCart = convertRawResponseCartToResponseCart( response );
				hookDispatch( {
					type: 'RECEIVE_INITIAL_RESPONSE_CART',
					initialResponseCart,
				} );
			} )
			.catch( ( error ) => {
				debug( 'error while initializing cart', error );
				hookDispatch( {
					type: 'RAISE_ERROR',
					error: 'GET_SERVER_CART_ERROR',
					message: error.message,
				} );
			} );
	}, [
		cacheStatus,
		canInitializeCart,
		hookDispatch,
		getCart,
		productsToAddOnInitialize,
		couponToAddOnInitialize,
		setCart,
	] );
}
