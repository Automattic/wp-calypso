import crypto from 'crypto';

/**
 * Generate CSP header for checkout pages
 * Provides restrictive policy for PCI DSS 6.4.3 compliance
 * @param {string} nonce - The nonce to use for inline scripts
 * @param {boolean} isDevelopment - Whether we're in development mode
 * @returns {string} The CSP policy string for checkout
 */
export function generateCheckoutCSPHeader( nonce, isDevelopment ) {
	// Simple string arrays - add quotes yourself for CSP keywords like 'self', 'none', etc.
	const directives = {
		// Default deny everything
		'default-src': [ "'none'" ],

		// PCI DSS 6.4.3: Nonce-based with strict-dynamic for scripts
		// 'self' kept as fallback for browsers that don't support strict-dynamic
		'script-src': [
			`'nonce-${ nonce }'`,
			"'strict-dynamic'",
			"'self'",
			// Payment processors (fallback for non-strict-dynamic browsers)
			'https://js.stripe.com',
			'https://checkout.stripe.com',
		],

		// Styles - allow self and inline (needed for dynamic styles)
		'style-src': [ "'self'", "'unsafe-inline'", 'https://fonts.googleapis.com' ],

		// EGRESS CONTROL: Tight allowlist for network connections (primary exfil gate)
		'connect-src': [
			"'self'",
			// Payment processors only
			'https://api.stripe.com',
			'https://q.stripe.com',
			// WordPress.com API (required for checkout)
			'https://public-api.wordpress.com',
		],

		// Frame sources - payment widgets only
		'frame-src': [ 'https://js.stripe.com', 'https://checkout.stripe.com' ],

		// EGRESS CONTROL: Restrict form submissions
		'form-action': [ "'self'", 'https://api.stripe.com', 'https://checkout.stripe.com' ],

		// Images - self + data URIs + WordPress.com CDN (both HTTP and HTTPS)
		'img-src': [ "'self'", 'data:', 'https://*.wp.com', 'http://*.wp.com' ],

		// Fonts - self + CDNs
		'font-src': [ "'self'", 'https://fonts.gstatic.com', 'https://*.wp.com' ],

		// Prevent base tag hijacking
		'base-uri': [ "'none'" ],

		// Block all plugins
		'object-src': [ "'none'" ],

		// Prevent clickjacking
		'frame-ancestors': [ "'none'" ],
	};

	if ( isDevelopment ) {
		// Add 'unsafe-eval' to script-src for webpack
		directives[ 'script-src' ].push( "'unsafe-eval'" );
	}

	// Build CSP string - just join the arrays
	const cspString = Object.entries( directives )
		.map( ( [ key, values ] ) => `${ key } ${ values.join( ' ' ) }` )
		.join( '; ' );

	return cspString;
}

/**
 * Middleware to add Content Security Policy headers to checkout pages only
 * Applies restrictive policy for PCI DSS 6.4.3 compliance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function checkoutCSPMiddleware( req, res, next ) {
	// Check if this is a checkout route
	const path = req.path;
	const isCheckoutRoute =
		path.startsWith( '/checkout' ) &&
		! path.includes( '/thank-you' ) &&
		! path.includes( '/failed-purchases' ) &&
		! path.includes( '/licensing-' );

	if ( ! isCheckoutRoute ) {
		// Not a checkout page, skip CSP
		next();
		return;
	}

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

	// Determine if we're in development mode
	const isDevelopment =
		req.hostname === 'calypso.localhost' ||
		req.hostname === 'localhost' ||
		process.env.NODE_ENV === 'development';

	// Generate and set restrictive CSP header for checkout
	const checkoutCSPHeader = generateCheckoutCSPHeader( nonce, isDevelopment );
	res.setHeader( 'Content-Security-Policy', checkoutCSPHeader );

	next();
}
