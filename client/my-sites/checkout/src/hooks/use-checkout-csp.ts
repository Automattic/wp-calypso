import debugFactory from 'debug';
import { useEffect, useMemo } from 'react';

const debug = debugFactory( 'calypso:checkout-csp' );

/**
 * Generate additional CSP directives for meta tags
 * These provide the specific restrictions for checkout pages
 * @param {string} nonce - The nonce to use for inline scripts
 * @returns {string} The additional CSP policy string for meta tags
 */
function generateMetaCSPDirectives( nonce: string ): string {
	const isDevelopment =
		window.location.hostname === 'calypso.localhost' || window.location.hostname === 'localhost';

	const directives: Record< string, { wrapped?: string[]; raw?: string[] } > = {
		// More specific script sources for checkout
		'script-src': {
			wrapped: [ 'self', `nonce-${ nonce }` ],
			raw: [
				// Payment processors
				'https://js.stripe.com',
				'https://checkout.stripe.com',
				'https://www.paypal.com',
				'https://www.paypalobjects.com',
				// Fraud prevention
				'https://www.google.com/recaptcha/',
				'https://www.gstatic.com/recaptcha/',
				'https://cdn.siftscience.com',
				// Analytics
				'https://stats.wp.com',
			],
		},
		// Style sources
		'style-src': {
			wrapped: [ 'self', 'unsafe-inline' ],
			raw: [ 'https://fonts.googleapis.com', 'https://s0.wp.com' ],
		},
		// Connect sources for API calls
		'connect-src': {
			wrapped: [ 'self' ],
			raw: [
				'https://api.stripe.com',
				'https://public-api.wordpress.com',
				'https://widgets.wp.com',
				'https://wpcom.com',
			],
		},
		// Frame sources for payment iframes
		'frame-src': {
			wrapped: [ 'self' ],
			raw: [
				'https://js.stripe.com',
				'https://checkout.stripe.com',
				'https://hooks.stripe.com',
				'https://www.paypal.com',
				'https://www.google.com/recaptcha/',
				'https://recaptcha.google.com',
				'https://public-api.wordpress.com',
			],
		},
		// Critical for PCI DSS 6.4.3 - Restrict form actions
		'form-action': {
			wrapped: [ 'self' ],
			raw: [ 'https://checkout.stripe.com' ],
		},
		// Critical for PCI DSS 6.4.3 - Prevent clickjacking
		'frame-ancestors': {
			wrapped: [ 'none' ],
		},
	};

	if ( isDevelopment ) {
		// Add 'unsafe-eval' to script-src for webpack
		directives[ 'script-src' ].wrapped?.push( 'unsafe-eval' );

		// Add HTTP versions for development
		const httpDomains = [ 'stats.wp.com', 'pixel.wp.com', 's0.wp.com', 's1.wp.com' ];
		httpDomains.forEach( ( domain ) => {
			if (
				directives[ 'script-src' ] &&
				directives[ 'script-src' ].raw?.includes( `https://${ domain }` )
			) {
				directives[ 'script-src' ].raw?.push( `http://${ domain }` );
			}
			if (
				directives[ 'connect-src' ] &&
				directives[ 'connect-src' ].raw?.includes( `https://${ domain }` )
			) {
				directives[ 'connect-src' ].raw?.push( `http://${ domain }` );
			}
		} );
	}

	const cspString = Object.entries( directives )
		.map( ( [ key, value ] ) => {
			const wrappedItems = ( value.wrapped ?? [] ).map( ( item ) => `'${ item }'` );
			const rawItems = value.raw ?? [];
			const allExpressions = [ ...wrappedItems, ...rawItems ].join( ' ' );
			return `${ key } ${ allExpressions }`;
		} )
		.join( '; ' );

	return cspString;
}

/**
 * Hook to manage checkout CSP directives
 * Returns the CSP directives string and nonce to be used in the CheckoutCSPMeta component
 */
export function useCheckoutCSP(): { cspDirectives: string; nonce: string } {
	// Generate a nonce for this session (in production, this should come from the server)
	const nonce = useMemo( () => {
		// Try to get nonce from existing script tags
		const scriptWithNonce = document.querySelector( 'script[nonce]' );
		if ( scriptWithNonce ) {
			return scriptWithNonce.getAttribute( 'nonce' ) || '';
		}

		// Fallback: generate a client-side nonce (less secure, but better than nothing)
		const array = new Uint8Array( 16 );
		crypto.getRandomValues( array );
		return Array.from( array, ( byte ) => byte.toString( 16 ).padStart( 2, '0' ) ).join( '' );
	}, [] );

	const cspDirectives = useMemo( () => generateMetaCSPDirectives( nonce ), [ nonce ] );

	useEffect( () => {
		debug( 'Checkout component mounted - CSP meta directives generated' );
		debug( 'CSP Directives:', cspDirectives );
		debug( 'Nonce:', nonce );
		debug( 'Check Network tab for base CSP headers on the checkout document request' );
	}, [ cspDirectives, nonce ] );

	return { cspDirectives, nonce };
}
