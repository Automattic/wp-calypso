/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import debugFactory from 'debug';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import { usePaymentMethod, usePaymentProcessors, useTransactionStatus } from '../public-api';
import { PaymentProcessorResponse, PaymentProcessorResponseType } from '../types';

const debug = debugFactory( 'composite-checkout:checkout-submit-button' );

export default function CheckoutSubmitButton( {
	className,
	disabled,
}: {
	className?: string;
	disabled?: boolean;
} ): JSX.Element | null {
	const {
		setTransactionComplete,
		setTransactionRedirecting,
		setTransactionError,
		setTransactionPending,
	} = useTransactionStatus();
	const paymentProcessors = usePaymentProcessors();
	const { __ } = useI18n();
	const redirectErrorMessage = __(
		'An error occurred while redirecting to the payment partner. Please try again or contact support.'
	);

	const onClick = useCallback(
		async ( paymentProcessorId: string, submitData: unknown ) => {
			debug( 'beginning payment processor onClick handler' );
			if ( ! paymentProcessors[ paymentProcessorId ] ) {
				throw new Error( `No payment processor found with key: ${ paymentProcessorId }` );
			}
			setTransactionPending();
			debug( 'calling payment processor function', paymentProcessorId );
			return paymentProcessors[ paymentProcessorId ]( submitData )
				.then( ( processorResponse: PaymentProcessorResponse ) => {
					debug( 'payment processor function response', processorResponse );
					if ( processorResponse.type === PaymentProcessorResponseType.REDIRECT ) {
						if ( ! processorResponse.payload ) {
							throw new Error( redirectErrorMessage );
						}
						setTransactionRedirecting( processorResponse.payload );
						return processorResponse;
					}
					if ( processorResponse.type === PaymentProcessorResponseType.SUCCESS ) {
						setTransactionComplete( processorResponse.payload );
						return processorResponse;
					}
					if ( processorResponse.type === PaymentProcessorResponseType.MANUAL ) {
						return processorResponse;
					}
					throw new Error(
						`Unknown payment processor response for processor "${ paymentProcessorId }"`
					);
				} )
				.catch( ( error: Error ) => {
					debug( 'payment processor function error', error );
					setTransactionError( error.message );
				} );
		},
		[
			redirectErrorMessage,
			paymentProcessors,
			setTransactionComplete,
			setTransactionPending,
			setTransactionRedirecting,
			setTransactionError,
		]
	);

	const paymentMethod = usePaymentMethod();
	if ( ! paymentMethod ) {
		return null;
	}
	const { submitButton } = paymentMethod;
	if ( ! submitButton ) {
		return null;
	}

	// We clone the element to add props
	const clonedSubmitButton = React.cloneElement( submitButton, { disabled, onClick } );
	return (
		<div className={ joinClasses( [ className, 'checkout-submit-button' ] ) }>
			{ clonedSubmitButton }
		</div>
	);
}
