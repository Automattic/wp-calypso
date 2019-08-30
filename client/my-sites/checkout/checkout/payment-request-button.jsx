/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

// The react-stripe-elements PaymentRequestButtonElement cannot have its
// paymentRequest updated once it has been rendered, so this is a custom one.
// See: https://github.com/stripe/react-stripe-elements/issues/284
export default function PaymentRequestButton( {
	paymentRequest,
	isRenewal,
	paymentType,
	translate,
	disabled,
} ) {
	const onClick = event => {
		event.persist();
		event.preventDefault();
		analytics.tracks.recordEvent( 'calypso_checkout_apple_pay_open_payment_sheet', {
			is_renewal: isRenewal,
		} );
		paymentRequest.show();
	};
	if ( paymentType === 'apple-pay' ) {
		return <button className="payment-request-button" onClick={ onClick } disabled={ disabled } />;
	}
	return (
		<button
			className="web-payment-box__web-pay-button button checkout__pay-button-button button is-primary button-pay pay-button__button"
			onClick={ onClick }
			disabled={ disabled }
		>
			{ translate( 'Select a payment card', { context: 'Loading state on /checkout' } ) }
		</button>
	);
}

PaymentRequestButton.propTypes = {
	paymentRequest: PropTypes.object.isRequired,
	isRenewal: PropTypes.bool.isRequired,
	paymentType: PropTypes.string.isRequired,
	translate: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
};
