import { camelToSnakeCase } from '@automattic/js-utils';
import type { CheckoutPaymentMethodSlug, WPCOMPaymentMethod } from '@automattic/wpcom-checkout';

/**
 * Convert a WPCOM payment method class name to a checkout payment method slug
 * @param paymentMethod WPCOM payment method class name
 * @returns Payment method slug accepted by the checkout component
 */
export function translateWpcomPaymentMethodToCheckoutPaymentMethod(
	paymentMethod: WPCOMPaymentMethod
): CheckoutPaymentMethodSlug {
	switch ( paymentMethod ) {
		case 'WPCOM_Billing_WPCOM':
			return 'free-purchase';
		case 'WPCOM_Billing_Ebanx_Redirect_Brazil_Pix':
			return 'pix';
		case 'WPCOM_Billing_Ebanx':
			return 'ebanx';
		case 'WPCOM_Billing_PayPal_Direct':
			return 'paypal-direct';
		case 'WPCOM_Billing_PayPal_Express':
			return 'paypal-express';
		case 'WPCOM_Billing_PayPal_PPCP':
			// NOTE: we cannot use the key `paypal` because composite-checkout
			// ends up using this as an `id`, which overwrites `window.paypal`
			// which is the namespace used by the PayPal JS SDK.
			return 'paypal-js';
		case 'WPCOM_Billing_Stripe_Payment_Method':
			return 'card';
		case 'WPCOM_Billing_Stripe_Alipay':
			return 'alipay';
		case 'WPCOM_Billing_Stripe_Bancontact':
			return 'bancontact';
		case 'WPCOM_Billing_Stripe_Ideal':
			return 'ideal';
		case 'WPCOM_Billing_Stripe_P24':
			return 'p24';
		case 'WPCOM_Billing_Stripe_Wechat_Pay':
			return 'wechat';
		case 'WPCOM_Billing_Dlocal_Redirect_India_Netbanking':
			return 'netbanking';
		case 'WPCOM_Billing_Web_Payment':
			return 'web-pay';
		case 'WPCOM_Billing_MoneyPress_Stored':
			return 'existingCard';
		case 'WPCOM_Billing_Razorpay':
			return 'razorpay';
		default:
			throw new Error( `Unknown payment method '${ paymentMethod }'` );
	}
}

export function translateCheckoutPaymentMethodToWpcomPaymentMethod(
	paymentMethod: CheckoutPaymentMethodSlug | string
): WPCOMPaymentMethod | null {
	// existing cards have unique paymentMethodIds
	if ( paymentMethod.startsWith( 'existingCard' ) ) {
		paymentMethod = 'existingCard';
	}
	switch ( paymentMethod ) {
		case 'existingCard':
			return 'WPCOM_Billing_MoneyPress_Stored';
		case 'pix':
			return 'WPCOM_Billing_Ebanx_Redirect_Brazil_Pix';
		case 'ebanx':
			return 'WPCOM_Billing_Ebanx';
		case 'netbanking':
			return 'WPCOM_Billing_Dlocal_Redirect_India_Netbanking';
		case 'paypal-direct':
			return 'WPCOM_Billing_PayPal_Direct';
		case 'paypal-express':
			return 'WPCOM_Billing_PayPal_Express';
		case 'paypal-js':
			return 'WPCOM_Billing_PayPal_PPCP';
		case 'stripe':
		case 'card':
			return 'WPCOM_Billing_Stripe_Payment_Method';
		case 'alipay':
			return 'WPCOM_Billing_Stripe_Alipay';
		case 'bancontact':
			return 'WPCOM_Billing_Stripe_Bancontact';
		case 'ideal':
			return 'WPCOM_Billing_Stripe_Ideal';
		case 'p24':
			return 'WPCOM_Billing_Stripe_P24';
		case 'wechat':
			return 'WPCOM_Billing_Stripe_Wechat_Pay';
		case 'apple-pay':
		case 'google-pay':
			return 'WPCOM_Billing_Web_Payment';
		case 'free-purchase':
			return 'WPCOM_Billing_WPCOM';
		case 'razorpay':
			return 'WPCOM_Billing_Razorpay';
	}
	return null;
}

export function readWPCOMPaymentMethodClass( slug: string ): WPCOMPaymentMethod | null {
	switch ( slug ) {
		case 'WPCOM_Billing_WPCOM':
		case 'WPCOM_Billing_MoneyPress_Stored':
		case 'WPCOM_Billing_Ebanx':
		case 'WPCOM_Billing_Ebanx_Redirect_Brazil_Pix':
		case 'WPCOM_Billing_Dlocal_Redirect_India_Netbanking':
		case 'WPCOM_Billing_PayPal_Direct':
		case 'WPCOM_Billing_PayPal_Express':
		case 'WPCOM_Billing_PayPal_PPCP':
		case 'WPCOM_Billing_Stripe_Payment_Method':
		case 'WPCOM_Billing_Stripe_Alipay':
		case 'WPCOM_Billing_Stripe_Bancontact':
		case 'WPCOM_Billing_Stripe_Ideal':
		case 'WPCOM_Billing_Stripe_P24':
		case 'WPCOM_Billing_Stripe_Wechat_Pay':
		case 'WPCOM_Billing_Web_Payment':
		case 'WPCOM_Billing_Razorpay':
			return slug;
	}
	return null;
}

/**
 * Return the passed CheckoutPaymentMethodSlug if valid
 */
export function readCheckoutPaymentMethodSlug( slug: string ): CheckoutPaymentMethodSlug | null {
	if ( slug.startsWith( 'existingCard' ) ) {
		slug = 'existingCard';
	}
	switch ( slug ) {
		case 'ebanx':
		case 'pix':
		case 'netbanking':
		case 'paypal-direct':
		case 'paypal-express':
		case 'paypal-js':
		case 'card':
		case 'stripe':
		case 'existingCard':
		case 'alipay':
		case 'bancontact':
		case 'ideal':
		case 'p24':
		case 'wechat':
		case 'web-pay':
		case 'free-purchase':
		case 'razorpay':
			return slug;
		case 'apple-pay':
		case 'google-pay':
			return 'web-pay';
	}
	return null;
}

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
		case 'google-pay':
			return 'web_payment';
	}
	return camelToSnakeCase( paymentMethodSlug ).replaceAll( '-', '_' );
}

export function isRedirectPaymentMethod( slug: CheckoutPaymentMethodSlug ): boolean {
	const redirectPaymentMethods = [
		'alipay',
		'bancontact',
		'ideal',
		'netbanking',
		'paypal-express',
		'paypal-js',
		'p24',
		'wechat',
	];
	return redirectPaymentMethods.includes( slug );
}
