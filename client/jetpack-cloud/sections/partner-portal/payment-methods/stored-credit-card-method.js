/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CreditCardFields from 'calypso/jetpack-cloud/sections/partner-portal/credit-card-fields';
import CreditCardSubmitButton from 'calypso/jetpack-cloud/sections/partner-portal/credit-card-fields/credit-card-submit-button';

export function createStoredCreditCardMethod( {
	store,
	stripe,
	stripeConfiguration,
	activePayButtonText = undefined,
} ) {
	return {
		id: 'card',
		activeContent: (
			<CreditCardFields stripe={ stripe } stripeConfiguration={ stripeConfiguration } />
		),
		submitButton: (
			<CreditCardSubmitButton
				store={ store }
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
				activeButtonText={ activePayButtonText }
			/>
		),
		// these are not shown in the Partner Portal, but are required for CheckoutProvider
		getAriaLabel: ( __ ) => __( 'Credit Card' ),
		inactiveContent: ( __ ) => __( 'Credit Card' ),
		label: ( __ ) => __( 'Credit Card' ),
	};
}
