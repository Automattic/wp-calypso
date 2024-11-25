import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useCallback, useMemo, useState } from 'react';
import InvalidPaymentProcessorResponseError from '../lib/invalid-payment-processor-response-error';
import { usePaymentProcessors, useTransactionStatus } from '../public-api';
import {
	PaymentProcessorResponse,
	PaymentProcessorResponseType,
	SetTransactionComplete,
	SetTransactionRedirecting,
	ProcessPayment,
	SetTransactionError,
} from '../types';

const debug = debugFactory( 'composite-checkout:use-create-payment-processor-on-click' );

export default function useProcessPayment( paymentProcessorId: string ): ProcessPayment {
	const paymentProcessors = usePaymentProcessors();
	const { setTransactionPending } = useTransactionStatus();
	const handlePaymentProcessorPromise = useHandlePaymentProcessorResponse();

	return useCallback(
		async ( submitData ) => {
			debug( 'beginning payment processor onClick handler' );
			if ( ! paymentProcessors[ paymentProcessorId ] ) {
				throw new Error( `No payment processor found with key: ${ paymentProcessorId }` );
			}
			setTransactionPending();
			debug( 'calling payment processor function', paymentProcessorId );
			const response = paymentProcessors[ paymentProcessorId ]( submitData );
			return handlePaymentProcessorPromise( paymentProcessorId, response );
		},
		[ paymentProcessorId, handlePaymentProcessorPromise, paymentProcessors, setTransactionPending ]
	);
}

export function useHandlePaymentProcessorResponse() {
	const { __ } = useI18n();
	const redirectErrorMessage = useMemo(
		() =>
			__(
				'An error occurred while redirecting to the payment partner. Please try again or contact support.'
			),
		[ __ ]
	);
	const { setTransactionComplete, setTransactionRedirecting, setTransactionError } =
		useTransactionStatus();

	// processPayment may throw an error, but because it's an async function,
	// that error will not trigger any React error boundaries around this
	// component (error boundaries only catch errors that occur during render).
	// Since we want to know about processing errors, we can cause an error to
	// occur during render of this button if processPayment throws an error using
	// the below technique. See
	// https://github.com/facebook/react/issues/14981#issuecomment-468460187
	const [ , setErrorState ] = useState();

	return useCallback(
		async (
			paymentProcessorId: string,
			processorPromise: Promise< PaymentProcessorResponse >
		): Promise< PaymentProcessorResponse > => {
			return processorPromise
				.then( ( response ) =>
					handlePaymentProcessorResponse( response, paymentProcessorId, redirectErrorMessage, {
						setTransactionRedirecting,
						setTransactionComplete,
						setTransactionError,
					} )
				)
				.catch( ( error: Error ) => {
					setTransactionError( error.message );
					// See note above about transforming an async error into a render-time error
					setErrorState( () => {
						throw error;
					} );
					throw error;
				} );
		},
		[ redirectErrorMessage, setTransactionError, setTransactionComplete, setTransactionRedirecting ]
	);
}

async function handlePaymentProcessorResponse(
	rawResponse: unknown,
	paymentProcessorId: string,
	redirectErrorMessage: string,
	{
		setTransactionRedirecting,
		setTransactionComplete,
		setTransactionError,
	}: {
		setTransactionRedirecting: SetTransactionRedirecting;
		setTransactionComplete: SetTransactionComplete;
		setTransactionError: SetTransactionError;
	}
): Promise< PaymentProcessorResponse > {
	debug( 'payment processor function response', rawResponse );
	const isValid = validateProcessorResponse( rawResponse );
	if ( ! isValid ) {
		throw new InvalidPaymentProcessorResponseError( paymentProcessorId );
	}
	const processorResponse = rawResponse as PaymentProcessorResponse;
	if ( processorResponse.type === PaymentProcessorResponseType.ERROR ) {
		if ( ! processorResponse.payload ) {
			processorResponse.payload = 'Unknown transaction failure';
		}
		setTransactionError( processorResponse.payload );
		return processorResponse;
	}
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
	throw new InvalidPaymentProcessorResponseError( paymentProcessorId );
}

function validateProcessorResponse( response: unknown ): response is PaymentProcessorResponse {
	const processorResponse = response as PaymentProcessorResponse;
	if ( ! processorResponse || ! processorResponse.type ) {
		return false;
	}
	return true;
}
