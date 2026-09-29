import { wpcom } from './wpcom-fetcher';

export interface PayPalExpressUrlResponse {
	redirect_url?: string;
}

/**
 * @param body The request payload, already in the endpoint's snake_case shape.
 * Checkout builds it from `PayPalExpressEndpointRequestPayload` in
 * `@automattic/wpcom-checkout`.
 */
export async function createPayPalExpressUrl(
	body: Record< string, unknown >
): Promise< PayPalExpressUrlResponse > {
	return await wpcom.req.post( { path: '/me/paypal-express-url', apiVersion: '1.2', body } );
}

export type PayPalPPCPConfirmPaymentResponse =
	| { success: true }
	| {
			error: string;
			message: string;
	  };

/**
 * Captures a PayPal (PPCP) order once the buyer has approved it in PayPal's dialog.
 */
export async function confirmPayPalPPCPPayment( {
	orderId,
	payPalOrderId,
}: {
	orderId: string;
	payPalOrderId: string;
} ): Promise< PayPalPPCPConfirmPaymentResponse > {
	return await wpcom.req.post( {
		path: '/me/paypal-ppcp-confirm-payment',
		body: {
			bd_order_id: orderId,
			paypal_order_id: payPalOrderId,
		},
	} );
}
