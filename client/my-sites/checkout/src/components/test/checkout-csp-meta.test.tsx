/**
 * @jest-environment jsdom
 */
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { CheckoutCSPMeta } from '../checkout-csp-meta';

describe( 'CheckoutCSPMeta', () => {
	beforeEach( () => {
		// Clear any existing meta tags before each test
		document.querySelectorAll( 'meta[data-checkout-csp="true"]' ).forEach( ( tag ) => {
			tag.remove();
		} );
	} );

	afterEach( () => {
		// Clean up after each test
		document.querySelectorAll( 'meta[data-checkout-csp="true"]' ).forEach( ( tag ) => {
			tag.remove();
		} );
	} );

	it( 'should not add meta tag when cspDirectives is not provided', () => {
		const { unmount } = render( <CheckoutCSPMeta /> );

		const metaTags = document.querySelectorAll( 'meta[data-checkout-csp="true"]' );
		expect( metaTags ).toHaveLength( 0 );

		unmount();
	} );

	it( 'should not add meta tag when cspDirectives is empty string', () => {
		const { unmount } = render( <CheckoutCSPMeta cspDirectives="" /> );

		const metaTags = document.querySelectorAll( 'meta[data-checkout-csp="true"]' );
		expect( metaTags ).toHaveLength( 0 );

		unmount();
	} );

	it( 'should add CSP meta tag when cspDirectives is provided', async () => {
		const cspDirectives = "script-src 'self' https://js.stripe.com; frame-src 'self'";
		const { unmount } = render( <CheckoutCSPMeta cspDirectives={ cspDirectives } /> );

		await waitFor( () => {
			const metaTags = document.querySelectorAll( 'meta[data-checkout-csp="true"]' );
			expect( metaTags ).toHaveLength( 1 );
		} );

		const metaTag = document.querySelector( 'meta[data-checkout-csp="true"]' ) as HTMLMetaElement;
		expect( metaTag ).toBeTruthy();
		expect( metaTag.httpEquiv ).toBe( 'Content-Security-Policy' );
		expect( metaTag.content ).toBe( cspDirectives );

		unmount();
	} );

	it( 'should remove CSP meta tag when component unmounts', async () => {
		const cspDirectives = "script-src 'self' https://js.stripe.com";
		const { unmount } = render( <CheckoutCSPMeta cspDirectives={ cspDirectives } /> );

		// Wait for meta tag to be added
		await waitFor( () => {
			const metaTags = document.querySelectorAll( 'meta[data-checkout-csp="true"]' );
			expect( metaTags ).toHaveLength( 1 );
		} );

		// Unmount the component
		unmount();

		// Verify meta tag was removed
		const metaTags = document.querySelectorAll( 'meta[data-checkout-csp="true"]' );
		expect( metaTags ).toHaveLength( 0 );
	} );

	it( 'should update CSP meta tag when cspDirectives prop changes', async () => {
		const initialDirectives = "script-src 'self'";
		const updatedDirectives = "script-src 'self' https://js.stripe.com";

		const { rerender } = render( <CheckoutCSPMeta cspDirectives={ initialDirectives } /> );

		// Verify initial meta tag
		await waitFor( () => {
			const metaTag = document.querySelector( 'meta[data-checkout-csp="true"]' ) as HTMLMetaElement;
			expect( metaTag ).toBeTruthy();
			expect( metaTag.content ).toBe( initialDirectives );
		} );

		// Update the prop
		rerender( <CheckoutCSPMeta cspDirectives={ updatedDirectives } /> );

		// Verify updated meta tag
		await waitFor( () => {
			const metaTags = document.querySelectorAll( 'meta[data-checkout-csp="true"]' );
			expect( metaTags ).toHaveLength( 1 ); // Should still only have one tag
			const metaTag = metaTags[ 0 ] as HTMLMetaElement;
			expect( metaTag.content ).toBe( updatedDirectives );
		} );
	} );

	it( 'should handle multiple mount/unmount cycles correctly', async () => {
		const cspDirectives = "script-src 'self'";

		// First mount
		const { unmount: unmount1 } = render( <CheckoutCSPMeta cspDirectives={ cspDirectives } /> );
		await waitFor( () => {
			expect( document.querySelectorAll( 'meta[data-checkout-csp="true"]' ) ).toHaveLength( 1 );
		} );
		unmount1();
		expect( document.querySelectorAll( 'meta[data-checkout-csp="true"]' ) ).toHaveLength( 0 );

		// Second mount
		const { unmount: unmount2 } = render( <CheckoutCSPMeta cspDirectives={ cspDirectives } /> );
		await waitFor( () => {
			expect( document.querySelectorAll( 'meta[data-checkout-csp="true"]' ) ).toHaveLength( 1 );
		} );
		unmount2();
		expect( document.querySelectorAll( 'meta[data-checkout-csp="true"]' ) ).toHaveLength( 0 );
	} );

	it( 'should include all required CSP directives for PCI compliance', async () => {
		const pciCompliantDirectives = [
			"script-src 'self' 'nonce-test123' https://js.stripe.com https://checkout.stripe.com",
			"frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
			"form-action 'self' https://checkout.stripe.com",
			"connect-src 'self' https://api.stripe.com",
		].join( '; ' );

		const { unmount } = render( <CheckoutCSPMeta cspDirectives={ pciCompliantDirectives } /> );

		await waitFor( () => {
			const metaTag = document.querySelector( 'meta[data-checkout-csp="true"]' ) as HTMLMetaElement;
			expect( metaTag ).toBeTruthy();
			expect( metaTag.content ).toContain( "script-src 'self'" );
			expect( metaTag.content ).toContain( 'https://js.stripe.com' );
			expect( metaTag.content ).toContain( 'https://checkout.stripe.com' );
			expect( metaTag.content ).toContain( "frame-src 'self'" );
			expect( metaTag.content ).toContain( "form-action 'self'" );
			expect( metaTag.content ).toContain( "connect-src 'self'" );
			expect( metaTag.content ).toContain( 'https://api.stripe.com' );
		} );

		unmount();
	} );

	it( 'should clean up all checkout CSP meta tags on unmount even if multiple exist', async () => {
		// Manually add an extra meta tag to simulate edge case
		const extraTag = document.createElement( 'meta' );
		extraTag.httpEquiv = 'Content-Security-Policy';
		extraTag.content = 'test-content';
		extraTag.setAttribute( 'data-checkout-csp', 'true' );
		document.head.appendChild( extraTag );

		const cspDirectives = "script-src 'self'";
		const { unmount } = render( <CheckoutCSPMeta cspDirectives={ cspDirectives } /> );

		await waitFor( () => {
			// Should have 2 tags now (the manual one and the component one)
			expect( document.querySelectorAll( 'meta[data-checkout-csp="true"]' ) ).toHaveLength( 2 );
		} );

		unmount();

		// All checkout CSP tags should be removed
		expect( document.querySelectorAll( 'meta[data-checkout-csp="true"]' ) ).toHaveLength( 0 );
	} );
} );
