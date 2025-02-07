import { Button, useFormStatus, FormStatus } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import { MouseEvent } from 'react';
import { GooglePayMark } from './google-pay-mark';
import type { PaymentRequest } from '@stripe/stripe-js';

// Disabling this rule to make migrating this to calypso easier with fewer changes
/* eslint-disable @typescript-eslint/no-use-before-define */

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
			<Button isBusy disabled fullWidth>
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
	if ( paymentType === 'google-pay' ) {
		// Google Pay branding does not have a disabled state so we will render a different button
		if ( disabled ) {
			return (
				<Button disabled fullWidth>
					{ __( 'Select a payment card' ) }
				</Button>
			);
		}
		return <GooglePayButton onClick={ onClick } />;
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
	paymentRequest?: PaymentRequest | null;
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

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		width: 100%;
	}
`;

const GooglePayButtonWrapper = styled.button`
	background-color: #000;
	border-radius: 4px;
	width: 100%;
	padding: 12px 24px 10px;
	position: relative;
	text-align: center;
	cursor: pointer;

	svg {
		height: 18px;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		width: 100%;
	}
`;

function GooglePayButton( {
	disabled,
	onClick,
}: {
	disabled?: boolean;
	onClick: ( event: MouseEvent ) => void;
} ) {
	return (
		<GooglePayButtonWrapper disabled={ disabled } onClick={ onClick }>
			<GooglePayMark fill="white" />
		</GooglePayButtonWrapper>
	);
}
