/**
 * External dependencies
 */
import config from '@automattic/calypso-config';

/**
 * Web Payment method identifiers.
 */
export const WEB_PAYMENT_BASIC_CARD_METHOD = 'basic-card';
export const WEB_PAYMENT_APPLE_PAY_METHOD = 'https://apple.com/apple-pay';

/**
 * Determines if Apple Pay is an available payment method.
 *
 * @returns {boolean} True if Apple Pay is an enabled payment method and if the
 *                    user's device supports Apple Pay, false otherwise.
 */
export function isApplePayAvailable() {
	if ( ! config.isEnabled( 'my-sites/checkout/web-payment/apple-pay' ) ) {
		return false;
	}

	// Our Apple Pay implementation uses the Payment Request API, so check that
	// first.
	if ( ! window.PaymentRequest ) {
		return false;
	}

	// Check if Apple Pay is available. This can be very expensive on certain
	// Safari versions due to a bug (https://trac.webkit.org/changeset/243447/webkit),
	// and there is no way it can change during a page request, so cache the
	// result.
	if ( typeof isApplePayAvailable.canMakePayments === 'undefined' ) {
		isApplePayAvailable.canMakePayments = Boolean(
			window.ApplePaySession && window.ApplePaySession.canMakePayments()
		);
	}

	return isApplePayAvailable.canMakePayments;
}
