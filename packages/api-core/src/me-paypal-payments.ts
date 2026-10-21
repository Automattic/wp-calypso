import { wpcom } from './wpcom-fetcher';
import type {
	AdConversionDetails,
	ToSAcceptanceTrackingDetails,
	TransactionDomainContactDetails,
} from './me-transactions';
import type { RequestCart } from '@automattic/shopping-cart';

export interface PayPalExpressUrlResponse {
	redirect_url?: string;
}

export interface PayPalExpressEndpointRequestPayload {
	success_url: string;
	cancel_url: string;
	cart: RequestCart;
	domain_details: TransactionDomainContactDetails | null;
	country: string;
	postal_code: string;
	tos?: ToSAcceptanceTrackingDetails;
	ad_conversion?: AdConversionDetails;
}

export async function createPayPalExpressUrl(
	body: PayPalExpressEndpointRequestPayload
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
