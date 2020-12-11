/**
 * External dependencies
 */
import React, { useCallback, useMemo } from 'react';
import debugFactory from 'debug';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import { useFormStatus, FormStatus } from '../public-api';
import CheckoutErrorBoundary from './checkout-error-boundary';
import { usePaymentMethod, usePaymentProcessors, useTransactionStatus } from '../public-api';
import {
	PaymentProcessorResponse,
	PaymentProcessorResponseType,
	SetTransactionComplete,
	SetTransactionRedirecting,
} from '../types';

const debug = debugFactory( 'composite-checkout:checkout-submit-button' );

export default function CheckoutSubmitButton( {
	className,
	disabled,
	onLoadError,
}: {
	className?: string;
	disabled?: boolean;
	onLoadError?: ( error: string ) => void;
} ): JSX.Element | null {
	const { formStatus } = useFormStatus();
	const { __ } = useI18n();
	const isDisabled = disabled || formStatus !== FormStatus.READY;
	const onClick = useCreatePaymentProcessorOnClick();

	const paymentMethod = usePaymentMethod();
	if ( ! paymentMethod ) {
		return null;
	}
	const { submitButton } = paymentMethod;
	if ( ! submitButton ) {
		return null;
	}

	// We clone the element to add props
	const clonedSubmitButton = React.cloneElement( submitButton, { disabled: isDisabled, onClick } );
	return (
		<CheckoutErrorBoundary
			errorMessage={ __( 'There was a problem with the submit button.' ) }
			onError={ onLoadError }
		>
			<div className={ joinClasses( [ className, 'checkout-submit-button' ] ) }>
				{ clonedSubmitButton }
			</div>
		</CheckoutErrorBoundary>
	);
}

function useCreatePaymentProcessorOnClick() {
	const paymentProcessors = usePaymentProcessors();
	const { setTransactionPending } = useTransactionStatus();
	const handlePaymentProcessorPromise = useHandlePaymentProcessorResponse();

	return useCallback(
		async ( paymentProcessorId: string, submitData: unknown ) => {
			debug( 'beginning payment processor onClick handler' );
			if ( ! paymentProcessors[ paymentProcessorId ] ) {
				throw new Error( `No payment processor found with key: ${ paymentProcessorId }` );
			}
			setTransactionPending();
			debug( 'calling payment processor function', paymentProcessorId );
			return handlePaymentProcessorPromise(
				paymentProcessorId,
				paymentProcessors[ paymentProcessorId ]( submitData )
			);
		},
		[ handlePaymentProcessorPromise, paymentProcessors, setTransactionPending ]
	);
}

function useHandlePaymentProcessorResponse() {
	const { __ } = useI18n();
	const redirectErrorMessage = useMemo(
		() =>
			__(
				'An error occurred while redirecting to the payment partner. Please try again or contact support.'
			),
		[ __ ]
	);
	const {
		setTransactionComplete,
		setTransactionRedirecting,
		setTransactionError,
	} = useTransactionStatus();

	return useCallback(
		async (
			paymentProcessorId: string,
			processorPromise: Promise< PaymentProcessorResponse >
		): Promise< PaymentProcessorResponse | void > => {
			return processorPromise
				.then( ( response ) =>
					handlePaymentProcessorResponse( response, paymentProcessorId, redirectErrorMessage, {
						setTransactionRedirecting,
						setTransactionComplete,
					} )
				)
				.catch( ( error: Error ) => {
					setTransactionError( error.message );
				} );
		},
		[ redirectErrorMessage, setTransactionError, setTransactionComplete, setTransactionRedirecting ]
	);
}

async function handlePaymentProcessorResponse(
	processorResponse: PaymentProcessorResponse,
	paymentProcessorId: string,
	redirectErrorMessage: string,
	{
		setTransactionRedirecting,
		setTransactionComplete,
	}: {
		setTransactionRedirecting: SetTransactionRedirecting;
		setTransactionComplete: SetTransactionComplete;
	}
): Promise< PaymentProcessorResponse > {
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
	throw new Error( `Unknown payment processor response for processor "${ paymentProcessorId }"` );
}
