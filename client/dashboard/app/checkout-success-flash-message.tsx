import { __ } from '@wordpress/i18n';
import FlashMessage from '../components/flash-message';

/**
 * Flash id used to show a post-checkout success snackbar when the checkout
 * pending page redirects the user back into the Dashboard. The checkout side
 * imports this constant and tags the redirect URL with `?flash=<id>` (see
 * `client/my-sites/checkout/checkout-thank-you/pending/index.tsx`).
 *
 * Rendered in the app shell (`app/root`) so the toast appears regardless of
 * which Dashboard page checkout redirects to (site overview, sites list,
 * billing purchases, etc.).
 */
export const CHECKOUT_SUCCESS_FLASH_ID = 'checkout-success';

export function CheckoutSuccessFlashMessage() {
	return (
		<FlashMessage
			id={ CHECKOUT_SUCCESS_FLASH_ID }
			message={ __( 'Your purchase was completed.' ) }
		/>
	);
}
