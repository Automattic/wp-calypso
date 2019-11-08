/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import { useLocalize } from '../lib/localize';

// The react-stripe-elements PaymentRequestButtonElement cannot have its
// paymentRequest updated once it has been rendered, so this is a custom one.
// See: https://github.com/stripe/react-stripe-elements/issues/284
export default function PaymentRequestButton( {
	paymentRequest,
	paymentType,
	disabled,
	disabledReason,
} ) {
	const localize = useLocalize();
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const onClick = event => {
		event.persist();
		event.preventDefault();
		setIsSubmitting( true );
		paymentRequest.on( 'cancel', () => setIsSubmitting( false ) );
		paymentRequest.show();
	};
	if ( ! paymentRequest ) {
		disabled = true;
	}

	if ( isSubmitting ) {
		return (
			<button disabled>
				{ localize( 'Completing your purchase', { context: 'Loading state on /checkout' } ) }
			</button>
		);
	}
	if ( disabled ) {
		return (
			<React.Fragment>
				<button disabled>{ disabledReason }</button>
			</React.Fragment>
		);
	}

	if ( paymentType === 'apple-pay' ) {
		return <button className="payment-request-button" onClick={ onClick } />;
	}
	return (
		<button onClick={ onClick }>
			{ localize( 'Select a payment card', { context: 'Loading state on /checkout' } ) }
		</button>
	);
}

PaymentRequestButton.propTypes = {
	paymentRequest: PropTypes.object,
	paymentType: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
	disabledReason: PropTypes.string,
};
