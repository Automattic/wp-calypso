/**
 * VGS Ebanx Credit Card Payment Method
 * Integrates VGS Collect with Composite Checkout
 */

import { Button } from '@automattic/composite-checkout';
import { __ } from '@wordpress/i18n';
import debugFactory from 'debug';
import { useEffect, useState } from 'react';
import { VgsEbanxCreditCardForm } from '../components/vgs-ebanx-credit-card-form';
import { createVgsEbanxPaymentMethodData } from '../lib/vgs-ebanx-payment-method-utils';
import type { ProcessPayment } from '@automattic/composite-checkout';
import type { VGS } from '@vgs/collect-js';

const debug = debugFactory( 'calypso:vgs-ebanx-payment-method' );

/**
 * Enhanced submit button component with manual token generation
 * Provides better control over when tokens are generated and improved error handling
 */
function VgsEbanxSubmitButton( {
	disabled,
	onClick,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
} ) {
	const [ isTokenizing, setIsTokenizing ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );
	const [ theResponse, setTheResponse ] = useState< string | null >( null );

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; VgsEbanxSubmitButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	// Import VGS hooks inside the button component
	// This is a workaround since we can't access hooks from outside the provider
	const { useVGSCollectResponse, useVGSCollectFormInstance } = require( '@vgs/collect-js-react' );
	const [ response ] = useVGSCollectResponse();
	const [ form ] = useVGSCollectFormInstance();

	/**
	 * Handle manual form submission with explicit token generation
	 */
	const handleSubmit = async ( event: React.FormEvent ) => {
		event.preventDefault();
		console.log( 'handleSubmit' );

		if ( ! form ) {
			console.log( 'Payment form not ready.' );
			setError( __( 'Payment form not ready. Please try again.', 'calypso' ) );
			return;
		}

		console.log( 'Payment form ready.' );
		setIsTokenizing( true );
		setError( null );
		console.log( 'Payment form ready 2.' );

		try {
			console.log( 'Manually triggering VGS tokenization...' );
			// Manually trigger VGS tokenization
			form.submit(
				'/post',
				{
					data: ( formValues: any ) => {
						return {
							card_number: formValues[ 'card_number' ],
							card_cvc: formValues[ 'card_cvc' ],
							card_exp: formValues[ 'card_exp' ],
							card_holder: formValues[ 'card_holder' ],
						};
					},
				},
				( status: any, data: any ) => {
					console.log( 'status', status );
					console.log( 'data', data );
					setTheResponse(
						JSON.stringify(
							{
								status,
								data,
							},
							null,
							4
						)
					);
				}
			);
			console.log( 'data sent to VGS' );
		} catch ( error ) {
			setIsTokenizing( false );
			setError( __( 'Failed to process payment. Please check your card details.', 'calypso' ) );
			console.log( 'VGS form submission failed:', error );
		}
	};

	/**
	 * When VGS form is submitted and we receive a response,
	 * process the payment with the tokenized data
	 */
	useEffect( () => {
		console.log( 'theResponse', theResponse );
		console.log( 'response', response );
		if ( response && response.data && isTokenizing ) {
			console.log( 'VGS response received:', response );
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
					setIsTokenizing( false );
				} catch ( error ) {
					setIsTokenizing( false );
					setError( __( 'Payment processing failed. Please try again.', 'calypso' ) );
					debug( 'VGS Ebanx payment submission failed:', error );
				}
			};

			processVgsPayment();
		}
	}, [ response, onClick, isTokenizing ] );

	return (
		<div>
			<Button
				disabled={ disabled || isTokenizing }
				onClick={ handleSubmit }
				buttonType="primary"
				isBusy={ isTokenizing }
				fullWidth
			>
				{ isTokenizing
					? __( 'Processing Payment...', 'calypso' )
					: __( 'Pay with Card - VGS Ebanx', 'calypso' ) }
			</Button>
			{ error && (
				<div
					className="vgs-error-message"
					style={ { color: '#d63638', marginTop: '8px', fontSize: '14px' } }
				>
					{ error }
				</div>
			) }
		</div>
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
		activeContent: <VgsEbanxCreditCardForm />,
		submitButton: <VgsEbanxSubmitButton />,
		getAriaLabel: ( localize: ( value: string ) => string ) => localize( 'Credit Card (Ebanx)' ),
	};
};
