import crypto from 'crypto';

/**
 * Generate CSP header with nonce for checkout routes
 * @param {string} nonce - The nonce to use for inline scripts
 * @param {boolean} isDevelopment - Whether we're in development mode
 * @returns {string} The complete CSP policy string
 */
function generateCSPHeader( nonce, isDevelopment ) {
	const directives = [
		"default-src 'self'",
		// Payment processors, fraud prevention, support chat, and analytics
		`script-src 'self' 'nonce-${ nonce }' https://js.stripe.com https://checkout.stripe.com https://www.paypal.com https://www.paypalobjects.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://cdn.smooch.io https://static.zdassets.com https://ekr.zdassets.com https://*.zendesk.com https://surveys-static-prd.survicate-cdn.com https://survey.survicate.com https://cdn.siftscience.com https://stats.wp.com https://use.typekit.net`,
		// Styles including Survicate surveys, Smooch chat, and Google Fonts
		"style-src 'self' 'unsafe-inline' https://surveys-static-prd.survicate-cdn.com https://cdn.smooch.io https://fonts.googleapis.com https://s0.wp.com",
		"img-src 'self' data: https: blob: https://pixel.wp.com https://s1.wp.com https://s0.wp.com",
		// API connections - payment processors, WP.com services, and support
		"connect-src 'self' https://api.stripe.com https://public-api.wordpress.com https://widgets.wp.com https://wpcom.com wss://*.zendesk.com https://*.zendesk.com https://*.smooch.io https://api.smooch.io https://ekr.zdassets.com",
		// Payment and support frames
		"frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com https://www.paypal.com https://www.google.com/recaptcha/ https://recaptcha.google.com https://public-api.wordpress.com",
		// Fonts - allow support widget fonts, WordPress.com fonts, and WooCommerce fonts
		"font-src 'self' data: https://surveys-static-prd.survicate-cdn.com https://cdn.smooch.io https://fonts.gstatic.com https://s1.wp.com https://s0.wp.com https://use.typekit.net https://woocommerce.com",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self' https://checkout.stripe.com",
		"frame-ancestors 'none'",
		'report-uri https://public-api.wordpress.com/csp/',
	];

	let cspHeader = directives.join( '; ' );

	// In development, allow eval for webpack and HTTP for local resources
	if ( isDevelopment ) {
		// Add 'unsafe-eval' to script-src for webpack
		cspHeader = cspHeader.replace( 'script-src', "script-src 'unsafe-eval'" );

		// URLs that need HTTP versions in development
		const httpAllowList = [ 'stats.wp.com', 'pixel.wp.com', 's0.wp.com', 's1.wp.com' ];

		// Add HTTP versions alongside HTTPS versions
		httpAllowList.forEach( ( domain ) => {
			cspHeader = cspHeader.replace(
				new RegExp( `https://${ domain.replace( '.', '\\.' ) }`, 'g' ),
				`https://${ domain } http://${ domain }`
			);
		} );
	}

	return cspHeader;
}

/**
 * Middleware to add Content Security Policy headers to checkout routes
 * This is required for PCI DSS 6.4.3 compliance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function checkoutCSPMiddleware( req, res, next ) {
	const path = req.path;

	// Check if this is an actual checkout route (not thank-you, etc)
	const isCheckoutRoute =
		path.startsWith( '/checkout' ) &&
		! path.includes( '/thank-you' ) &&
		! path.includes( '/failed-purchases' ) &&
		! path.includes( '/licensing-' );

	// Additional check for specific checkout patterns that need CSP
	const checkoutPatterns = [
		/^\/checkout\/?$/,
		/^\/checkout\/[^/]+\/[^/]+$/,
		/^\/checkout\/no-site/,
		/^\/checkout\/features\//,
		/^\/checkout\/(jetpack|akismet|marketplace|unified)\//,
	];

	const isPaymentRoute =
		isCheckoutRoute && checkoutPatterns.some( ( pattern ) => pattern.test( path ) );

	if ( isPaymentRoute ) {
		// Detect if we're in development mode
		const isDevelopment =
			process.env.NODE_ENV === 'development' ||
			req.hostname === 'calypso.localhost' ||
			req.hostname === 'localhost';

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

		// Set CSP header in report-only mode initially
		const cspHeader = generateCSPHeader( nonce, isDevelopment );
		res.setHeader( 'Content-Security-Policy-Report-Only', cspHeader );
	}

	next();
}
