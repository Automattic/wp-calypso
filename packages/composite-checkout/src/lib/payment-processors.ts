/**
 * External dependencies
 */
import { useContext } from 'react';

/**
 * Internal dependencies
 */
import CheckoutContext from '../lib/checkout-context';
import { PaymentProcessorFunction } from '../types';

export function usePaymentProcessor( key: string ): PaymentProcessorFunction {
	const { paymentProcessors } = useContext( CheckoutContext );
	if ( ! paymentProcessors[ key ] ) {
		throw new Error( `No payment processor found with key: ${ key }` );
	}
	return paymentProcessors[ key ];
}
