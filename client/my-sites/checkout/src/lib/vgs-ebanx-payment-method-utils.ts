/**
 * VGS Ebanx Payment Method Utilities
 * Transforms VGS tokenized data to Ebanx payment format
 */

import { VGS } from '@vgs/collect-js';
import { __ } from '@wordpress/i18n';

/**
 * Enhanced browser information collection for fraud detection
 * Provides comprehensive browser and device data for security analysis
 */
function getEnhancedBrowserInfo() {
	return {
		user_agent: navigator.userAgent,
		accept_header: '*/*',
		language: navigator.language,
		screen_width: window.screen.width,
		screen_height: window.screen.height,
		color_depth: window.screen.colorDepth,
		time_zone_offset: new Date().getTimezoneOffset(),
		java_enabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
		// Additional fraud detection data
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		platform: navigator.platform,
		cookie_enabled: navigator.cookieEnabled,
		do_not_track: navigator.doNotTrack,
		// Screen and window info
		window_width: window.innerWidth,
		window_height: window.innerHeight,
		device_pixel_ratio: window.devicePixelRatio,
		// Connection info (if available)
		connection_type: ( navigator as any ).connection?.effectiveType || 'unknown',
		// Timestamp for fraud detection
		timestamp: Date.now(),
	};
}

/**
 * Transform VGS Collect tokens to Ebanx payment data format
 * Maps VGS field names from working example to Ebanx token structure
 *
 * VGS field names (from working example):
 * - card_name: Cardholder name
 * - card_number: Card number
 * - card_exp: Expiration date (MM/YY)
 * - card_cvc: Security code
 */
export function createVgsEbanxPaymentMethodData( tokens: VGS.TokenizedCardData ) {
	if ( ! tokens ) {
		throw new Error( __( 'Failed to receive tokens.', 'calypso' ) );
	}

	// Extract tokens using field names from working example
	const cardNumberToken = tokens[ 'card_number' ];
	const cardCvcToken = tokens[ 'card_cvc' ];
	const cardExpToken = tokens[ 'card_exp' ];
	const cardNameToken = tokens[ 'card_name' ];

	if ( ! cardNumberToken || ! cardCvcToken || ! cardExpToken ) {
		throw new Error( __( 'Missing required card tokens.', 'calypso' ) );
	}

	// Build payment instrument tokens array
	const paymentInstrumentTokens = [
		{
			provider_type: 'vgs',
			token_type: 'card_number',
			token_value: cardNumberToken,
		},
		{
			provider_type: 'vgs',
			token_type: 'cvv',
			token_value: cardCvcToken,
		},
	];

	// Handle expiration date (format: MM/YY from VGS)
	if ( typeof cardExpToken === 'object' && 'month' in cardExpToken && 'year' in cardExpToken ) {
		paymentInstrumentTokens.push(
			{
				provider_type: 'vgs',
				token_type: 'expiry_month',
				token_value: ( cardExpToken as any ).month,
			},
			{
				provider_type: 'vgs',
				token_type: 'expiry_year',
				token_value: ( cardExpToken as any ).year,
			}
		);
	} else if ( typeof cardExpToken === 'string' ) {
		// If it's a string, parse it (format: MM/YY)
		const [ month, year ] = cardExpToken.split( '/' );
		if ( month && year ) {
			paymentInstrumentTokens.push(
				{
					provider_type: 'vgs',
					token_type: 'expiry_month',
					token_value: month,
				},
				{
					provider_type: 'vgs',
					token_type: 'expiry_year',
					token_value: year,
				}
			);
		}
	}

	// Build enhanced provider-specific data with comprehensive browser information
	const providerSpecificData = {
		browser_info: getEnhancedBrowserInfo(),
		// Add cardholder name if available
		...( cardNameToken && { cardholder_name: cardNameToken } ),
		// Add additional metadata
		metadata: {
			integration_version: '1.0.0',
			checkout_source: 'calypso',
			payment_method: 'vgs-ebanx',
		},
	};

	return {
		payment_instrument_tokens: JSON.stringify( paymentInstrumentTokens ),
		provider_type: 'ebanx',
		payment_instrument_method: 'card',
		provider_specific_data: JSON.stringify( providerSpecificData ),
	};
}
