/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { useTranslate } from 'i18n-calypso';
import Button from './button';

// The react-stripe-elements PaymentRequestButtonElement cannot have its
// paymentRequest updated once it has been rendered, so this is a custom one.
// See: https://github.com/stripe/react-stripe-elements/issues/284
export default function PaymentRequestButton( {
	paymentRequest,
	paymentType,
	disabled,
	disabledReason,
} ) {
	const localize = useTranslate();
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
			<Button disabled fullWidth>
				{ localize( 'Completing your purchase', { context: 'Loading state on /checkout' } ) }
			</Button>
		);
	}
	if ( disabled ) {
		return (
			<Button disabled fullWidth>
				{ disabledReason }
			</Button>
		);
	}

	if ( paymentType === 'apple-pay' ) {
		return <ApplePayButton onClick={ onClick } />;
	}
	return (
		<Button onClick={ onClick } fullWidth>
			{ localize( 'Select a payment card', { context: 'Loading state on /checkout' } ) }
		</Button>
	);
}

PaymentRequestButton.propTypes = {
	paymentRequest: PropTypes.object,
	paymentType: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
	disabledReason: PropTypes.string,
};

const ApplePayButton = styled.button`
	-webkit-appearance: -apple-pay-button;
	-apple-pay-button-style: black;
	-apple-pay-button-type: plain;
	width: 100%;
`;
