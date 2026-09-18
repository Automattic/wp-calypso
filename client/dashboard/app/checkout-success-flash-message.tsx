import { getPlanNames } from '@automattic/api-core';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';
import {
	CHECKOUT_SUCCESS_FLASH_ID,
	CHECKOUT_SUCCESS_PLAN_PARAM,
} from './checkout-success-flash-constants';

function getPlanName( slug: string | null ) {
	const planNames: Record< string, string > = getPlanNames();
	return slug && Object.hasOwn( planNames, slug ) ? planNames[ slug ] : undefined;
}

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
		const planName = getPlanName( params.get( CHECKOUT_SUCCESS_PLAN_PARAM ) );

		params.delete( 'flash' );
		params.delete( CHECKOUT_SUCCESS_PLAN_PARAM );
		const search = params.toString();
		window.history.replaceState(
			window.history.state,
			'',
			window.location.pathname + ( search ? `?${ search }` : '' ) + window.location.hash
		);

		createSuccessNotice(
			planName
				? sprintf(
						/* translators: %(planName)s is the name of the plan, e.g. "Business" */
						__( "You're in! The %(planName)s Plan is now active." ),
						{ planName }
				  )
				: __( 'Your purchase was completed.' ),
			{ type: 'snackbar' }
		);
	}, [ createSuccessNotice ] );

	return null;
}
