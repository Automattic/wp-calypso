/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import { usePaymentMethod } from '../public-api';

export default function CheckoutSubmitButton( { className, disabled } ) {
	const paymentMethod = usePaymentMethod();
	if ( ! paymentMethod ) {
		return null;
	}
	const { submitButton } = paymentMethod;

	// We clone the element to add the disabled prop
	const clonedSubmitButton = React.cloneElement( submitButton, { disabled } );
	return (
		<div className={ joinClasses( [ className, 'checkout-submit-button' ] ) }>
			{ clonedSubmitButton }
		</div>
	);
}
