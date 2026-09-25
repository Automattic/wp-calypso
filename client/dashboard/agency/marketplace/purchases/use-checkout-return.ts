import { useEffect } from 'react';
import { marketplacePurchasesRoute } from '../../../app/router/agency';
import { FLASH_QUERY_PARAM } from '../../../components/flash-message';
import { RECEIPT_ID_PARAM } from '../products/lib/checkout-url';
import { clearStoredCart } from '../products/use-shopping-cart';

/**
 * Finishes a purchase returning from the WordPress.com checkout. Its pending
 * page fills in `receipt_id` only after a successful payment, so the parameter
 * means the cart was bought: empty the cart and drop the parameter from the URL.
 */
export function useCheckoutReturn() {
	const navigate = marketplacePurchasesRoute.useNavigate();

	useEffect( () => {
		const params = new URLSearchParams( window.location.search );
		if ( ! params.has( RECEIPT_ID_PARAM ) ) {
			return;
		}
		clearStoredCart( 'regular' );
		navigate( {
			// The app shell shows the one-time flash toast in this same commit and
			// strips its parameter from the address bar, so the navigation must not
			// write it back either.
			search: ( prev: Record< string, unknown > ) => {
				const { [ RECEIPT_ID_PARAM ]: _receiptId, [ FLASH_QUERY_PARAM ]: _flash, ...rest } = prev;
				return rest;
			},
			replace: true,
		} );
		// The parameter arrives with the page load, so this only needs to run once.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );
}
