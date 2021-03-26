/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import submitWpcomTransaction from './submit-wpcom-transaction';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from './translate-payment-method-names';
import {
	createTransactionEndpointRequestPayload,
	createTransactionEndpointCartFromResponseCart,
} from './translate-cart';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type {
	TransactionRequestWithLineItems,
	WPCOMTransactionEndpointResponse,
} from '../types/transaction-endpoint';

const debug = debugFactory( 'calypso:composite-checkout:submit-redirect-transaction' );

type SubmitRedirectTransactionData = Omit<
	TransactionRequestWithLineItems,
	'paymentMethodType' | 'paymentPartnerProcessorId'
>;

export default async function submitRedirectTransaction(
	paymentMethodId: string,
	transactionData: SubmitRedirectTransactionData,
	transactionOptions: PaymentProcessorOptions
): Promise< WPCOMTransactionEndpointResponse > {
	const paymentMethodType = translateCheckoutPaymentMethodToWpcomPaymentMethod( paymentMethodId );
	if ( ! paymentMethodType ) {
		throw new Error( `No payment method found for type: ${ paymentMethodId }` );
	}
	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...transactionData,
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId: transactionOptions.siteId ? String( transactionOptions.siteId ) : undefined,
			contactDetails: transactionData.domainDetails ?? null,
			responseCart: transactionOptions.responseCart,
		} ),
		paymentMethodType,
		paymentPartnerProcessorId: transactionOptions.stripeConfiguration?.processor_id,
	} );
	debug( `sending redirect transaction for type: ${ paymentMethodId }`, formattedTransactionData );
	return submitWpcomTransaction( formattedTransactionData, transactionOptions );
}
