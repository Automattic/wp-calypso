/** @format */

/**
 * External dependencies
 */
import config from 'config';

/**
 * Web Payment method identifiers.
 */
export const WEB_PAYMENT_BASIC_CARD_METHOD = 'basic-card';
export const WEB_PAYMENT_APPLE_PAY_METHOD = 'https://apple.com/apple-pay';

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
	if ( ! config.isEnabled( 'my-sites/checkout/web-payment' ) ) {
		return null;
	}

	if (
		config.isEnabled( 'my-sites/checkout/web-payment/apple-pay' ) &&
		window.ApplePaySession &&
		window.ApplePaySession.canMakePayments()
	) {
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
 * @param {function} translate            Localization function to translate the label.
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
