import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import type { CartKey } from '@automattic/shopping-cart';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Checkout for a cart the WordPress.com middleware already prepared and saved
 * for the agency (the Pressable Titan redirect arrives with
 * `skip_active_cart=1`). The cart is read as it is on the server and never
 * replaced, so the prepared items keep their `extra`, `mpcp_state` included.
 * A cart that failed to load, is empty, or holds anything the middleware did
 * not prepare is an error, never a fallback to the frontend Marketplace cart.
 */
export default function usePreparedCart(
	cartKey: CartKey,
	enabled: boolean
): { isReady: boolean; error: TranslateResult | null } {
	const translate = useTranslate();
	const { isLoading, loadingError, responseCart } = useShoppingCart( cartKey );

	if ( ! enabled || isLoading ) {
		return { isReady: false, error: null };
	}

	if ( loadingError ) {
		return { isReady: false, error: translate( 'Unable to load your prepared order.' ) };
	}

	const isPrepared =
		responseCart.products.length > 0 &&
		responseCart.products.every( ( product ) => product.extra?.isA4ASitelessCheckout );

	if ( ! isPrepared ) {
		return { isReady: false, error: translate( 'We could not find your prepared order.' ) };
	}

	return { isReady: true, error: null };
}
