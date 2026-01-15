/**
 * VGS-based EBANX tokenization
 * This replaces the client-side EBANX SDK tokenization with a server-side approach
 * that uses VGS tokens for secure card data handling
 */

import debugFactory from 'debug';
import paymentGatewayLoader from 'calypso/lib/payment-gateway-loader';
import wpcom from 'calypso/lib/wp';

const debug = debugFactory( 'calypso:ebanx-vgs-tokenization' );

/**
 * VGS token data structure
 * These are the secure tokens returned by VGS Collect form fields
 * Note: Cardholder name is NOT tokenized
 */
export interface VgsTokens {
	card_number: string; // VGS token for card number
	card_exp: string; // VGS token for expiration date (MM/YY format)
	card_cvc: string; // VGS token for CVV/CVC
}

/**
 * Request payload for the EBANX tokenization endpoint
 */
interface EbanxTokenizeRequest {
	card_number: string; // VGS token
	card_name: string; // Plain text cardholder name (not tokenized)
	card_due_date: string; // VGS token (MM/YY)
	card_cvv: string; // VGS token
	payment_type_code: string; // e.g., 'new_purchase', 'add_card', etc.
	country: string; // ISO country code (e.g., 'BR', 'MX')
	test_mode?: boolean; // Optional test mode flag
}

/**
 * Normalized response for use in the application
 * This matches the structure expected by the payment processor
 */
export interface EbanxTokenizeResponse {
	token: string; // EBANX payment token
	deviceId?: string; // Device fingerprint ID (may not be present in VGS flow)
	paymentTypeCode?: string; // Card type (e.g., 'visa', 'mastercard')
}

/**
 * Card details for EBANX tokenization
 * This interface matches the existing createEbanxToken parameter structure
 */
export interface EbanxCardDetails {
	country: string; // ISO country code
	name: string; // Plain text cardholder name
	vgsTokens: VgsTokens; // VGS secure tokens
}

/**
 * EBANX SDK configuration response from the API
 */
interface EbanxConfiguration {
	js_url: string;
	environment: string;
	public_key: string;
}

/**
 * EBANX SDK interface (minimal typing for the parts we use)
 */
interface EbanxSdk {
	config: {
		setMode: ( mode: string ) => void;
		setPublishableKey: ( key: string ) => void;
		setCountry: ( country: string ) => void;
	};
	deviceFingerprint: {
		setup: ( callback: ( deviceId: string ) => void ) => void;
	};
}

/**
 * Gets the EBANX device fingerprint using the EBANX SDK
 * This is used for fraud detection and is required by EBANX for transactions
 * @param country - ISO country code (e.g., 'BR')
 * @param requestType - Type of request for configuration (e.g., 'new_purchase')
 * @returns Promise resolving to device fingerprint ID, or undefined if it fails
 */
async function getEbanxDeviceFingerprint(
	country: string,
	requestType: string
): Promise< string | undefined > {
	try {
		debug( 'fetching ebanx configuration for device fingerprint' );

		const configuration: EbanxConfiguration = await wpcom.req.get( '/me/ebanx-configuration', {
			request_type: requestType,
		} );

		debug( 'loading ebanx sdk for device fingerprint' );
		const ebanx: EbanxSdk = await paymentGatewayLoader.ready( configuration.js_url, 'EBANX' );

		ebanx.config.setMode( configuration.environment );
		ebanx.config.setPublishableKey( configuration.public_key );
		ebanx.config.setCountry( country.toLowerCase() );

		return new Promise( ( resolve ) => {
			ebanx.deviceFingerprint.setup( ( deviceId: string ) => {
				debug( 'device fingerprint obtained', { deviceId } );
				resolve( deviceId );
			} );
		} );
	} catch ( error ) {
		// Device fingerprint is optional, so we log the error but don't fail the transaction
		debug( 'failed to get device fingerprint, continuing without it', error );
		return undefined;
	}
}

/**
 * Creates an EBANX payment token using VGS secure tokens
 * @param requestType - Type of request ('new_purchase', 'add_card', etc.)
 * @param cardDetails - Card details including country, name, and VGS tokens
 * @returns Promise resolving to EBANX token and device ID
 * @example
 * ```typescript
 * const vgsTokens = {
 *   card_number: 'tok_vgs_xxxxxxxx',
 *   card_exp: 'tok_vgs_zzzzzzzz',
 *   card_cvc: 'tok_vgs_wwwwwwww'
 * };
 *
 * const token = await createEbanxTokenVgs('new_purchase', {
 *   country: 'BR',
 *   name: 'John Doe',
 *   vgsTokens
 * });
 * ```
 */
export async function createEbanxTokenVgs(
	requestType: string,
	cardDetails: EbanxCardDetails
): Promise< EbanxTokenizeResponse > {
	debug( 'creating ebanx token with vgs tokens', { requestType, country: cardDetails.country } );

	try {
		// Prepare request payload for the backend endpoint
		const requestPayload: EbanxTokenizeRequest = {
			card_number: cardDetails.vgsTokens.card_number,
			card_name: cardDetails.name,
			card_due_date: cardDetails.vgsTokens.card_exp,
			card_cvv: cardDetails.vgsTokens.card_cvc,
			payment_type_code: requestType,
			country: cardDetails.country.toUpperCase(),
		};

		debug( 'sending tokenization request to backend', {
			country: requestPayload.country,
			payment_type_code: requestPayload.payment_type_code,
		} );

		// Call the backend endpoint to tokenize with EBANX
		const apiResponse = await wpcom.req.post( {
			path: '/transact/vgs/wpcom/ebanx/tokenize',
			apiNamespace: 'wpcom/v2',
			body: requestPayload,
		} );

		debug( 'ebanx tokenization successful', {
			hasToken: !! apiResponse.token,
			paymentType: apiResponse.payment_type_code,
			status: apiResponse.status,
		} );

		// Get device fingerprint using EBANX SDK (for fraud detection)
		const deviceId = await getEbanxDeviceFingerprint( cardDetails.country, requestType );

		// Normalize the response to match the expected structure
		const normalizedResponse: EbanxTokenizeResponse = {
			token: apiResponse.token,
			deviceId,
			paymentTypeCode: apiResponse.payment_type_code,
		};

		return normalizedResponse;
	} catch ( error ) {
		debug( 'ebanx tokenization failed', error );

		// Re-throw with a more user-friendly message if possible
		const errorMessage =
			error instanceof Error
				? error.message
				: 'Failed to process payment information. Please try again.';

		throw new Error( errorMessage );
	}
}
