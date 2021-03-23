/**
 * External dependencies
 */
import debugFactory from 'debug';
import { makeSuccessResponse } from '@automattic/composite-checkout';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import getDomainDetails from './get-domain-details';
import submitWpcomTransaction from './submit-wpcom-transaction';
import { createTransactionEndpointRequestPayloadFromLineItems } from './translate-cart';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { WPCOMCartItem } from '../types/checkout-cart';
import type {
	TransactionRequestWithLineItems,
	WPCOMTransactionEndpointResponse,
} from '../types/transaction-endpoint';

const debug = debugFactory( 'calypso:composite-checkout:free-purchase-processor' );

type FreePurchaseTransactionRequest = {
	items: WPCOMCartItem[];
};

type SubmitFreePurchaseTransactionData = Omit<
	TransactionRequestWithLineItems,
	'paymentMethodType' | 'paymentPartnerProcessorId'
>;

export default async function freePurchaseProcessor(
	submitData: unknown,
	transactionOptions: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	if ( ! isValidTransactionData( submitData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}

	const { siteId, responseCart, includeDomainDetails, includeGSuiteDetails } = transactionOptions;

	return submitFreePurchaseTransaction(
		{
			...submitData,
			name: '',
			couponId: responseCart.coupon,
			siteId: siteId ? String( siteId ) : '',
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			// this data is intentionally empty so we do not charge taxes
			country: '',
			postalCode: '',
		},
		transactionOptions
	).then( makeSuccessResponse );
}

async function submitFreePurchaseTransaction(
	transactionData: SubmitFreePurchaseTransactionData,
	transactionOptions: PaymentProcessorOptions
): Promise< WPCOMTransactionEndpointResponse > {
	debug( 'formatting free transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayloadFromLineItems( {
		...transactionData,
		paymentMethodType: 'WPCOM_Billing_WPCOM',
	} );
	debug( 'submitting free transaction', formattedTransactionData );
	return submitWpcomTransaction( formattedTransactionData, transactionOptions );
}

function isValidTransactionData(
	submitData: unknown
): submitData is FreePurchaseTransactionRequest {
	const data = submitData as FreePurchaseTransactionRequest;
	if ( ! ( data?.items?.length > 0 ) ) {
		throw new Error( 'Transaction requires items and none were provided' );
	}
	return true;
}
