/**
 * External dependencies
 */
import { useContext } from 'react';

/**
 * Internal dependencies
 */
import CheckoutContext from '../lib/checkout-context';

export function usePaymentProcessor( key ) {
	const { paymentProcessors } = useContext( CheckoutContext );
	return paymentProcessors[ key ];
}
