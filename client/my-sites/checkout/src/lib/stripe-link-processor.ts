import { makeErrorResponse } from '@automattic/composite-checkout';
import debugFactory from 'debug';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';

const debug = debugFactory( 'wpcom-checkout:stripe-link-processor' );

// Spike stub. The ECE's onConfirm handler calls event.paymentFailed() before
// invoking the processor, so this is never reached during the spike. In the
// real implementation this would:
//   1. POST to /me/transactions to create the PI and get clientSecret
//   2. Return the clientSecret to the ECE onConfirm handler
//   3. That handler calls stripe.confirmPayment({ elements, clientSecret })
//   4. Webhook completes the order; client polls via fetchPurchaseOrder
export default async function stripeLinkProcessor(
	submitData: unknown,
	options: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	debug( '[spike] stripeLinkProcessor called with', submitData, options );
	return makeErrorResponse( 'Stripe Link processor is not yet implemented (spike)' );
}
