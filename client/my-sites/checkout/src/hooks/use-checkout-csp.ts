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
			wrapped: nonce ? [ 'self', `nonce-${ nonce }` ] : [ 'self' ],
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
				// Surveys
				'https://surveys-static-prd.survicate-cdn.com',
				'https://survey.survicate.com',
				// Support
				'https://cdn.smooch.io',
				'https://static.zdassets.com',
				'https://ekr.zdassets.com',
				'https://*.zendesk.com',
				// Fonts
				'https://use.typekit.net',
			],
		},
		// Style sources
		'style-src': {
			wrapped: [ 'self', 'unsafe-inline' ],
			raw: [
				'https://fonts.googleapis.com',
				'https://s0.wp.com',
				// Surveys
				'https://surveys-static-prd.survicate-cdn.com',
				// Support chat
				'https://cdn.smooch.io',
			],
		},
		// Connect sources for API calls
		'connect-src': {
			wrapped: [ 'self' ],
			raw: [
				'https://api.stripe.com',
				'https://public-api.wordpress.com',
				'https://widgets.wp.com',
				'https://wpcom.com',
				// Support chat
				'wss://*.zendesk.com',
				'https://*.zendesk.com',
				'https://wpcom.zendesk.com',
				'https://*.smooch.io',
				'https://api.smooch.io',
				'https://ekr.zdassets.com',
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
		// Note: frame-ancestors is ignored in meta tags, must be set via header
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
export function useCheckoutCSP(): { cspDirectives: string } {
	// Try to get nonce from existing script tags (should be set server-side)
	const nonce = useMemo( () => {
		const scriptWithNonce = document.querySelector( 'script[nonce]' );
		if ( scriptWithNonce ) {
			const nonceValue = scriptWithNonce.getAttribute( 'nonce' );
			return nonceValue || '';
		}
		// Don't generate client-side nonce as it won't work with CSP
		return '';
	}, [] );

	const cspDirectives = useMemo( () => generateMetaCSPDirectives( nonce ), [ nonce ] );

	useEffect( () => {
		debug( 'Checkout component mounted - CSP meta directives generated' );
		debug( 'CSP Directives:', cspDirectives );
		debug( 'Nonce found:', nonce ? 'yes' : 'no' );
		debug( 'Check Network tab for base CSP headers on the checkout document request' );
	}, [ cspDirectives, nonce ] );

	return { cspDirectives };
}
