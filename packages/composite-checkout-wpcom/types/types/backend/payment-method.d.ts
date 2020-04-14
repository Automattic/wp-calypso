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
export declare type WPCOMPaymentMethodClass =
	| WPCOMBillingEbanx
	| WPCOMBillingEbanxRedirectBrazilTef
	| WPCOMBillingPayPalDirect
	| WPCOMBillingPayPalExpress
	| WPCOMBillingStripePaymentMethod
	| WPCOMBillingStripeSourceAlipay
	| WPCOMBillingStripeSourceBancontact
	| WPCOMBillingStripeSourceEps
	| WPCOMBillingStripeSourceGiropay
	| WPCOMBillingStripeSourceIdeal
	| WPCOMBillingStripeSourceP24
	| WPCOMBillingStripeSourceSofort
	| WPCOMBillingStripeSourceThreeDSecure
	| WPCOMBillingStripeSourceWechat
	| WPCOMBillingWebPayment;
export interface WPCOMBillingEbanx {
	name: 'WPCOM_Billing_Ebanx';
}
export interface WPCOMBillingEbanxRedirectBrazilTef {
	name: 'WPCOM_Billing_Ebanx_Redirect_Brazil_Tef';
}
export interface WPCOMBillingPayPalDirect {
	name: 'WPCOM_Billing_PayPal_Direct';
}
export interface WPCOMBillingPayPalExpress {
	name: 'WPCOM_Billing_PayPal_Express';
}
export interface WPCOMBillingStripePaymentMethod {
	name: 'WPCOM_Billing_Stripe_Payment_Method';
}
export interface WPCOMBillingStripeSourceAlipay {
	name: 'WPCOM_Billing_Stripe_Source_Alipay';
}
export interface WPCOMBillingStripeSourceBancontact {
	name: 'WPCOM_Billing_Stripe_Source_Bancontact';
}
export interface WPCOMBillingStripeSourceEps {
	name: 'WPCOM_Billing_Stripe_Source_Eps';
}
export interface WPCOMBillingStripeSourceGiropay {
	name: 'WPCOM_Billing_Stripe_Source_Giropay';
}
export interface WPCOMBillingStripeSourceIdeal {
	name: 'WPCOM_Billing_Stripe_Source_Ideal';
}
export interface WPCOMBillingStripeSourceP24 {
	name: 'WPCOM_Billing_Stripe_Source_P24';
}
export interface WPCOMBillingStripeSourceSofort {
	name: 'WPCOM_Billing_Stripe_Source_Sofort';
}
export interface WPCOMBillingStripeSourceThreeDSecure {
	name: 'WPCOM_Billing_Stripe_Source_Three_D_Secure';
}
export interface WPCOMBillingStripeSourceWechat {
	name: 'WPCOM_Billing_Stripe_Source_Wechat';
}
export interface WPCOMBillingWebPayment {
	name: 'WPCOM_Billing_Web_Payment';
}
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
 * @returns Typed payment method slug
 */
export declare function readWPCOMPaymentMethodClass( slug: string ): WPCOMPaymentMethodClass;
/**
 * Convert a WPCOM payment method class name to a checkout payment method slug
 *
 * @param paymentMethod WPCOM payment method class name
 * @returns Payment method slug accepted by the checkout component
 */
export declare function translateWpcomPaymentMethodToCheckoutPaymentMethod(
	paymentMethod: WPCOMPaymentMethodClass
): CheckoutPaymentMethodSlug;
