import crypto from 'crypto';

/**
 * Generate CSP header with nonce for checkout routes
 * @param {string} nonce - The nonce to use for inline scripts
 * @param {boolean} isDevelopment - Whether we're in development mode
 * @returns {string} The complete CSP policy string
 */
function generateCSPHeader( nonce, isDevelopment ) {
	const directives = {
		'default-src': {
			wrapped: [ 'self' ],
		},
		'script-src': {
			// Scripts
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
				// Support
				'https://cdn.smooch.io',
				'https://static.zdassets.com',
				'https://ekr.zdassets.com',
				'https://*.zendesk.com',
				// Surveys
				'https://surveys-static-prd.survicate-cdn.com',
				'https://survey.survicate.com',
				// Analytics
				'https://stats.wp.com',
				// Fonts
				'https://use.typekit.net',
			],
		},
		'style-src': {
			// Styles
			wrapped: [ 'self', 'unsafe-inline' ],
			raw: [
				// Surveys
				'https://surveys-static-prd.survicate-cdn.com',
				// Support chat
				'https://cdn.smooch.io',
				// Fonts
				'https://fonts.googleapis.com',
				// Styles from WordPress.com CDN
				'https://s0.wp.com',
			],
		},
		'img-src': {
			// Images
			wrapped: [ 'self' ],
			raw: [
				'data:',
				// TODO: try to drop this loose rule. We should not allow loading images from anywhere.
				'https:',
				'blob:',
				// Images from WordPress.com CDN
				'https://pixel.wp.com',
				'https://s0.wp.com',
				'https://s1.wp.com',
			],
		},
		'connect-src': {
			// API connections
			wrapped: [ 'self' ],
			raw: [
				// Payment processor
				'https://api.stripe.com',
				// WordPress.com services
				'https://public-api.wordpress.com',
				'https://widgets.wp.com',
				'https://wpcom.com',
				// Support chat
				'wss://*.zendesk.com',
				'https://*.zendesk.com',
				'https://*.smooch.io',
				'https://api.smooch.io',
				'https://ekr.zdassets.com',
			],
		},
		'frame-src': {
			// Allowed frames
			wrapped: [ 'self' ],
			raw: [
				// Payment processors
				'https://js.stripe.com',
				'https://checkout.stripe.com',
				'https://hooks.stripe.com',
				'https://www.paypal.com',
				// Fraud/spam prevention
				'https://www.google.com/recaptcha/',
				'https://recaptcha.google.com',
				// WordPress.com services
				'https://public-api.wordpress.com',
			],
		},
		'font-src': {
			// Fonts
			wrapped: [ 'self' ],
			raw: [
				'data:',
				// Surveys
				'https://surveys-static-prd.survicate-cdn.com',
				// Support chat
				'https://cdn.smooch.io',
				// Fonts from Google Fonts
				'https://fonts.gstatic.com',
				// Fonts from WordPress.com CDN
				'https://s1.wp.com',
				'https://s0.wp.com',
				// Fonts from Typekit
				'https://use.typekit.net',
				// Fonts from WooCommerce.com
				'https://woocommerce.com',
			],
		},
		'object-src': {
			// Allowed objects
			wrapped: [ 'none' ],
		},
		'base-uri': {
			// Allowed base URIs
			wrapped: [ 'self' ],
		},
		'form-action': {
			// Allowed form actions
			wrapped: [ 'self' ],
			raw: [
				// Payment processors
				'https://checkout.stripe.com',
			],
		},
		'frame-ancestors': {
			// Allowed frame ancestors
			wrapped: [ 'none' ],
		},
		'report-uri': {
			// Report URI
			raw: [ 'https://public-api.wordpress.com/csp/' ],
		},
	};

	if ( isDevelopment ) {
		// Add 'unsafe-eval' to script-src for webpack
		directives[ 'script-src' ].wrapped.push( 'unsafe-eval' );

		// Add HTTP versions alongside HTTPS versions
		const httpAllowList = [ 'stats.wp.com', 'pixel.wp.com', 's0.wp.com', 's1.wp.com' ];
		for ( const key in directives ) {
			if ( Array.isArray( directives[ key ].raw ) ) {
				httpAllowList.forEach( ( httpDomain ) => {
					if ( directives[ key ].raw.includes( `https://${ httpDomain }` ) ) {
						directives[ key ].raw.push( `http://${ httpDomain }` );
					}
				} );
			}
		}
	}

	const cspHeader = Object.entries( directives )
		.map( ( [ key, value ] ) => {
			const wrappedItems = ( Array.isArray( value.wrapped ) ? value.wrapped : [] )
				.map( ( item ) => `'${ item }'` )
				.join( ' ' );
			const rawItems = ( Array.isArray( value.raw ) ? value.raw : [] ).join( ' ' );

			const allExpressions = [ wrappedItems, rawItems ].join( ' ' );

			return `${ key } ${ allExpressions }`;
		} )
		.join( '; ' );

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
