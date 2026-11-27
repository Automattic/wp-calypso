import { wpcom } from './wpcom-fetcher';

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
