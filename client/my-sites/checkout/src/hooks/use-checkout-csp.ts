import debugFactory from 'debug';
import { useEffect } from 'react';

const debug = debugFactory( 'calypso:checkout-csp' );

/**
 * Simple hook to log that checkout has mounted with CSP
 * The actual navigation interception is handled globally by checkout-csp-navigation-interceptor
 */
export function useCheckoutCSP() {
	useEffect( () => {
		debug( 'Checkout component mounted - CSP headers should be present from server' );
		debug( 'Check Network tab for CSP headers on the checkout document request' );
	}, [] );
}
