import cspMiddleware, { generateNonce, buildCSPHeader } from '../csp';

describe( 'CSP Middleware', () => {
	describe( 'generateNonce', () => {
		it( 'should generate a base64-encoded nonce', () => {
			const nonce = generateNonce();
			expect( nonce ).toMatch( /^[A-Za-z0-9+/]+=*$/ );
			expect( nonce.length ).toBeGreaterThan( 0 );
		} );

		it( 'should generate unique nonces', () => {
			const nonce1 = generateNonce();
			const nonce2 = generateNonce();
			expect( nonce1 ).not.toEqual( nonce2 );
		} );
	} );

	describe( 'buildCSPHeader', () => {
		it( 'should include nonce in script-src directive', () => {
			const nonce = 'testNonce123';
			const cspHeader = buildCSPHeader( nonce );
			expect( cspHeader ).toContain( `'nonce-${ nonce }'` );
		} );

		it( 'should include strict-dynamic', () => {
			const cspHeader = buildCSPHeader( 'test' );
			expect( cspHeader ).toContain( "'strict-dynamic'" );
		} );

		it( 'should include Stripe.js domain', () => {
			const cspHeader = buildCSPHeader( 'test' );
			expect( cspHeader ).toContain( 'https://js.stripe.com' );
		} );

		it( 'should include Smooch support widget domain', () => {
			const cspHeader = buildCSPHeader( 'test' );
			expect( cspHeader ).toContain( 'https://cdn.smooch.io' );
		} );

		it( 'should include report-to directive', () => {
			const cspHeader = buildCSPHeader( 'test' );
			expect( cspHeader ).toContain( 'report-to csp-endpoint' );
		} );
	} );

	describe( 'cspMiddleware', () => {
		let req;
		let res;
		let next;

		beforeEach( () => {
			req = {
				context: {},
			};
			res = {
				setHeader: jest.fn(),
			};
			next = jest.fn();
		} );

		it( 'should add nonce to request context', () => {
			const middleware = cspMiddleware();
			middleware( req, res, next );

			expect( req.context.inlineScriptNonce ).toBeDefined();
			expect( req.context.inlineScriptNonce ).toMatch( /^[A-Za-z0-9+/]+=*$/ );
		} );

		it( 'should set Report-To header', () => {
			const middleware = cspMiddleware();
			middleware( req, res, next );

			expect( res.setHeader ).toHaveBeenCalledWith(
				'Report-To',
				expect.stringContaining( 'csp-endpoint' )
			);
		} );

		it( 'should use Content-Security-Policy-Report-Only header by default', () => {
			const middleware = cspMiddleware();
			middleware( req, res, next );

			expect( res.setHeader ).toHaveBeenCalledWith(
				'Content-Security-Policy-Report-Only',
				expect.any( String )
			);
		} );

		it( 'should use Content-Security-Policy header when enforceCSP is true', () => {
			const middleware = cspMiddleware( { enforceCSP: true } );
			middleware( req, res, next );

			expect( res.setHeader ).toHaveBeenCalledWith(
				'Content-Security-Policy',
				expect.any( String )
			);
		} );

		it( 'should include nonce in CSP header', () => {
			const middleware = cspMiddleware();
			middleware( req, res, next );

			const nonce = req.context.inlineScriptNonce;
			const cspCall = res.setHeader.mock.calls.find(
				( call ) => call[ 0 ] === 'Content-Security-Policy-Report-Only'
			);
			expect( cspCall[ 1 ] ).toContain( `'nonce-${ nonce }'` );
		} );

		it( 'should call next() to continue middleware chain', () => {
			const middleware = cspMiddleware();
			middleware( req, res, next );

			expect( next ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );

describe( 'Initial script nonce verification', () => {
	it( 'should ensure nonce is available for document rendering', () => {
		const req = { context: {} };
		const res = { setHeader: jest.fn() };
		const next = jest.fn();

		const middleware = cspMiddleware();
		middleware( req, res, next );

		// The nonce should be available in context for the document renderer
		expect( req.context.inlineScriptNonce ).toBeDefined();
		expect( typeof req.context.inlineScriptNonce ).toBe( 'string' );

		// Verify the nonce format is valid for HTML attribute
		const nonce = req.context.inlineScriptNonce;
		// Nonce should not contain quotes or special HTML characters
		expect( nonce ).not.toContain( '"' );
		expect( nonce ).not.toContain( "'" );
		expect( nonce ).not.toContain( '<' );
		expect( nonce ).not.toContain( '>' );
	} );
} );
