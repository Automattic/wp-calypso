/**
 * External dependencies
 */
import debugFactory from 'debug';
import { defaultRegistry, makeSuccessResponse } from '@automattic/composite-checkout';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import getPostalCode from './get-postal-code';
import getDomainDetails from './get-domain-details';
import submitWpcomTransaction from './submit-wpcom-transaction';
import { createTransactionEndpointRequestPayloadFromLineItems } from './translate-cart';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { WPCOMCartItem } from '../types/checkout-cart';
import type { ManagedContactDetails } from '../types/wpcom-store-state';
import type {
	TransactionRequestWithLineItems,
	WPCOMTransactionEndpointResponse,
} from '../types/transaction-endpoint';

const { select } = defaultRegistry;

const debug = debugFactory( 'calypso:composite-checkout:full-credits-processor' );

type FullCreditsTransactionRequest = {
	items: WPCOMCartItem[];
};

type SubmitFullCreditsTransactionData = Omit<
	TransactionRequestWithLineItems,
	'paymentMethodType' | 'paymentPartnerProcessorId'
>;

export default async function fullCreditsProcessor(
	submitData: unknown,
	transactionOptions: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	if ( ! isValidTransactionData( submitData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}

	const { siteId, responseCart, includeDomainDetails, includeGSuiteDetails } = transactionOptions;

	const managedContactDetails: ManagedContactDetails | undefined = select(
		'wpcom'
	)?.getContactInfo();

	return submitCreditsTransaction(
		{
			...submitData,
			name: '',
			couponId: responseCart.coupon,
			siteId: siteId ? String( siteId ) : '',
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			country: managedContactDetails?.countryCode?.value ?? '',
			postalCode: getPostalCode(),
			subdivisionCode: managedContactDetails?.state?.value,
		},
		transactionOptions
	).then( makeSuccessResponse );
}

async function submitCreditsTransaction(
	transactionData: SubmitFullCreditsTransactionData,
	transactionOptions: PaymentProcessorOptions
): Promise< WPCOMTransactionEndpointResponse > {
	debug( 'formatting full credits transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayloadFromLineItems( {
		...transactionData,
		paymentMethodType: 'WPCOM_Billing_WPCOM',
	} );
	debug( 'submitting full credits transaction', formattedTransactionData );
	return submitWpcomTransaction( formattedTransactionData, transactionOptions );
}

function isValidTransactionData(
	submitData: unknown
): submitData is FullCreditsTransactionRequest {
	const data = submitData as FullCreditsTransactionRequest;
	if ( ! ( data?.items?.length > 0 ) ) {
		throw new Error( 'Transaction requires items and none were provided' );
	}
	return true;
}
