/**
 * External dependencies
 */
import config from 'calypso/config';

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

/**
 * Returns an available Web Payment method.
 *
 * Web Payments (`PaymentRequest` API) are available only if the
 * document is served through HTTPS.
 *
 * The configuration features `my-sites/checkout/web-payment/*` must
 * also be enabled.
 *
 * @returns {string|null}  One of the `WEB_PAYMENT_*_METHOD` or `null`
 *                         if none can be detected.
 */
export function detectWebPaymentMethod() {
	if ( isApplePayAvailable() ) {
		return WEB_PAYMENT_APPLE_PAY_METHOD;
	}

	if ( config.isEnabled( 'my-sites/checkout/web-payment/basic-card' ) && window.PaymentRequest ) {
		return WEB_PAYMENT_BASIC_CARD_METHOD;
	}

	return null;
}

/**
 * Returns a user-friendly Web Payment method name.
 *
 * @param {string|null} webPaymentMethod  The payment method identifier
 *                                        (expecting one of the
 *                                        `WEB_PAYMENT_*_METHOD`
 *                                        constant).
 * @param {Function} translate            Localization function to translate the label.
 * @returns {string|null}                 A user-friendly payment name
 *                                        or the given payment method
 *                                        if none matches.
 */
export function getWebPaymentMethodName( webPaymentMethod, translate ) {
	switch ( webPaymentMethod ) {
		case WEB_PAYMENT_BASIC_CARD_METHOD:
			return translate( 'Browser wallet' );

		case WEB_PAYMENT_APPLE_PAY_METHOD:
			// Not translated since it's a trademark.
			return 'Apple Pay';

		default:
			return webPaymentMethod;
	}
}
