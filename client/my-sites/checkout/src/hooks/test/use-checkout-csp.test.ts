/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useCheckoutCSP } from '../use-checkout-csp';

describe( 'useCheckoutCSP', () => {
	let originalLocation: Location;

	beforeEach( () => {
		// Save original location
		originalLocation = window.location;

		// Clear any existing script tags with nonce
		document.querySelectorAll( 'script[nonce]' ).forEach( ( tag ) => {
			tag.removeAttribute( 'nonce' );
		} );
	} );

	afterEach( () => {
		// Restore original location
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
		} );

		// Clean up
		document.querySelectorAll( 'script[nonce]' ).forEach( ( tag ) => {
			tag.removeAttribute( 'nonce' );
		} );
	} );

	it( 'should return CSP directives string', () => {
		const { result } = renderHook( () => useCheckoutCSP() );

		expect( result.current.cspDirectives ).toBeDefined();
		expect( typeof result.current.cspDirectives ).toBe( 'string' );
		expect( result.current.cspDirectives.length ).toBeGreaterThan( 0 );
	} );

	it( 'should include required CSP directive types', () => {
		const { result } = renderHook( () => useCheckoutCSP() );
		const { cspDirectives } = result.current;

		// Check for required CSP directive types
		expect( cspDirectives ).toContain( 'script-src' );
		expect( cspDirectives ).toContain( 'style-src' );
		expect( cspDirectives ).toContain( 'connect-src' );
		expect( cspDirectives ).toContain( 'frame-src' );
		expect( cspDirectives ).toContain( 'form-action' );
	} );

	it( 'should include payment processor domains for PCI compliance', () => {
		const { result } = renderHook( () => useCheckoutCSP() );
		const { cspDirectives } = result.current;

		// Stripe domains
		expect( cspDirectives ).toContain( 'https://js.stripe.com' );
		expect( cspDirectives ).toContain( 'https://checkout.stripe.com' );
		expect( cspDirectives ).toContain( 'https://api.stripe.com' );

		// PayPal domains
		expect( cspDirectives ).toContain( 'https://www.paypal.com' );
		expect( cspDirectives ).toContain( 'https://www.paypalobjects.com' );
	} );

	it( 'should include fraud prevention domains', () => {
		const { result } = renderHook( () => useCheckoutCSP() );
		const { cspDirectives } = result.current;

		// Google reCAPTCHA
		expect( cspDirectives ).toContain( 'https://www.google.com/recaptcha/' );
		expect( cspDirectives ).toContain( 'https://www.gstatic.com/recaptcha/' );

		// Sift Science
		expect( cspDirectives ).toContain( 'https://cdn.siftscience.com' );
	} );

	it( 'should include analytics domains', () => {
		const { result } = renderHook( () => useCheckoutCSP() );
		const { cspDirectives } = result.current;

		expect( cspDirectives ).toContain( 'https://stats.wp.com' );
	} );

	it( 'should include support and survey domains', () => {
		const { result } = renderHook( () => useCheckoutCSP() );
		const { cspDirectives } = result.current;

		// Survicate
		expect( cspDirectives ).toContain( 'https://surveys-static-prd.survicate-cdn.com' );
		expect( cspDirectives ).toContain( 'https://survey.survicate.com' );

		// Zendesk/Smooch
		expect( cspDirectives ).toContain( 'https://cdn.smooch.io' );
		expect( cspDirectives ).toContain( 'https://static.zdassets.com' );
	} );

	it( 'should restrict form-action for PCI DSS 6.4.3 compliance', () => {
		const { result } = renderHook( () => useCheckoutCSP() );
		const { cspDirectives } = result.current;

		expect( cspDirectives ).toContain( "form-action 'self' https://checkout.stripe.com" );
	} );

	it( 'should use nonce from existing script tags if available', () => {
		// Add a script tag with nonce
		const scriptTag = document.createElement( 'script' );
		scriptTag.setAttribute( 'nonce', 'test-nonce-123' );
		document.head.appendChild( scriptTag );

		const { result } = renderHook( () => useCheckoutCSP() );
		const { cspDirectives } = result.current;

		expect( cspDirectives ).toContain( "'nonce-test-nonce-123'" );

		// Clean up
		document.head.removeChild( scriptTag );
	} );

	it( 'should work without nonce when no script tag with nonce exists', () => {
		const { result } = renderHook( () => useCheckoutCSP() );
		const { cspDirectives } = result.current;

		// Should still have self in script-src
		expect( cspDirectives ).toContain( "script-src 'self'" );
		// But no nonce directive
		expect( cspDirectives ).not.toMatch( /'nonce-[^']*'/ );
	} );

	it( 'should include unsafe-eval in development mode for webpack', () => {
		// Mock development environment
		Object.defineProperty( window, 'location', {
			value: {
				...originalLocation,
				hostname: 'calypso.localhost',
			},
			writable: true,
		} );

		const { result } = renderHook( () => useCheckoutCSP() );
		const { cspDirectives } = result.current;

		expect( cspDirectives ).toContain( "'unsafe-eval'" );
	} );

	it( 'should not include unsafe-eval in production mode', () => {
		// Mock production environment
		Object.defineProperty( window, 'location', {
			value: {
				...originalLocation,
				hostname: 'wordpress.com',
			},
			writable: true,
		} );

		const { result } = renderHook( () => useCheckoutCSP() );
		const { cspDirectives } = result.current;

		expect( cspDirectives ).not.toContain( "'unsafe-eval'" );
	} );

	it( 'should include HTTP versions of domains in development mode', () => {
		// Mock development environment
		Object.defineProperty( window, 'location', {
			value: {
				...originalLocation,
				hostname: 'localhost',
			},
			writable: true,
		} );

		const { result } = renderHook( () => useCheckoutCSP() );
		const { cspDirectives } = result.current;

		// Should include both HTTP and HTTPS versions in development
		expect( cspDirectives ).toContain( 'https://stats.wp.com' );
		expect( cspDirectives ).toContain( 'http://stats.wp.com' );
	} );

	it( 'should only include HTTPS versions of domains in production', () => {
		// Mock production environment
		Object.defineProperty( window, 'location', {
			value: {
				...originalLocation,
				hostname: 'wordpress.com',
			},
			writable: true,
		} );

		const { result } = renderHook( () => useCheckoutCSP() );
		const { cspDirectives } = result.current;

		// Should only include HTTPS versions in production
		expect( cspDirectives ).toContain( 'https://stats.wp.com' );
		expect( cspDirectives ).not.toContain( 'http://stats.wp.com' );
	} );

	it( 'should include connect-src for WebSocket connections', () => {
		const { result } = renderHook( () => useCheckoutCSP() );
		const { cspDirectives } = result.current;

		// Zendesk WebSocket
		expect( cspDirectives ).toMatch( /wss:\/\/\*\.zendesk\.com/ );
	} );

	it( 'should include WordPress.com API endpoints', () => {
		const { result } = renderHook( () => useCheckoutCSP() );
		const { cspDirectives } = result.current;

		expect( cspDirectives ).toContain( 'https://public-api.wordpress.com' );
		expect( cspDirectives ).toContain( 'https://widgets.wp.com' );
		expect( cspDirectives ).toContain( 'https://wpcom.com' );
	} );

	it( 'should include font sources', () => {
		const { result } = renderHook( () => useCheckoutCSP() );
		const { cspDirectives } = result.current;

		// Fonts in style-src
		expect( cspDirectives ).toContain( 'https://fonts.googleapis.com' );

		// Typekit in script-src
		expect( cspDirectives ).toContain( 'https://use.typekit.net' );
	} );

	it( 'should allow unsafe-inline for styles', () => {
		const { result } = renderHook( () => useCheckoutCSP() );
		const { cspDirectives } = result.current;

		expect( cspDirectives ).toContain( "style-src 'self' 'unsafe-inline'" );
	} );

	it( 'should return consistent directives on multiple calls', () => {
		const { result: result1 } = renderHook( () => useCheckoutCSP() );
		const { result: result2 } = renderHook( () => useCheckoutCSP() );

		expect( result1.current.cspDirectives ).toBe( result2.current.cspDirectives );
	} );

	it( 'should format CSP directives correctly', () => {
		const { result } = renderHook( () => useCheckoutCSP() );
		const { cspDirectives } = result.current;

		// Check format: directive-name source1 source2; directive-name2 source3
		const directivePairs = cspDirectives.split( ';' );
		const nonEmptyPairs = directivePairs.filter( ( pair ) => pair.trim() );

		// Each directive should start with a directive name followed by sources
		nonEmptyPairs.forEach( ( pair ) => {
			expect( pair.trim() ).toMatch( /^[a-z-]+ / );
		} );
	} );
} );
