import { useEffect } from 'react';

interface CheckoutCSPMetaProps {
	cspDirectives?: string;
}

/**
 * Component to inject additional CSP directives via meta tags for checkout pages
 * This enhances the base CSP header with more specific restrictions
 */
export function CheckoutCSPMeta( { cspDirectives }: CheckoutCSPMetaProps ) {
	useEffect( () => {
		if ( ! cspDirectives || typeof document === 'undefined' ) {
			return;
		}

		// Create meta tag for additional CSP directives
		const metaTag = document.createElement( 'meta' );
		metaTag.httpEquiv = 'Content-Security-Policy';
		metaTag.content = cspDirectives;
		metaTag.setAttribute( 'data-checkout-csp', 'true' );

		// Add to document head
		document.head.appendChild( metaTag );

		// Cleanup function to remove the meta tag when component unmounts
		return () => {
			// Remove all checkout CSP meta tags
			const existingTags = document.querySelectorAll( 'meta[data-checkout-csp="true"]' );
			existingTags.forEach( ( tag ) => tag.remove() );
		};
	}, [ cspDirectives ] );

	return null;
}
