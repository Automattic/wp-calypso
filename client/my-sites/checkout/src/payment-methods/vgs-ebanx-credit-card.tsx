/**
 * VGS Ebanx Credit Card Payment Method
 * Integrates VGS Collect with Composite Checkout
 */

import { Button } from '@automattic/composite-checkout';
import { __ } from '@wordpress/i18n';
import debugFactory from 'debug';
import { useEffect } from 'react';
import { VgsEbanxCreditCardForm } from '../components/vgs-ebanx-credit-card-form';
import { VgsEbanxCreditCardFormProvider } from '../components/vgs-ebanx-credit-card-form-provider';
import { createVgsEbanxPaymentMethodData } from '../lib/vgs-ebanx-payment-method-utils';
import type { ProcessPayment } from '@automattic/composite-checkout';
import type { VGS } from '@vgs/collect-js';

const debug = debugFactory( 'calypso:vgs-ebanx-payment-method' );

/**
 * Submit button component that integrates with VGS form
 * Uses VGS Collect hooks to access form response
 */
function VgsEbanxSubmitButton( {
	disabled,
	onClick,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
} ) {
	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; VgsEbanxSubmitButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	// Import useVGSCollectResponse inside the button component
	// This is a workaround since we can't access hooks from outside the provider
	const { useVGSCollectResponse } = require( '@vgs/collect-js-react' );
	const [ response ] = useVGSCollectResponse();

	/**
	 * When VGS form is submitted and we receive a response,
	 * process the payment with the tokenized data
	 */
	useEffect( () => {
		if ( response && response.data ) {
			const processVgsPayment = async () => {
				try {
					debug( 'VGS response received:', response );

					// Transform VGS tokens to Ebanx format
					const paymentData = createVgsEbanxPaymentMethodData(
						response.data as VGS.TokenizedCardData
					);

					debug( 'Transformed payment data:', paymentData );

					// Call the payment processor
					await onClick( paymentData );
				} catch ( error ) {
					debug( 'VGS Ebanx payment submission failed:', error );
					throw error;
				}
			};

			processVgsPayment();
		}
	}, [ response, onClick ] );

	return (
		<Button disabled={ disabled } type="submit">
			{ __( 'Pay with Card - VGS Ebanx', 'calypso' ) }
		</Button>
	);
}

export const VgsEbanxCreditCardPaymentMethod = () => {
	return {
		id: 'vgs-ebanx',
		paymentProcessorId: 'vgs-ebanx',
		label: (
			<div className="vgs-ebanx-payment-method-label">
				<span>{ __( 'Credit Card (Ebanx)', 'calypso' ) }</span>
			</div>
		),
		activeContent: (
			<VgsEbanxCreditCardFormProvider>
				<VgsEbanxCreditCardForm />
			</VgsEbanxCreditCardFormProvider>
		),
		submitButton: (
			<VgsEbanxCreditCardFormProvider>
				<VgsEbanxSubmitButton />
			</VgsEbanxCreditCardFormProvider>
		),
		getAriaLabel: ( localize: ( value: string ) => string ) => localize( 'Credit Card (Ebanx)' ),
	};
};
