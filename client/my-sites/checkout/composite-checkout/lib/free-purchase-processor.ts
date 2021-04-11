/**
 * External dependencies
 */
import debugFactory from 'debug';
import { makeSuccessResponse, makeErrorResponse } from '@automattic/composite-checkout';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import getDomainDetails from './get-domain-details';
import submitWpcomTransaction from './submit-wpcom-transaction';
import {
	createTransactionEndpointRequestPayload,
	createTransactionEndpointCartFromResponseCart,
} from './translate-cart';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { TransactionRequest } from '../types/transaction-endpoint';

const debug = debugFactory( 'calypso:composite-checkout:free-purchase-processor' );

type SubmitFreePurchaseTransactionData = Omit<
	TransactionRequest,
	'paymentMethodType' | 'paymentPartnerProcessorId' | 'cart'
>;

export default async function freePurchaseProcessor(
	transactionOptions: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	const {
		siteId,
		responseCart,
		includeDomainDetails,
		includeGSuiteDetails,
		contactDetails,
	} = transactionOptions;

	const formattedTransactionData = prepareFreePurchaseTransaction(
		{
			name: '',
			couponId: responseCart.coupon,
			siteId: siteId ? String( siteId ) : '',
			domainDetails: getDomainDetails( contactDetails, {
				includeDomainDetails,
				includeGSuiteDetails,
			} ),
			// this data is intentionally empty so we do not charge taxes
			country: '',
			postalCode: '',
		},
		transactionOptions
	);

	return submitWpcomTransaction( formattedTransactionData, transactionOptions )
		.then( makeSuccessResponse )
		.catch( ( error ) => makeErrorResponse( error.message ) );
}

function prepareFreePurchaseTransaction(
	transactionData: SubmitFreePurchaseTransactionData,
	transactionOptions: PaymentProcessorOptions
) {
	debug( 'formatting free transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...transactionData,
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId: transactionOptions.siteId ? String( transactionOptions.siteId ) : undefined,
			contactDetails: transactionData.domainDetails ?? null,
			responseCart: transactionOptions.responseCart,
		} ),
		paymentMethodType: 'WPCOM_Billing_WPCOM',
	} );
	debug( 'submitting free transaction', formattedTransactionData );
	return formattedTransactionData;
}
