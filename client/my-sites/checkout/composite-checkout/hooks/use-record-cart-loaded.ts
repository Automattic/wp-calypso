/**
 * External dependencies
 */
import { useRef, useEffect } from 'react';

/**
 * Internal dependencies
 */
import type { ReactStandardAction } from 'my-sites/checkout/composite-checkout/hooks/use-shopping-cart-manager/types';
import type { ResponseCart, RequestCartProduct } from '../types/backend/shopping-cart-endpoint';

export default function useRecordCartLoaded( {
	recordEvent,
	responseCart,
	productsForCart,
	isInitialCartLoading,
}: {
	recordEvent: ( action: ReactStandardAction ) => void;
	responseCart: ResponseCart;
	productsForCart: RequestCartProduct[];
	isInitialCartLoading: boolean;
} ): void {
	const hasRecorded = useRef< boolean >( false );

	useEffect( () => {
		if ( hasRecorded.current ) {
			return;
		}
		if ( ! isInitialCartLoading ) {
			hasRecorded.current = true;
			recordEvent( {
				type: 'CART_INIT_COMPLETE',
				payload: responseCart,
			} );
			productsForCart.forEach( ( productToAdd ) => {
				recordEvent( {
					type: 'CART_ADD_ITEM',
					payload: productToAdd,
				} );
			} );
		}
	}, [ isInitialCartLoading, productsForCart, recordEvent, responseCart ] );
}
