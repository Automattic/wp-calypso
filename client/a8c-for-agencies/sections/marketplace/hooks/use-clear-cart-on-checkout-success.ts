import { removeQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { clearPersistedSelectedItems } from '../lib/shopping-cart-storage';

/**
 * A `receipt_id` on the landing URL means checkout succeeded — failed or
 * cancelled payments never redirect here — so the mini-cart can be cleared.
 * It is stripped afterwards to keep the marker single-use. Stripping it via
 * `page.replace` instead would change the router's current path mid-dispatch
 * and abort the render, leaving the page on its loading skeleton.
 */
export default function useClearCartOnCheckoutSuccess(): void {
	const dispatch = useDispatch();

	useEffect( () => {
		const receiptId = new URLSearchParams( window.location.search ).get( 'receipt_id' );

		if ( ! receiptId ) {
			return;
		}

		clearPersistedSelectedItems( 'regular' );

		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_cart_cleared_on_checkout_success', {
				receipt_id: receiptId,
			} )
		);

		window.history.replaceState( null, '', removeQueryArgs( window.location.href, 'receipt_id' ) );
	}, [ dispatch ] );
}
