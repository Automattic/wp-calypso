/**
 * External dependencies
 */
import { snakeCase } from 'lodash';

/**
 * Payment method slugs as expected by composite-checkout.
 * If the composite-checkout package used typescript, this
 * would belong there.
 */
export type CheckoutPaymentMethodSlug =
	| 'alipay'
	| 'apple-pay'
	| 'bancontact'
	| 'card'
	| 'ebanx'
	| 'brazil-tef'
	| 'netbanking'
	| 'id-wallet'
	| 'eps'
	| 'giropay'
	| 'ideal'
	| 'p24'
	| 'paypal'
	| 'paypal-direct'
	| 'sofort'
	| 'free-purchase'
	| 'full-credits'
	| 'stripe-three-d-secure'
	| 'wechat';

export function translateCheckoutPaymentMethodToTracksPaymentMethod(
	paymentMethod: CheckoutPaymentMethodSlug
): string {
	let paymentMethodSlug: string = paymentMethod;
	// existing cards have unique paymentMethodIds
	if ( paymentMethod.startsWith( 'existingCard' ) ) {
		paymentMethodSlug = 'credit_card';
	}
	switch ( paymentMethodSlug ) {
		case 'card':
			return 'credit_card';
		case 'apple-pay':
			return 'web_payment';
	}
	return snakeCase( paymentMethodSlug );
}
