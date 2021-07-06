/**
 * External dependencies
 */
import { useEffect } from 'react';
import debugFactory from 'debug';
import type { Dispatch } from 'react';

/**
 * Internal dependencies
 */
import type { CacheStatus, ShoppingCartAction } from './types';

const debug = debugFactory( 'shopping-cart:use-cart-update-and-revalidate' );

export default function useCartUpdateAndRevalidate(
	cacheStatus: CacheStatus,
	dispatch: Dispatch< ShoppingCartAction >
): void {
	useEffect( () => {
		if ( cacheStatus !== 'invalid' ) {
			return;
		}

		debug( 'dispatching edited cart update request' );
		dispatch( { type: 'REQUEST_UPDATED_RESPONSE_CART' } );
		dispatch( { type: 'SYNC_CART_TO_SERVER' } );
	}, [ cacheStatus, dispatch ] );
}
