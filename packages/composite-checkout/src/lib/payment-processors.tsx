import { useContext, createContext, useMemo } from 'react';
import {
	PaymentProcessorProp,
	PaymentProcessorFunction,
	PaymentProcessorResponseData,
	PaymentProcessorSuccess,
	PaymentProcessorRedirect,
	PaymentProcessorManual,
	PaymentProcessorError,
	PaymentProcessorResponseType,
} from '../types';
import type { ReactNode } from 'react';

export function usePaymentProcessor( key: string ): PaymentProcessorFunction {
	const { paymentProcessors } = useContext( PaymentProcessorContext );
	if ( ! paymentProcessors[ key ] ) {
		throw new Error( `No payment processor found with key: ${ key }` );
	}
	return paymentProcessors[ key ];
}

export function usePaymentProcessors(): Record< string, PaymentProcessorFunction > {
	const { paymentProcessors } = useContext( PaymentProcessorContext );
	return paymentProcessors;
}

export function makeErrorResponse( url: string ): PaymentProcessorError {
	return { type: PaymentProcessorResponseType.ERROR, payload: url };
}

export function makeSuccessResponse(
	transaction: PaymentProcessorResponseData
): PaymentProcessorSuccess {
	return { type: PaymentProcessorResponseType.SUCCESS, payload: transaction };
}

export function makeRedirectResponse( url: string ): PaymentProcessorRedirect {
	return { type: PaymentProcessorResponseType.REDIRECT, payload: url };
}

export function makeManualResponse( payload: unknown ): PaymentProcessorManual {
	return { type: PaymentProcessorResponseType.MANUAL, payload };
}

interface PaymentProcessorContext {
	paymentProcessors: PaymentProcessorProp;
}

const defaultPaymentProcessorContext: PaymentProcessorContext = {
	paymentProcessors: {},
};

export const PaymentProcessorContext = createContext( defaultPaymentProcessorContext );

export function PaymentProcessorProvider( {
	paymentProcessors,
	children,
}: {
	paymentProcessors: PaymentProcessorProp;
	children: ReactNode;
} ): JSX.Element {
	const value = useMemo( () => ( { paymentProcessors } ), [ paymentProcessors ] );
	return (
		<PaymentProcessorContext.Provider value={ value }>
			{ children }
		</PaymentProcessorContext.Provider>
	);
}
