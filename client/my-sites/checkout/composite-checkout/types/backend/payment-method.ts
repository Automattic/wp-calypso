/**
 * Internal dependencies
 */
import { CheckoutPaymentMethodSlug } from '../checkout-payment-method-slug';

/**
 * Payment method slugs as returned by the WPCOM backend.
 * These need to be translated to the values expected by
 * composite-checkout.
 *
 * Defining these as interfaces allows WPCOMPaymentMethodClass
 * to be treated as a discriminated union so the compiler
 * can do exhaustiveness checking. For example, in a switch
 * block such as
 *
 *     // method : WPCOMPaymentMethodClass
 *     switch ( method.name ) {
 *       case ...
 *     }
 *
 * the typescript compiler will raise an error if we forget to
 * handle all the cases.
 *
 * @see https://www.typescriptlang.org/docs/handbook/advanced-types.html#exhaustiveness-checking
 */
export type WPCOMPaymentMethod =
	| 'WPCOM_Billing_WPCOM'
	| 'WPCOM_Billing_Ebanx'
	| 'WPCOM_Billing_Ebanx_Redirect_Brazil_Tef'
	| 'WPCOM_Billing_Dlocal_Redirect_India_Netbanking'
	| 'WPCOM_Billing_Dlocal_Redirect_Indonesia_Wallet'
	| 'WPCOM_Billing_PayPal_Direct'
	| 'WPCOM_Billing_PayPal_Express'
	| 'WPCOM_Billing_Stripe_Payment_Method'
	| 'WPCOM_Billing_Stripe_Source_Alipay'
	| 'WPCOM_Billing_Stripe_Source_Bancontact'
	| 'WPCOM_Billing_Stripe_Source_Eps'
	| 'WPCOM_Billing_Stripe_Source_Giropay'
	| 'WPCOM_Billing_Stripe_Source_Ideal'
	| 'WPCOM_Billing_Stripe_Source_P24'
	| 'WPCOM_Billing_Stripe_Source_Sofort'
	| 'WPCOM_Billing_Stripe_Source_Three_D_Secure'
	| 'WPCOM_Billing_Stripe_Source_Wechat'
	| 'WPCOM_Billing_Web_Payment';

export type WPCOMPaymentMethodClass = { name: WPCOMPaymentMethod };

/**
 * Convert a payment method class name from a string to a
 * typed value. This function is extensionally equivalent to
 *
 *     ( slug ) => { name: slug }
 *
 * However the explicit switch is necessary for inferring the
 * correct type.
 *
 * @param slug Name of one of the payment method classes on WPCOM
 *
 * @returns Typed payment method slug or null
 */
export function readWPCOMPaymentMethodClass( slug: string ): WPCOMPaymentMethodClass | null {
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
			return { name: slug };
	}
	return null;
}

/**
 * Convert a WPCOM payment method class name to a checkout payment method slug
 *
 * @param paymentMethod WPCOM payment method class name
 * @returns Payment method slug accepted by the checkout component
 */
export function translateWpcomPaymentMethodToCheckoutPaymentMethod(
	paymentMethod: WPCOMPaymentMethodClass
): CheckoutPaymentMethodSlug {
	switch ( paymentMethod.name ) {
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
	paymentMethod: CheckoutPaymentMethodSlug
): WPCOMPaymentMethodClass | null {
	// existing cards have unique paymentMethodIds
	if ( paymentMethod.startsWith( 'existingCard' ) ) {
		paymentMethod = 'card';
	}
	switch ( paymentMethod ) {
		case 'ebanx':
			return { name: 'WPCOM_Billing_Ebanx' };
		case 'brazil-tef':
			return { name: 'WPCOM_Billing_Ebanx_Redirect_Brazil_Tef' };
		case 'netbanking':
			return { name: 'WPCOM_Billing_Dlocal_Redirect_India_Netbanking' };
		case 'id_wallet':
			return { name: 'WPCOM_Billing_Dlocal_Redirect_Indonesia_Wallet' };
		case 'paypal-direct':
			return { name: 'WPCOM_Billing_PayPal_Direct' };
		case 'paypal':
			return { name: 'WPCOM_Billing_PayPal_Express' };
		case 'card':
			return { name: 'WPCOM_Billing_Stripe_Payment_Method' };
		case 'alipay':
			return { name: 'WPCOM_Billing_Stripe_Source_Alipay' };
		case 'bancontact':
			return { name: 'WPCOM_Billing_Stripe_Source_Bancontact' };
		case 'eps':
			return { name: 'WPCOM_Billing_Stripe_Source_Eps' };
		case 'giropay':
			return { name: 'WPCOM_Billing_Stripe_Source_Giropay' };
		case 'ideal':
			return { name: 'WPCOM_Billing_Stripe_Source_Ideal' };
		case 'p24':
			return { name: 'WPCOM_Billing_Stripe_Source_P24' };
		case 'sofort':
			return { name: 'WPCOM_Billing_Stripe_Source_Sofort' };
		case 'stripe-three-d-secure':
			return { name: 'WPCOM_Billing_Stripe_Source_Three_D_Secure' };
		case 'wechat':
			return { name: 'WPCOM_Billing_Stripe_Source_Wechat' };
		case 'apple-pay':
			return { name: 'WPCOM_Billing_Web_Payment' };
		case 'full-credits':
			return { name: 'WPCOM_Billing_WPCOM' };
		case 'free-purchase':
			return { name: 'WPCOM_Billing_WPCOM' };
	}
}
