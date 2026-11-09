import { useAnalytics } from '../../../app/analytics';
import { useConsumeSearchParams } from '../../../app/hooks/use-consume-search-params';
import { CHECKOUT_CART_PARAM, RECEIPT_ID_PARAM } from '../products/lib/checkout-url';
import { clearStoredCart } from '../products/use-shopping-cart';
import { useMarketplaceType } from '../use-marketplace-type';

// `flash` and `purchased_plan` are left to the app shell's checkout success message.
const CHECKOUT_RETURN_PARAMS = [ RECEIPT_ID_PARAM, CHECKOUT_CART_PARAM ] as const;

/**
 * Finishes a purchase returning from the WordPress.com checkout. Its pending
 * page fills in `receipt_id` only after a successful payment, so the parameter
 * means the cart was bought: empty the cart and drop the parameters the
 * checkout added from the URL. A free referral cart is bought here too, and
 * leaves referral mode once it is.
 */
export function useCheckoutReturn() {
	const { recordTracksEvent } = useAnalytics();
	const { updateMarketplaceType } = useMarketplaceType();

	useConsumeSearchParams( CHECKOUT_RETURN_PARAMS, {
		when: ( params ) => Boolean( params.receipt_id ),
		onConsume: ( { receipt_id: receiptId, cart } ) => {
			if ( cart === 'referral' ) {
				clearStoredCart( 'referral' );
				updateMarketplaceType( 'regular' );
			} else {
				clearStoredCart( 'regular' );
			}
			recordTracksEvent( 'calypso_a4a_marketplace_cart_cleared_on_checkout_success', {
				receipt_id: receiptId,
			} );
		},
	} );
}
