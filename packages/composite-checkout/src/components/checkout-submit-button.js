/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import { usePaymentMethod } from '../public-api';

export default function CheckoutSubmitButton( { className, isActive } ) {
	const paymentMethod = usePaymentMethod();
	if ( ! paymentMethod ) {
		return null;
	}
	const { SubmitButtonComponent } = paymentMethod;
	return (
		<div className={ joinClasses( [ className, 'checkout-submit-button' ] ) }>
			<SubmitButtonComponent isActive={ isActive } />
		</div>
	);
}

CheckoutSubmitButton.propTypes = {
	isActive: PropTypes.bool.isRequired,
	className: PropTypes.string,
};
