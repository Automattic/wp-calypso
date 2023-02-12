import debugFactory from 'debug';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { hasRenewalItem } from 'calypso/lib/cart-values/cart-items';
import { usePerformanceTrackerStop } from 'calypso/lib/performance-tracking/use-performance-tracker-stop';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { StoredCard } from '../types/stored-cards';
import type { ResponseCart } from '@automattic/shopping-cart';

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
	storedCards: StoredCard[];
	productAliasFromUrl: string | undefined | null;
	checkoutFlow: string;
	isGiftPurchase?: boolean;
} ): void {
	const reduxDispatch = useDispatch();
	const hasRecordedCheckoutLoad = useRef( false );
	usePerformanceTrackerStop();
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
			} )
		);
		reduxDispatch( recordTracksEvent( 'calypso_checkout_composite_loaded', {} ) );

		hasRecordedCheckoutLoad.current = true;
	}
}
