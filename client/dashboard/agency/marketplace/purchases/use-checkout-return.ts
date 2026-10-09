import { useEffect } from 'react';
import { marketplacePurchasesRoute } from '../../../app/router/agency';
import { clearStoredCart } from '../products/use-shopping-cart';
import { useMarketplaceType } from '../use-marketplace-type';

type PurchasesSearch = typeof marketplacePurchasesRoute.types.fullSearchSchema;

/**
 * Finishes a purchase returning from the WordPress.com checkout. Its pending
 * page fills in `receipt_id` only after a successful payment, so the parameter
 * means the cart was bought: empty the cart and drop the parameters the
 * checkout added from the URL. A free referral cart is bought here too, and
 * leaves referral mode once it is.
 */
export function useCheckoutReturn() {
	const navigate = marketplacePurchasesRoute.useNavigate();
	const { receipt_id: receiptId, cart } = marketplacePurchasesRoute.useSearch();
	const { updateMarketplaceType } = useMarketplaceType();

	useEffect( () => {
		if ( ! receiptId ) {
			return;
		}
		if ( cart === 'referral' ) {
			clearStoredCart( 'referral' );
			updateMarketplaceType( 'regular' );
		} else {
			clearStoredCart( 'regular' );
		}
		navigate( {
			// The app shell shows the flash toast once and strips its parameter
			// from the URL, so this navigation must not write it back.
			search: ( {
				receipt_id: _receiptId,
				cart: _cart,
				flash: _flash,
				purchased_plan: _purchasedPlan,
				...rest
			}: PurchasesSearch ) => rest,
			replace: true,
		} );
	}, [ receiptId, cart, navigate, updateMarketplaceType ] );
}
