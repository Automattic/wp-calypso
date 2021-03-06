import { useContext } from 'react';
import CheckoutContext from '../lib/checkout-context';

export default function useEvents() {
	const { onEvent } = useContext( CheckoutContext );
	if ( ! onEvent ) {
		throw new Error( 'useEvents can only be used inside a CheckoutProvider' );
	}
	return onEvent;
}
