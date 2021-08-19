import debugFactory from 'debug';
import { useRef } from 'react';
import { hasRenewalItem } from 'calypso/lib/cart-values/cart-items';
import { ReactStandardAction } from '../types/analytics';
import type { StoredCard } from '../types/stored-cards';
import type { ResponseCart } from '@automattic/shopping-cart';

const debug = debugFactory( 'calypso:composite-checkout:use-record-checkout-loaded' );

export default function useRecordCheckoutLoaded( {
	recordEvent,
	isLoading,
	isApplePayAvailable,
	responseCart,
	storedCards,
	productAliasFromUrl,
	checkoutFlow,
}: {
	recordEvent: ( action: ReactStandardAction ) => void;
	isLoading: boolean;
	isApplePayAvailable: boolean;
	responseCart: ResponseCart;
	storedCards: StoredCard[];
	productAliasFromUrl: string | undefined | null;
	checkoutFlow: string;
} ): void {
	const hasRecordedCheckoutLoad = useRef( false );
	if ( ! isLoading && ! hasRecordedCheckoutLoad.current ) {
		debug( 'composite checkout has loaded' );
		recordEvent( {
			type: 'CHECKOUT_LOADED',
			payload: {
				saved_cards: storedCards.length,
				apple_pay_available: isApplePayAvailable,
				product_slug: productAliasFromUrl,
				is_renewal: hasRenewalItem( responseCart ),
				checkout_flow: checkoutFlow,
			},
		} );
		hasRecordedCheckoutLoad.current = true;
	}
}
