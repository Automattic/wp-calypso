/**
 * VGS-based EBANX tokenization
 * This replaces the client-side EBANX SDK tokenization with a server-side approach
 * that uses VGS tokens for secure card data handling
 */

import debugFactory from 'debug';
import wpcom from 'calypso/lib/wp';

const debug = debugFactory( 'calypso:ebanx-vgs-tokenization' );

/**
 * VGS token data structure
 * These are the secure tokens returned by VGS Collect form fields
 */
export interface VgsTokens {
	card_number: string; // VGS token for card number
	card_holder: string; // VGS token for cardholder name
	card_exp: string; // VGS token for expiration date (MM/YY format)
	card_cvc: string; // VGS token for CVV/CVC
}

/**
 * Request payload for the EBANX tokenization endpoint
 */
interface EbanxTokenizeRequest {
	card_number: string; // VGS token
	card_name: string; // VGS token
	card_due_date: string; // VGS token (MM/YY)
	card_cvv: string; // VGS token
	payment_type_code: string; // e.g., 'new_purchase', 'add_card', etc.
	country: string; // ISO country code (e.g., 'BR', 'MX')
	test_mode?: boolean; // Optional test mode flag
}

/**
 * Raw API response from the EBANX tokenization endpoint
 */
interface EbanxTokenizeApiResponse {
	body: {
		token: string; // EBANX payment token
		payment_type_code: string; // Card type (e.g., 'visa', 'mastercard')
	};
	status: number; // HTTP status code
	headers: {
		'X-Request-ID': string; // Request tracking ID
		Allow: string; // Allowed HTTP methods
	};
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
	vgsTokens: VgsTokens; // VGS secure tokens
}

/**
 * Creates an EBANX payment token using VGS secure tokens
 * @param requestType - Type of request ('new_purchase', 'add_card', etc.)
 * @param cardDetails - Card details including country and VGS tokens
 * @returns Promise resolving to EBANX token and device ID
 * @example
 * ```typescript
 * const vgsTokens = {
 *   card_number: 'tok_vgs_xxxxxxxx',
 *   card_holder: 'tok_vgs_yyyyyyyy',
 *   card_exp: 'tok_vgs_zzzzzzzz',
 *   card_cvc: 'tok_vgs_wwwwwwww'
 * };
 *
 * const token = await createEbanxTokenVgs('new_purchase', {
 *   country: 'BR',
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
			card_name: cardDetails.vgsTokens.card_holder,
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
		const apiResponse: EbanxTokenizeApiResponse = await wpcom.req.post( {
			path: '/transact/vgs/wpcom/ebanx/tokenize?test_mode=true',
			apiNamespace: 'wpcom/v2',
			body: requestPayload,
		} );

		debug( 'ebanx tokenization successful', {
			hasToken: !! apiResponse.body.token,
			paymentType: apiResponse.body.payment_type_code,
			status: apiResponse.status,
		} );

		// Normalize the response to match the expected structure
		const normalizedResponse: EbanxTokenizeResponse = {
			token: apiResponse.body.token,
			deviceId: undefined, // VGS flow doesn't provide deviceId
			paymentTypeCode: apiResponse.body.payment_type_code,
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
