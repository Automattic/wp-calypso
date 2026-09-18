import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';
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
	const { createSuccessNotice } = useDispatch( noticesStore );

	useEffect( () => {
		const params = new URLSearchParams( window.location.search );
		if ( params.get( 'flash' ) !== CHECKOUT_SUCCESS_FLASH_ID ) {
			return;
		}
		const message = getCheckoutSuccessMessage( params.get( CHECKOUT_SUCCESS_PLAN_PARAM ) );

		params.delete( 'flash' );
		params.delete( CHECKOUT_SUCCESS_PLAN_PARAM );
		const search = params.toString();
		window.history.replaceState(
			window.history.state,
			'',
			window.location.pathname + ( search ? `?${ search }` : '' ) + window.location.hash
		);

		createSuccessNotice( message, { type: 'snackbar' } );
	}, [ createSuccessNotice ] );

	return null;
}
