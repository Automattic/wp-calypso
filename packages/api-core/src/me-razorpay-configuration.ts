import { wpcom } from './wpcom-fetcher';

/**
 * Razorpay payment processor configuration
 */
export interface RazorpayConfiguration {
	js_url: string;
	options: RazorpayOptions;
}

/**
 * Options for initializing Razorpay
 */
export interface RazorpayOptions {
	key: string;
	order_id?: string; // This is a razorpay order ID; the name is constrained by a 3rd party library.
	customer_id?: string; // This is a razorpay customer ID; the name is constrained by a 3rd party library.
	handler?: ( response: RazorpayModalResponse ) => void;
	prefill?: {
		contact?: string;
		email?: string;
	};
	modal?: {
		ondismiss?: ( response: RazorpayModalResponse ) => void;
	};
	recurring?: string;
}

/**
 * Response from Razorpay modal
 */
export interface RazorpayModalResponse {
	razorpay_payment_id: string;
	razorpay_order_id: string;
	razorpay_signature: string;
}

/**
 * Arguments for confirming a Razorpay payment
 */
export interface RazorpayConfirmationRequestArgs {
	razorpay_payment_id: string;
	razorpay_signature: string;
	bd_order_id: string;
}

export async function fetchRazorpayConfiguration( requestArgs?: {
	sandbox: boolean;
} ): Promise< RazorpayConfiguration > {
	return await wpcom.req.get( '/me/razorpay-configuration', requestArgs );
}
