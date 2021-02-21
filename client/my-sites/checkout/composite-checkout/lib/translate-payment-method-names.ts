/**
 * External dependencies
 */
import { snakeCase } from 'lodash';

/**
 * Internal dependencies
 */
import { CheckoutPaymentMethodSlug } from '../types/checkout-payment-method-slug';
import { WPCOMPaymentMethod } from '../types/backend/payment-method';

/**
 * Convert a WPCOM payment method class name to a checkout payment method slug
 *
 * @param paymentMethod WPCOM payment method class name
 * @returns Payment method slug accepted by the checkout component
 */
export function translateWpcomPaymentMethodToCheckoutPaymentMethod(
	paymentMethod: WPCOMPaymentMethod
): CheckoutPaymentMethodSlug {
	switch ( paymentMethod ) {
		case 'WPCOM_Billing_WPCOM':
			return 'free-purchase';
		case 'WPCOM_Billing_Ebanx':
			return 'ebanx';
		case 'WPCOM_Billing_Ebanx_Redirect_Brazil_Tef':
			return 'brazil-tef';
		case 'WPCOM_Billing_PayPal_Direct':
			return 'paypal-direct';
		case 'WPCOM_Billing_PayPal_Express':
			return 'paypal';
		case 'WPCOM_Billing_Stripe_Payment_Method':
			return 'card';
		case 'WPCOM_Billing_Stripe_Source_Alipay':
			return 'alipay';
		case 'WPCOM_Billing_Stripe_Source_Bancontact':
			return 'bancontact';
		case 'WPCOM_Billing_Stripe_Source_Eps':
			return 'eps';
		case 'WPCOM_Billing_Stripe_Source_Giropay':
			return 'giropay';
		case 'WPCOM_Billing_Stripe_Source_Ideal':
			return 'ideal';
		case 'WPCOM_Billing_Stripe_Source_P24':
			return 'p24';
		case 'WPCOM_Billing_Stripe_Source_Sofort':
			return 'sofort';
		case 'WPCOM_Billing_Stripe_Source_Three_D_Secure':
			return 'stripe-three-d-secure';
		case 'WPCOM_Billing_Stripe_Source_Wechat':
			return 'wechat';
		case 'WPCOM_Billing_Dlocal_Redirect_India_Netbanking':
			return 'netbanking';
		case 'WPCOM_Billing_Dlocal_Redirect_Indonesia_Wallet':
			return 'id_wallet';
		case 'WPCOM_Billing_Web_Payment':
			return 'apple-pay';
	}
}

export function translateCheckoutPaymentMethodToWpcomPaymentMethod(
	paymentMethod: CheckoutPaymentMethodSlug | string
): WPCOMPaymentMethod | null {
	// existing cards have unique paymentMethodIds
	if ( paymentMethod.startsWith( 'existingCard' ) ) {
		paymentMethod = 'card';
	}
	switch ( paymentMethod ) {
		case 'ebanx':
			return 'WPCOM_Billing_Ebanx';
		case 'brazil-tef':
			return 'WPCOM_Billing_Ebanx_Redirect_Brazil_Tef';
		case 'netbanking':
			return 'WPCOM_Billing_Dlocal_Redirect_India_Netbanking';
		case 'id_wallet':
			return 'WPCOM_Billing_Dlocal_Redirect_Indonesia_Wallet';
		case 'paypal-direct':
			return 'WPCOM_Billing_PayPal_Direct';
		case 'paypal':
			return 'WPCOM_Billing_PayPal_Express';
		case 'card':
			return 'WPCOM_Billing_Stripe_Payment_Method';
		case 'alipay':
			return 'WPCOM_Billing_Stripe_Source_Alipay';
		case 'bancontact':
			return 'WPCOM_Billing_Stripe_Source_Bancontact';
		case 'eps':
			return 'WPCOM_Billing_Stripe_Source_Eps';
		case 'giropay':
			return 'WPCOM_Billing_Stripe_Source_Giropay';
		case 'ideal':
			return 'WPCOM_Billing_Stripe_Source_Ideal';
		case 'p24':
			return 'WPCOM_Billing_Stripe_Source_P24';
		case 'sofort':
			return 'WPCOM_Billing_Stripe_Source_Sofort';
		case 'stripe-three-d-secure':
			return 'WPCOM_Billing_Stripe_Source_Three_D_Secure';
		case 'wechat':
			return 'WPCOM_Billing_Stripe_Source_Wechat';
		case 'apple-pay':
			return 'WPCOM_Billing_Web_Payment';
		case 'full-credits':
			return 'WPCOM_Billing_WPCOM';
		case 'free-purchase':
			return 'WPCOM_Billing_WPCOM';
	}
	return null;
}

export function readWPCOMPaymentMethodClass( slug: string ): WPCOMPaymentMethod | null {
	switch ( slug ) {
		case 'WPCOM_Billing_WPCOM':
		case 'WPCOM_Billing_Ebanx':
		case 'WPCOM_Billing_Ebanx_Redirect_Brazil_Tef':
		case 'WPCOM_Billing_Dlocal_Redirect_India_Netbanking':
		case 'WPCOM_Billing_Dlocal_Redirect_Indonesia_Wallet':
		case 'WPCOM_Billing_PayPal_Direct':
		case 'WPCOM_Billing_PayPal_Express':
		case 'WPCOM_Billing_Stripe_Payment_Method':
		case 'WPCOM_Billing_Stripe_Source_Alipay':
		case 'WPCOM_Billing_Stripe_Source_Bancontact':
		case 'WPCOM_Billing_Stripe_Source_Eps':
		case 'WPCOM_Billing_Stripe_Source_Giropay':
		case 'WPCOM_Billing_Stripe_Source_Ideal':
		case 'WPCOM_Billing_Stripe_Source_P24':
		case 'WPCOM_Billing_Stripe_Source_Sofort':
		case 'WPCOM_Billing_Stripe_Source_Three_D_Secure':
		case 'WPCOM_Billing_Stripe_Source_Wechat':
		case 'WPCOM_Billing_Web_Payment':
			return slug;
	}
	return null;
}

export function readCheckoutPaymentMethodSlug( slug: string ): CheckoutPaymentMethodSlug | null {
	switch ( slug ) {
		case 'ebanx':
		case 'brazil-tef':
		case 'netbanking':
		case 'id_wallet':
		case 'paypal-direct':
		case 'paypal':
		case 'card':
		case 'alipay':
		case 'bancontact':
		case 'eps':
		case 'giropay':
		case 'ideal':
		case 'p24':
		case 'sofort':
		case 'stripe-three-d-secure':
		case 'wechat':
		case 'apple-pay':
		case 'full-credits':
		case 'free-purchase':
			return slug;
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
			return 'web_payment';
	}
	return snakeCase( paymentMethodSlug );
}

export function isRedirectPaymentMethod( slug: CheckoutPaymentMethodSlug ): boolean {
	const redirectPaymentMethods = [
		'alipay',
		'bancontact',
		'eps',
		'giropay',
		'ideal',
		'netbanking',
		'paypal',
		'p24',
		'brazil-tef',
		'wechat',
		'sofort',
	];
	return redirectPaymentMethods.includes( slug );
}
