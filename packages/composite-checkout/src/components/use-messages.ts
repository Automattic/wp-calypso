/**
 * External dependencies
 */
import { useContext } from 'react';

/**
 * Internal dependencies
 */
import CheckoutContext from '../lib/checkout-context';

export default function useMessages() {
	const { showErrorMessage, showInfoMessage, showSuccessMessage } = useContext( CheckoutContext );
	if ( ! showErrorMessage || ! showInfoMessage || ! showSuccessMessage ) {
		throw new Error( 'useMessages can only be used inside a CheckoutProvider' );
	}
	return { showErrorMessage, showInfoMessage, showSuccessMessage };
}
