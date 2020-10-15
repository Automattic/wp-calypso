/**
 * External dependencies
 */
import { useContext } from 'react';

/**
 * Internal dependencies
 */
import CheckoutContext from '../lib/checkout-context';
import {
	PaymentProcessorFunction,
	PaymentProcessorResponseData,
	PaymentProcessorSuccess,
	PaymentProcessorRedirect,
	PaymentProcessorManual,
} from '../types';

export function usePaymentProcessor( key: string ): PaymentProcessorFunction {
	const { paymentProcessors } = useContext( CheckoutContext );
	if ( ! paymentProcessors[ key ] ) {
		throw new Error( `No payment processor found with key: ${ key }` );
	}
	return paymentProcessors[ key ];
}

export function usePaymentProcessors(): Record< string, PaymentProcessorFunction > {
	const { paymentProcessors } = useContext( CheckoutContext );
	return paymentProcessors;
}

export function makeSuccessResponse(
	transaction: PaymentProcessorResponseData
): PaymentProcessorSuccess {
	return { type: 'SUCCESS', payload: transaction };
}

export function makeRedirectResponse( url: string ): PaymentProcessorRedirect {
	return { type: 'REDIRECT', payload: url };
}

export function makeManualResponse( payload: unknown ): PaymentProcessorManual {
	return { type: 'MANUAL', payload };
}
