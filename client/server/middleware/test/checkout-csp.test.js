/**
 * @jest-environment node
 */
import {
	checkoutCSPMiddleware,
	generateBaseCSPHeader,
	generateMetaCSPDirectives,
} from '../checkout-csp';

describe( 'checkout-csp middleware', () => {
	describe( 'generateBaseCSPHeader', () => {
		it( 'should generate a maximally permissive base CSP header', () => {
			const header = generateBaseCSPHeader();

			expect( header ).toBeDefined();
			expect( typeof header ).toBe( 'string' );

			// Should include default-src with permissive values
			expect( header ).toContain( 'default-src' );
			expect( header ).toContain( '*' );
			expect( header ).toContain( 'data:' );
			expect( header ).toContain( 'blob:' );
			expect( header ).toContain( "'unsafe-inline'" );
			expect( header ).toContain( "'unsafe-eval'" );

			// Should include report-uri for monitoring
			expect( header ).toContain( 'report-uri https://public-api.wordpress.com/csp/' );
		} );

		it( 'should format CSP header correctly', () => {
			const header = generateBaseCSPHeader();

			// Should have proper directive format
			const directives = header.split( ';' );
			const nonEmptyDirectives = directives.filter( ( directive ) => directive.trim() );

			// Each directive should have a name followed by values
			nonEmptyDirectives.forEach( ( directive ) => {
				expect( directive.trim() ).toMatch( /^[a-z-]+\s+/ );
			} );
		} );
	} );

	describe( 'generateMetaCSPDirectives', () => {
		it( 'should generate restrictive CSP directives for checkout', () => {
			const nonce = 'test-nonce-123';
			const isDevelopment = false;
			const directives = generateMetaCSPDirectives( nonce, isDevelopment );

			expect( directives ).toBeDefined();
			expect( typeof directives ).toBe( 'string' );

			// Should include all required directive types
			expect( directives ).toContain( 'script-src' );
			expect( directives ).toContain( 'style-src' );
			expect( directives ).toContain( 'connect-src' );
			expect( directives ).toContain( 'frame-src' );
			expect( directives ).toContain( 'form-action' );
			expect( directives ).toContain( 'frame-ancestors' );
		} );

		it( 'should include nonce in script-src directive', () => {
			const nonce = 'test-nonce-456';
			const isDevelopment = false;
			const directives = generateMetaCSPDirectives( nonce, isDevelopment );

			expect( directives ).toContain( `'nonce-${ nonce }'` );
		} );

		it( 'should include payment processor domains', () => {
			const nonce = 'test-nonce';
			const isDevelopment = false;
			const directives = generateMetaCSPDirectives( nonce, isDevelopment );

			// Stripe
			expect( directives ).toContain( 'https://js.stripe.com' );
			expect( directives ).toContain( 'https://checkout.stripe.com' );
			expect( directives ).toContain( 'https://api.stripe.com' );

			// PayPal
			expect( directives ).toContain( 'https://www.paypal.com' );
			expect( directives ).toContain( 'https://www.paypalobjects.com' );
		} );

		it( 'should include fraud prevention domains', () => {
			const nonce = 'test-nonce';
			const isDevelopment = false;
			const directives = generateMetaCSPDirectives( nonce, isDevelopment );

			// reCAPTCHA
			expect( directives ).toContain( 'https://www.google.com/recaptcha/' );
			expect( directives ).toContain( 'https://www.gstatic.com/recaptcha/' );

			// Sift Science
			expect( directives ).toContain( 'https://cdn.siftscience.com' );
		} );

		it( 'should restrict form-action for PCI DSS compliance', () => {
			const nonce = 'test-nonce';
			const isDevelopment = false;
			const directives = generateMetaCSPDirectives( nonce, isDevelopment );

			expect( directives ).toContain( "form-action 'self' https://checkout.stripe.com" );
		} );

		it( 'should set frame-ancestors to none for clickjacking protection', () => {
			const nonce = 'test-nonce';
			const isDevelopment = false;
			const directives = generateMetaCSPDirectives( nonce, isDevelopment );

			expect( directives ).toContain( "frame-ancestors 'none'" );
		} );

		it( 'should add unsafe-eval in development mode', () => {
			const nonce = 'test-nonce';
			const isDevelopment = true;
			const directives = generateMetaCSPDirectives( nonce, isDevelopment );

			expect( directives ).toContain( "'unsafe-eval'" );
		} );

		it( 'should not add unsafe-eval in production mode', () => {
			const nonce = 'test-nonce';
			const isDevelopment = false;
			const directives = generateMetaCSPDirectives( nonce, isDevelopment );

			expect( directives ).not.toContain( "'unsafe-eval'" );
		} );

		it( 'should add HTTP versions of domains in development mode', () => {
			const nonce = 'test-nonce';
			const isDevelopment = true;
			const directives = generateMetaCSPDirectives( nonce, isDevelopment );

			// Should have both HTTP and HTTPS versions
			expect( directives ).toContain( 'https://stats.wp.com' );
			expect( directives ).toContain( 'http://stats.wp.com' );
		} );

		it( 'should only include HTTPS versions in production mode', () => {
			const nonce = 'test-nonce';
			const isDevelopment = false;
			const directives = generateMetaCSPDirectives( nonce, isDevelopment );

			// Should only have HTTPS version
			expect( directives ).toContain( 'https://stats.wp.com' );
			expect( directives ).not.toContain( 'http://stats.wp.com' );
		} );
	} );

	describe( 'checkoutCSPMiddleware', () => {
		let req;
		let res;
		let next;

		beforeEach( () => {
			req = {
				path: '/test',
				context: {},
			};
			res = {
				locals: {},
				setHeader: jest.fn(),
			};
			next = jest.fn();
		} );

		it( 'should set Content-Security-Policy-Report-Only header for all routes', () => {
			checkoutCSPMiddleware( req, res, next );

			expect( res.setHeader ).toHaveBeenCalledWith(
				'Content-Security-Policy-Report-Only',
				expect.any( String )
			);
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should generate and store nonce in req.context', () => {
			checkoutCSPMiddleware( req, res, next );

			expect( req.context.inlineScriptNonce ).toBeDefined();
			expect( typeof req.context.inlineScriptNonce ).toBe( 'string' );
			expect( req.context.inlineScriptNonce.length ).toBeGreaterThan( 0 );
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should store nonce in res.locals', () => {
			checkoutCSPMiddleware( req, res, next );

			expect( res.locals.nonce ).toBeDefined();
			expect( res.locals.nonce ).toBe( req.context.inlineScriptNonce );
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should use existing nonce if available', () => {
			const existingNonce = 'existing-nonce-789';
			req.context.inlineScriptNonce = existingNonce;

			checkoutCSPMiddleware( req, res, next );

			expect( req.context.inlineScriptNonce ).toBe( existingNonce );
			expect( res.locals.nonce ).toBe( existingNonce );
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should initialize req.context if it does not exist', () => {
			req.context = undefined;

			checkoutCSPMiddleware( req, res, next );

			expect( req.context ).toBeDefined();
			expect( req.context.inlineScriptNonce ).toBeDefined();
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should store checkoutCSPNonce for checkout routes', () => {
			req.path = '/checkout/example.com';

			checkoutCSPMiddleware( req, res, next );

			expect( req.context.checkoutCSPNonce ).toBeDefined();
			expect( req.context.checkoutCSPNonce ).toBe( req.context.inlineScriptNonce );
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should not store checkoutCSPNonce for thank-you pages', () => {
			req.path = '/checkout/thank-you/example.com';

			checkoutCSPMiddleware( req, res, next );

			expect( req.context.checkoutCSPNonce ).toBeUndefined();
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should not store checkoutCSPNonce for failed-purchases pages', () => {
			req.path = '/checkout/failed-purchases/example.com';

			checkoutCSPMiddleware( req, res, next );

			expect( req.context.checkoutCSPNonce ).toBeUndefined();
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should not store checkoutCSPNonce for licensing pages', () => {
			req.path = '/checkout/licensing-auto-activation/example.com';

			checkoutCSPMiddleware( req, res, next );

			expect( req.context.checkoutCSPNonce ).toBeUndefined();
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should not store checkoutCSPNonce for non-checkout routes', () => {
			req.path = '/settings/example.com';

			checkoutCSPMiddleware( req, res, next );

			expect( req.context.checkoutCSPNonce ).toBeUndefined();
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should set base CSP header with report-uri', () => {
			checkoutCSPMiddleware( req, res, next );

			const [ headerName, headerValue ] = res.setHeader.mock.calls[ 0 ];
			expect( headerName ).toBe( 'Content-Security-Policy-Report-Only' );
			expect( headerValue ).toContain( 'report-uri https://public-api.wordpress.com/csp/' );
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should generate unique nonces for different requests', () => {
			const req1 = { path: '/test1', context: {} };
			const req2 = { path: '/test2', context: {} };

			checkoutCSPMiddleware( req1, res, next );
			const nonce1 = req1.context.inlineScriptNonce;

			checkoutCSPMiddleware( req2, res, next );
			const nonce2 = req2.context.inlineScriptNonce;

			expect( nonce1 ).not.toBe( nonce2 );
		} );

		it( 'should handle checkout route with query parameters', () => {
			req.path = '/checkout/example.com?plan=business';

			checkoutCSPMiddleware( req, res, next );

			expect( req.context.checkoutCSPNonce ).toBeDefined();
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should handle checkout route without site', () => {
			req.path = '/checkout';

			checkoutCSPMiddleware( req, res, next );

			expect( req.context.checkoutCSPNonce ).toBeDefined();
			expect( next ).toHaveBeenCalled();
		} );
	} );
} );
