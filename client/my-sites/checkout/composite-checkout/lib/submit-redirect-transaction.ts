/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import submitWpcomTransaction from './submit-wpcom-transaction';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from './translate-payment-method-names';
import { createTransactionEndpointRequestPayloadFromLineItems } from './translate-cart';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type {
	TransactionRequestWithLineItems,
	WPCOMTransactionEndpointResponse,
} from '../types/transaction-endpoint';

const debug = debugFactory( 'calypso:composite-checkout:submit-redirect-transaction' );

export default async function submitRedirectTransaction(
	paymentMethodId: string,
	transactionData: TransactionRequestWithLineItems,
	transactionOptions: PaymentProcessorOptions
): Promise< WPCOMTransactionEndpointResponse > {
	const paymentMethodType = translateCheckoutPaymentMethodToWpcomPaymentMethod( paymentMethodId );
	if ( ! paymentMethodType ) {
		throw new Error( `No payment method found for type: ${ paymentMethodId }` );
	}
	const formattedTransactionData = createTransactionEndpointRequestPayloadFromLineItems( {
		...transactionData,
		paymentMethodType,
		paymentPartnerProcessorId: transactionOptions.stripeConfiguration?.processor_id,
	} );
	debug( `sending redirect transaction for type: ${ paymentMethodId }`, formattedTransactionData );
	return submitWpcomTransaction( formattedTransactionData, transactionOptions );
}
