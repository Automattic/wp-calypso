import crypto from 'crypto';

/**
 * Generate base CSP header for all routes
 * This provides a maximally permissive policy that exists primarily for reporting
 * Actual security restrictions are added via checkout-specific headers
 * @returns {string} The base CSP policy string
 */
export function generateBaseCSPHeader() {
	// Maximally permissive base CSP - allows everything
	// The main purpose is to enable CSP reporting
	// Checkout pages will have more restrictive headers
	const directives = {
		'default-src': {
			raw: [ '*', 'data:', 'blob:', "'unsafe-inline'", "'unsafe-eval'" ],
		},
		// Report violations for monitoring and PCI DSS compliance
		'report-uri': {
			raw: [ 'https://public-api.wordpress.com/csp/' ],
		},
	};

	// No need for development-specific changes since we're already maximally permissive

	const cspHeader = Object.entries( directives )
		.map( ( [ key, value ] ) => {
			const wrappedItems = ( value.wrapped ?? [] ).map( ( item ) => `'${ item }'` );
			const rawItems = value.raw ?? [];

			const allExpressions = [ ...wrappedItems, ...rawItems ].join( ' ' );

			return `${ key } ${ allExpressions }`;
		} )
		.join( '; ' );

	return cspHeader;
}

/**
 * Generate CSP header for checkout pages
 * These provide the specific restrictions for checkout pages (PCI DSS 6.4.3)
 * @param {string} nonce - The nonce to use for inline scripts
 * @param {boolean} isDevelopment - Whether we're in development mode
 * @returns {string} The CSP policy string for checkout
 */
export function generateMetaCSPDirectives( nonce, isDevelopment ) {
	const directives = {
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
		directives[ 'script-src' ].wrapped.push( 'unsafe-eval' );

		// Add HTTP versions for development
		const httpDomains = [ 'stats.wp.com', 'pixel.wp.com', 's0.wp.com', 's1.wp.com' ];
		httpDomains.forEach( ( domain ) => {
			if (
				directives[ 'script-src' ] &&
				directives[ 'script-src' ].raw.includes( `https://${ domain }` )
			) {
				directives[ 'script-src' ].raw.push( `http://${ domain }` );
			}
			if (
				directives[ 'connect-src' ] &&
				directives[ 'connect-src' ].raw.includes( `https://${ domain }` )
			) {
				directives[ 'connect-src' ].raw.push( `http://${ domain }` );
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
 * Legacy function for backward compatibility
 * Generate full CSP header (base + meta directives combined)
 * @param {string} nonce - The nonce to use for inline scripts
 * @param {boolean} isDevelopment - Whether we're in development mode
 * @returns {string} The complete CSP policy string
 */
export function generateCSPHeader( nonce, isDevelopment ) {
	// Combine base and meta directives for backward compatibility
	const base = generateBaseCSPHeader();
	const meta = generateMetaCSPDirectives( nonce, isDevelopment );

	// Simple combination - in practice, the meta directives would override
	// but this maintains backward compatibility
	return `${ base }; ${ meta }`;
}

/**
 * Middleware to add Content Security Policy headers
 * - Non-checkout routes: permissive base policy with reporting enabled
 * - Checkout routes: restrictive policy for PCI DSS 6.4.3 compliance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function checkoutCSPMiddleware( req, res, next ) {
	// Initialize req.context if it doesn't exist
	if ( ! req.context ) {
		req.context = {};
	}

	// Use existing nonce if available, otherwise generate new one
	let nonce = req.context.inlineScriptNonce;
	if ( ! nonce ) {
		// Generate nonce for this request - use hex format to match existing app
		nonce = crypto.randomBytes( 48 ).toString( 'hex' );
		// Store nonce where the document template expects it
		req.context.inlineScriptNonce = nonce;
	}
	// Also store in res.locals for potential future use
	res.locals.nonce = nonce;

	// Set base CSP header (lenient policy) for all routes
	const baseCSPHeader = generateBaseCSPHeader();
	res.setHeader( 'Content-Security-Policy-Report-Only', baseCSPHeader );

	// For checkout pages, set restrictive CSP header
	const path = req.path;
	const isCheckoutRoute =
		path.startsWith( '/checkout' ) &&
		! path.includes( '/thank-you' ) &&
		! path.includes( '/failed-purchases' ) &&
		! path.includes( '/licensing-' );

	if ( isCheckoutRoute ) {
		req.context.checkoutCSPNonce = nonce;
	}

	next();
}
