/**
 * @jest-environment node
 */
import { checkoutCSPMiddleware, generateCheckoutCSPHeader } from '../checkout-csp';

describe( 'checkout-csp middleware', () => {
	describe( 'generateCheckoutCSPHeader', () => {
		it( 'should generate restrictive CSP header for checkout', () => {
			const nonce = 'test-nonce-123';
			const isDevelopment = false;
			const header = generateCheckoutCSPHeader( nonce, isDevelopment );

			expect( header ).toBeDefined();
			expect( typeof header ).toBe( 'string' );

			// Should include all required directive types
			expect( header ).toContain( 'script-src' );
			expect( header ).toContain( 'style-src' );
			expect( header ).toContain( 'connect-src' );
			expect( header ).toContain( 'frame-src' );
			expect( header ).toContain( 'form-action' );
			expect( header ).toContain( 'frame-ancestors' );
		} );

		it( 'should include nonce in script-src directive', () => {
			const nonce = 'test-nonce-456';
			const isDevelopment = false;
			const header = generateCheckoutCSPHeader( nonce, isDevelopment );

			expect( header ).toContain( `'nonce-${ nonce }'` );
		} );

		it( 'should include payment processor domains', () => {
			const nonce = 'test-nonce';
			const isDevelopment = false;
			const header = generateCheckoutCSPHeader( nonce, isDevelopment );

			// Stripe
			expect( header ).toContain( 'https://js.stripe.com' );
			expect( header ).toContain( 'https://checkout.stripe.com' );
			expect( header ).toContain( 'https://api.stripe.com' );

			// PayPal
			expect( header ).toContain( 'https://www.paypal.com' );
			expect( header ).toContain( 'https://www.paypalobjects.com' );
		} );

		it( 'should include fraud prevention domains', () => {
			const nonce = 'test-nonce';
			const isDevelopment = false;
			const header = generateCheckoutCSPHeader( nonce, isDevelopment );

			// reCAPTCHA
			expect( header ).toContain( 'https://www.google.com/recaptcha/' );
			expect( header ).toContain( 'https://www.gstatic.com/recaptcha/' );

			// Sift Science
			expect( header ).toContain( 'https://cdn.siftscience.com' );
		} );

		it( 'should restrict form-action for PCI DSS compliance', () => {
			const nonce = 'test-nonce';
			const isDevelopment = false;
			const header = generateCheckoutCSPHeader( nonce, isDevelopment );

			expect( header ).toContain( "form-action 'self' https://checkout.stripe.com" );
		} );

		it( 'should set frame-ancestors to none for clickjacking protection', () => {
			const nonce = 'test-nonce';
			const isDevelopment = false;
			const header = generateCheckoutCSPHeader( nonce, isDevelopment );

			expect( header ).toContain( "frame-ancestors 'none'" );
		} );

		it( 'should add unsafe-eval in development mode', () => {
			const nonce = 'test-nonce';
			const isDevelopment = true;
			const header = generateCheckoutCSPHeader( nonce, isDevelopment );

			expect( header ).toContain( "'unsafe-eval'" );
		} );

		it( 'should not add unsafe-eval in production mode', () => {
			const nonce = 'test-nonce';
			const isDevelopment = false;
			const header = generateCheckoutCSPHeader( nonce, isDevelopment );

			expect( header ).not.toContain( "'unsafe-eval'" );
		} );

		it( 'should add HTTP versions of domains in development mode', () => {
			const nonce = 'test-nonce';
			const isDevelopment = true;
			const header = generateCheckoutCSPHeader( nonce, isDevelopment );

			// Should have both HTTP and HTTPS versions
			expect( header ).toContain( 'https://stats.wp.com' );
			expect( header ).toContain( 'http://stats.wp.com' );
		} );

		it( 'should only include HTTPS versions in production mode', () => {
			const nonce = 'test-nonce';
			const isDevelopment = false;
			const header = generateCheckoutCSPHeader( nonce, isDevelopment );

			// Should only have HTTPS version
			expect( header ).toContain( 'https://stats.wp.com' );
			expect( header ).not.toContain( 'http://stats.wp.com' );
		} );
	} );

	describe( 'checkoutCSPMiddleware', () => {
		let req;
		let res;
		let next;

		beforeEach( () => {
			req = {
				path: '/test',
				hostname: 'example.com',
				context: {},
			};
			res = {
				locals: {},
				setHeader: jest.fn(),
			};
			next = jest.fn();
		} );

		it( 'should skip CSP for non-checkout routes', () => {
			req.path = '/settings/example.com';

			checkoutCSPMiddleware( req, res, next );

			expect( res.setHeader ).not.toHaveBeenCalled();
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should set Content-Security-Policy header for checkout routes', () => {
			req.path = '/checkout/example.com';

			checkoutCSPMiddleware( req, res, next );

			expect( res.setHeader ).toHaveBeenCalledWith(
				'Content-Security-Policy',
				expect.any( String )
			);
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should generate and store nonce for checkout routes', () => {
			req.path = '/checkout/example.com';

			checkoutCSPMiddleware( req, res, next );

			expect( req.context.inlineScriptNonce ).toBeDefined();
			expect( typeof req.context.inlineScriptNonce ).toBe( 'string' );
			expect( req.context.inlineScriptNonce.length ).toBeGreaterThan( 0 );
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should store nonce in res.locals for checkout routes', () => {
			req.path = '/checkout/example.com';

			checkoutCSPMiddleware( req, res, next );

			expect( res.locals.nonce ).toBeDefined();
			expect( res.locals.nonce ).toBe( req.context.inlineScriptNonce );
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should use existing nonce if available', () => {
			const existingNonce = 'existing-nonce-789';
			req.path = '/checkout/example.com';
			req.context.inlineScriptNonce = existingNonce;

			checkoutCSPMiddleware( req, res, next );

			expect( req.context.inlineScriptNonce ).toBe( existingNonce );
			expect( res.locals.nonce ).toBe( existingNonce );
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should initialize req.context if it does not exist', () => {
			req.path = '/checkout/example.com';
			req.context = undefined;

			checkoutCSPMiddleware( req, res, next );

			expect( req.context ).toBeDefined();
			expect( req.context.inlineScriptNonce ).toBeDefined();
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should skip CSP for thank-you pages', () => {
			req.path = '/checkout/thank-you/example.com';

			checkoutCSPMiddleware( req, res, next );

			expect( res.setHeader ).not.toHaveBeenCalled();
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should skip CSP for failed-purchases pages', () => {
			req.path = '/checkout/failed-purchases/example.com';

			checkoutCSPMiddleware( req, res, next );

			expect( res.setHeader ).not.toHaveBeenCalled();
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should skip CSP for licensing pages', () => {
			req.path = '/checkout/licensing-auto-activation/example.com';

			checkoutCSPMiddleware( req, res, next );

			expect( res.setHeader ).not.toHaveBeenCalled();
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should generate unique nonces for different requests', () => {
			const req1 = { path: '/checkout/test1', hostname: 'example.com', context: {} };
			const req2 = { path: '/checkout/test2', hostname: 'example.com', context: {} };

			checkoutCSPMiddleware( req1, res, next );
			const nonce1 = req1.context.inlineScriptNonce;

			checkoutCSPMiddleware( req2, res, next );
			const nonce2 = req2.context.inlineScriptNonce;

			expect( nonce1 ).not.toBe( nonce2 );
		} );

		it( 'should handle checkout route with query parameters', () => {
			req.path = '/checkout/example.com?plan=business';

			checkoutCSPMiddleware( req, res, next );

			expect( res.setHeader ).toHaveBeenCalledWith(
				'Content-Security-Policy',
				expect.any( String )
			);
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should handle checkout route without site', () => {
			req.path = '/checkout';

			checkoutCSPMiddleware( req, res, next );

			expect( res.setHeader ).toHaveBeenCalledWith(
				'Content-Security-Policy',
				expect.any( String )
			);
			expect( next ).toHaveBeenCalled();
		} );

		it( 'should include nonce in CSP header', () => {
			req.path = '/checkout/example.com';

			checkoutCSPMiddleware( req, res, next );

			const [ , headerValue ] = res.setHeader.mock.calls[ 0 ];
			expect( headerValue ).toContain( `'nonce-${ req.context.inlineScriptNonce }'` );
		} );
	} );
} );
