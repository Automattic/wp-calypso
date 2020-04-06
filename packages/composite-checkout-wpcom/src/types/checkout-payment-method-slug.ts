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
