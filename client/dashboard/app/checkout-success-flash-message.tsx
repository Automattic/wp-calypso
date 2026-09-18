import FlashMessage from '../components/flash-message';
import { CHECKOUT_SUCCESS_FLASH_ID, getCheckoutSuccessMessage } from './checkout-success-flash';

/**
 * Rendered in the app shell (`app/root`) so the toast appears regardless of
 * which Dashboard page checkout redirects to.
 */
export function CheckoutSuccessFlashMessage() {
	return <FlashMessage id={ CHECKOUT_SUCCESS_FLASH_ID } message={ getCheckoutSuccessMessage() } />;
}
