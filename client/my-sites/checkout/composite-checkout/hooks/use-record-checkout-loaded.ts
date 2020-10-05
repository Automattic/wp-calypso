/**
 * External dependencies
 */
import { useRef } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import type { ReactStandardAction, ResponseCart } from './use-shopping-cart-manager/types';
import type { StoredCard } from '../types/stored-cards';
import type { CartValue } from 'calypso/lib/cart-values/types';
import { hasRenewalItem } from 'lib/cart-values/cart-items';

const debug = debugFactory( 'calypso:composite-checkout:use-record-checkout-loaded' );

export default function useRecordCheckoutLoaded( {
	recordEvent,
	isLoadingCart,
	isApplePayAvailable,
	isApplePayLoading,
	isLoadingStoredCards,
	responseCart,
	storedCards,
	productAliasFromUrl,
}: {
	recordEvent: ( action: ReactStandardAction ) => void;
	isLoadingCart: boolean;
	isApplePayAvailable: boolean;
	isApplePayLoading: boolean;
	isLoadingStoredCards: boolean;
	responseCart: ResponseCart;
	storedCards: StoredCard[];
	productAliasFromUrl: string | undefined | null;
} ): void {
	const hasRecordedCheckoutLoad = useRef( false );
	if (
		! isLoadingCart &&
		! isLoadingStoredCards &&
		! isApplePayLoading &&
		! hasRecordedCheckoutLoad.current
	) {
		debug( 'composite checkout has loaded' );
		recordEvent( {
			type: 'CHECKOUT_LOADED',
			payload: {
				saved_cards: storedCards.length,
				apple_pay_available: isApplePayAvailable,
				product_slug: productAliasFromUrl,
				is_renewal: hasRenewalItem( responseCart as CartValue ),
			},
		} );
		hasRecordedCheckoutLoad.current = true;
	}
}
