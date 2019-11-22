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
	const { SubmitButtonComponent } = paymentMethod;
	return (
		<div className={ joinClasses( [ className, 'checkout-submit-button' ] ) }>
			<SubmitButtonComponent disabled={ disabled } />
		</div>
	);
}
