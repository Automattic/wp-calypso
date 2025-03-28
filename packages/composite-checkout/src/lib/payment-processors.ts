import { useContext } from 'react';
import {
	PaymentProcessorFunction,
	PaymentProcessorResponseData,
	PaymentProcessorSuccess,
	PaymentProcessorRedirect,
	PaymentProcessorError,
	PaymentProcessorResponseType,
} from '../types';
import { PaymentMethodProviderContext } from './payment-method-provider-context';

export function usePaymentProcessor( key: string ): PaymentProcessorFunction {
	const { paymentProcessors } = useContext( PaymentMethodProviderContext );
	if ( ! paymentProcessors[ key ] ) {
		throw new Error( `No payment processor found with key: ${ key }` );
	}
	return paymentProcessors[ key ];
}

export function usePaymentProcessors(): Record< string, PaymentProcessorFunction > {
	const { paymentProcessors } = useContext( PaymentMethodProviderContext );
	return paymentProcessors;
}

export function makeErrorResponse( errorMessage: string ): PaymentProcessorError {
	return { type: PaymentProcessorResponseType.ERROR, payload: errorMessage };
}

export function isErrorResponse( value: unknown ): boolean {
	return (
		!! value &&
		typeof value === 'object' &&
		'type' in value &&
		value.type === PaymentProcessorResponseType.ERROR &&
		'payload' in value
	);
}

export function makeSuccessResponse(
	transaction: PaymentProcessorResponseData
): PaymentProcessorSuccess {
	return { type: PaymentProcessorResponseType.SUCCESS, payload: transaction };
}

export function makeRedirectResponse( url: string ): PaymentProcessorRedirect {
	return { type: PaymentProcessorResponseType.REDIRECT, payload: url };
}
