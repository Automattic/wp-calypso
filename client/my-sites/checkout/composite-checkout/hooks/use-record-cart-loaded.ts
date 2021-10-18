import { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { recordAddEvent } from 'calypso/lib/analytics/cart';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
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
				recordAddEvent( productToAdd );
			} );
		}
	}, [ isInitialCartLoading, productsForCart, responseCart, reduxDispatch ] );
}
