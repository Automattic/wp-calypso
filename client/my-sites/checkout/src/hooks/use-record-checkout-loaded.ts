import debugFactory from 'debug';
import { useRef } from 'react';
import { hasRenewalItem } from 'calypso/lib/cart-values/cart-items';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { StoredPaymentMethod } from 'calypso/lib/checkout/payment-methods';

const debug = debugFactory( 'calypso:composite-checkout:use-record-checkout-loaded' );

export default function useRecordCheckoutLoaded( {
	isLoading,
	responseCart,
	storedCards,
	productAliasFromUrl,
	checkoutFlow,
	isGiftPurchase,
}: {
	isLoading: boolean;
	responseCart: ResponseCart;
	storedCards: StoredPaymentMethod[];
	productAliasFromUrl: string | undefined | null;
	checkoutFlow: string;
	isGiftPurchase?: boolean;
} ): void {
	const reduxDispatch = useDispatch();
	const hasRecordedCheckoutLoad = useRef( false );
	const { currency } = responseCart;
	if ( ! isLoading && ! hasRecordedCheckoutLoad.current ) {
		debug( 'composite checkout has loaded' );
		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_page_view', {
				saved_cards: storedCards.length,
				is_renewal: hasRenewalItem( responseCart ),
				is_gift_purchase: isGiftPurchase,
				product_slug: productAliasFromUrl,
				is_composite: true,
				checkout_flow: checkoutFlow,
				currency,
			} )
		);
		reduxDispatch( recordTracksEvent( 'calypso_checkout_composite_loaded', {} ) );

		hasRecordedCheckoutLoad.current = true;
	}
}
