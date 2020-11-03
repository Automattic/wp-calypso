/**
 * External dependencies
 */
import { useRef } from 'react';
import debugFactory from 'debug';
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import type { StoredCard } from '../types/stored-cards';
import { hasRenewalItem } from 'calypso/lib/cart-values/cart-items';
import { ReactStandardAction } from '../types/analytics';

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
				is_renewal: hasRenewalItem( responseCart ),
			},
		} );
		hasRecordedCheckoutLoad.current = true;
	}
}
