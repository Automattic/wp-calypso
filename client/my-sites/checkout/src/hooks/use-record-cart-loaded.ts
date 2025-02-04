import { useRef, useEffect } from 'react';
import { recordAddEvent } from 'calypso/lib/analytics/cart';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { logStashEvent } from '../lib/analytics';
import type { ResponseCart, RequestCartProduct } from '@automattic/shopping-cart';

export default function useRecordCartLoaded( {
	responseCart,
	productsForCart,
	isInitialCartLoading,
}: {
	responseCart: ResponseCart;
	productsForCart: RequestCartProduct[];
	isInitialCartLoading: boolean;
} ): void {
	const reduxDispatch = useDispatch();
	const hasRecorded = useRef< boolean >( false );

	useEffect( () => {
		if ( hasRecorded.current ) {
			return;
		}
		if ( ! isInitialCartLoading ) {
			hasRecorded.current = true;
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_composite_cart_loaded', {
					products: responseCart.products.map( ( product ) => product.product_slug ).join( ',' ),
				} )
			);
			productsForCart.forEach( ( productToAdd ) => {
				try {
					recordAddEvent( productToAdd );
				} catch ( error ) {
					logStashEvent( 'checkout_add_product_analytics_error', {
						error: String( error ),
					} );
				}
			} );
		}
	}, [ isInitialCartLoading, productsForCart, responseCart, reduxDispatch ] );
}
