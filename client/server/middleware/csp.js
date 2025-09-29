import crypto from 'crypto';
import config from '@automattic/calypso-config';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:csp' );

/**
 * Generate a cryptographically strong random nonce
 * @returns {string} Base64-encoded nonce
 */
function generateNonce() {
	return crypto.randomBytes( 16 ).toString( 'base64' );
}

/**
 * Build the Content Security Policy header value for PCI DSS 6.4.3 compliance
 * @param {string} nonce - The nonce for this request
 * @returns {string} The CSP header value
 */
function buildCSPHeader( nonce ) {
	const isDevelopment = config( 'env_id' ) === 'development';

	// CSP for PCI DSS 6.4.3 with Stripe.js and support widget
	const scriptSources = [
		`'nonce-${ nonce }'`,
		"'strict-dynamic'",
		// Required third-party scripts (needed even with strict-dynamic for initial load)
		'https://js.stripe.com',
		'https://cdn.smooch.io',
		// 'unsafe-inline' is ignored when nonce and strict-dynamic are present
		// but provides fallback for older browsers
		"'unsafe-inline'",
	];

	// Add unsafe-eval in development for webpack source maps
	if ( isDevelopment ) {
		// webpack uses eval for source maps in development
		scriptSources.push( "'unsafe-eval'" );
	}

	const directives = {
		'script-src': scriptSources,
		'report-to': [ 'csp-endpoint' ],
	};

	// Build the CSP header string
	const cspString = Object.entries( directives )
		.map( ( [ directive, values ] ) => {
			return `${ directive } ${ values.join( ' ' ) }`;
		} )
		.join( '; ' );

	return cspString;
}

/**
 * Content Security Policy middleware for PCI DSS 6.4.3 compliance
 * Implements minimal CSP with nonce-based script control for Stripe.js integration
 * @param {Object} options - Middleware configuration options
 * @returns {Function} Express middleware function
 */
export default function cspMiddleware( options = {} ) {
	return ( req, res, next ) => {
		// Generate a unique nonce for this request
		const nonce = generateNonce();

		// Store nonce in request context for use in rendering
		req.context = req.context || {};
		req.context.inlineScriptNonce = nonce;

		// Set Report-To header for CSP violation reporting
		const reportToHeader = JSON.stringify( {
			group: 'csp-endpoint',
			max_age: 10886400, // 126 days
			endpoints: [
				{
					url: 'https://public-api.wordpress.com/csp/',
				},
			],
		} );
		res.setHeader( 'Report-To', reportToHeader );

		// Determine if we should enforce CSP (vs report-only mode)
		const enforceCSP = options.enforceCSP || config( 'enforce_csp_policy' ) || false;

		// Build CSP header
		const cspHeader = buildCSPHeader( nonce );

		// Set the appropriate CSP header based on enforcement mode
		const headerName = enforceCSP
			? 'Content-Security-Policy'
			: 'Content-Security-Policy-Report-Only';

		res.setHeader( headerName, cspHeader );

		debug( `CSP header set with nonce: ${ nonce }, mode: ${ headerName }` );

		next();
	};
}

/**
 * Export additional utilities for testing
 */
export { generateNonce, buildCSPHeader };
