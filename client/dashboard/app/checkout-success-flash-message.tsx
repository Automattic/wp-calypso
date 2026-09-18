import FlashMessage from '../components/flash-message';
import {
	CHECKOUT_SUCCESS_FLASH_ID,
	CHECKOUT_SUCCESS_PLAN_PARAM,
	getCheckoutSuccessMessage,
} from './checkout-success-flash';

/**
 * Rendered in the app shell (`app/root`) so the toast appears regardless of
 * which Dashboard page checkout redirects to.
 */
export function CheckoutSuccessFlashMessage() {
	const planSlug = new URLSearchParams( window.location.search ).get( CHECKOUT_SUCCESS_PLAN_PARAM );
	return (
		<FlashMessage
			id={ CHECKOUT_SUCCESS_FLASH_ID }
			message={ getCheckoutSuccessMessage( planSlug ) }
		/>
	);
}
