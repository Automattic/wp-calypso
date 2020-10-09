/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import { usePaymentMethod, usePaymentProcessors, useTransactionStatus } from '../public-api';
import { PaymentProcessorResponse } from '../types';

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

	const onClick = useCallback(
		( paymentProcessorId: string, submitData: unknown ) => {
			debug( 'beginning payment processor onClick handler' );
			if ( ! paymentProcessors[ paymentProcessorId ] ) {
				throw new Error( `No payment processor found with key: ${ paymentProcessorId }` );
			}
			setTransactionPending();
			debug( 'calling payment processor function', paymentProcessorId );
			return paymentProcessors[ paymentProcessorId ]( submitData )
				.then( ( processorResponse: PaymentProcessorResponse ) => {
					debug( 'payment processor function response', processorResponse );
					if ( processorResponse.type === 'REDIRECT' ) {
						setTransactionRedirecting( processorResponse.payload );
						return;
					}
					if ( processorResponse.type === 'SUCCESS' ) {
						setTransactionComplete( processorResponse.payload );
						return;
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
