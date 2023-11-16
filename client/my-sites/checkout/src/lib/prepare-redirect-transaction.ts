import debugFactory from 'debug';
import {
	createTransactionEndpointRequestPayload,
	createTransactionEndpointCartFromResponseCart,
} from './translate-cart';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from './translate-payment-method-names';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type {
	TransactionRequest,
	WPCOMTransactionEndpointRequestPayload,
} from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:composite-checkout:submit-redirect-transaction' );

type SubmitRedirectTransactionData = Omit<
	TransactionRequest,
	'paymentMethodType' | 'paymentPartnerProcessorId' | 'cart'
>;

export default function prepareRedirectTransaction(
	paymentMethodId: string,
	transactionData: SubmitRedirectTransactionData,
	transactionOptions: PaymentProcessorOptions
): WPCOMTransactionEndpointRequestPayload {
	const paymentMethodType = translateCheckoutPaymentMethodToWpcomPaymentMethod( paymentMethodId );
	if ( ! paymentMethodType ) {
		throw new Error( `No payment method found for type: ${ paymentMethodId }` );
	}
	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...transactionData,
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId: transactionOptions.siteId,
			contactDetails: transactionData.domainDetails ?? null,
			responseCart: transactionOptions.responseCart,
		} ),
		paymentMethodType,
		paymentPartnerProcessorId: transactionOptions.stripeConfiguration?.processor_id,
	} );
	debug( `sending redirect transaction for type: ${ paymentMethodId }`, formattedTransactionData );
	return formattedTransactionData;
}
