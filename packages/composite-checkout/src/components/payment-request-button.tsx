/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { MouseEvent } from 'react';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import styled from '../lib/styled';
import Button from './button';
import { useFormStatus } from '../lib/form-status';
import { FormStatus, StripePaymentRequest } from '../types';

// The react-stripe-elements PaymentRequestButtonElement cannot have its
// paymentRequest updated once it has been rendered, so this is a custom one.
// See: https://github.com/stripe/react-stripe-elements/issues/284
export default function PaymentRequestButton( {
	paymentRequest,
	paymentType,
	disabled,
	disabledReason,
}: PaymentRequestButtonProps ) {
	const { __ } = useI18n();
	const { formStatus, setFormReady, setFormSubmitting } = useFormStatus();
	const onClick = ( event: MouseEvent ) => {
		event.persist();
		event.preventDefault();
		setFormSubmitting();
		if ( paymentRequest ) {
			paymentRequest.on( 'cancel', setFormReady );
			paymentRequest.show();
		}
	};
	if ( ! paymentRequest ) {
		disabled = true;
	}

	if ( formStatus === FormStatus.SUBMITTING ) {
		return (
			<Button disabled fullWidth>
				{ __( 'Completing your purchase' ) }
			</Button>
		);
	}
	if ( disabled && disabledReason ) {
		return (
			<Button disabled fullWidth>
				{ disabledReason }
			</Button>
		);
	}

	if ( paymentType === 'apple-pay' ) {
		return <ApplePayButton disabled={ disabled } onClick={ onClick } />;
	}
	return (
		<Button disabled={ disabled } onClick={ onClick } fullWidth>
			{ __( 'Select a payment card' ) }
		</Button>
	);
}

PaymentRequestButton.propTypes = {
	paymentRequest: PropTypes.object,
	paymentType: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
	disabledReason: PropTypes.string,
};

interface PaymentRequestButtonProps {
	paymentRequest?: StripePaymentRequest;
	paymentType: string;
	disabled?: boolean;
	disabledReason?: string;
}

const ApplePayButton = styled.button`
	-webkit-appearance: -apple-pay-button;
	-apple-pay-button-style: black;
	-apple-pay-button-type: plain;
	height: 38px;
	width: 100%;
	position: relative;

	&::after {
		content: '';
		position: ${ ( props ) => ( props.disabled ? 'absolute' : 'relative' ) };
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: #ccc;
		opacity: 0.7;

		.rtl & {
			right: 0;
			left: auto;
		}
	}
`;
