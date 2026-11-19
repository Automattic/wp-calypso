import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { FLASH_QUERY_PARAM } from '../components/flash-message';
import {
	CHECKOUT_SUCCESS_FLASH_ID,
	CHECKOUT_SUCCESS_PLAN_PARAM,
	getCheckoutSuccessMessage,
} from './checkout-success-flash';
import { useConsumeSearchParams } from './hooks/use-consume-search-params';

/**
 * Rendered in the app shell (`app/root`) so the toast appears regardless of
 * which Dashboard page checkout redirects to (site overview, sites list,
 * billing purchases, etc.).
 */
export function CheckoutSuccessFlashMessage() {
	const { createSuccessNotice } = useDispatch( noticesStore );

	useConsumeSearchParams( [ FLASH_QUERY_PARAM, CHECKOUT_SUCCESS_PLAN_PARAM ], {
		when: ( params ) => params[ FLASH_QUERY_PARAM ] === CHECKOUT_SUCCESS_FLASH_ID,
		onConsume: ( params ) =>
			createSuccessNotice( getCheckoutSuccessMessage( params[ CHECKOUT_SUCCESS_PLAN_PARAM ] ), {
				type: 'snackbar',
			} ),
	} );

	return null;
}
