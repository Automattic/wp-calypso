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
import {
	createTransactionEndpointRequestPayload,
	createTransactionEndpointCartFromResponseCart,
} from './translate-cart';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { ManagedContactDetails } from '../types/wpcom-store-state';
import type {
	TransactionRequest,
	WPCOMTransactionEndpointResponse,
} from '../types/transaction-endpoint';

const { select } = defaultRegistry;

const debug = debugFactory( 'calypso:composite-checkout:full-credits-processor' );

type SubmitFullCreditsTransactionData = Omit<
	TransactionRequest,
	'paymentMethodType' | 'paymentPartnerProcessorId' | 'cart'
>;

export default async function fullCreditsProcessor(
	transactionOptions: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	const { siteId, responseCart, includeDomainDetails, includeGSuiteDetails } = transactionOptions;

	const managedContactDetails: ManagedContactDetails | undefined = select(
		'wpcom'
	)?.getContactInfo();

	return submitCreditsTransaction(
		{
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
	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...transactionData,
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId: transactionOptions.siteId ? String( transactionOptions.siteId ) : undefined,
			contactDetails: transactionData.domainDetails ?? null,
			responseCart: transactionOptions.responseCart,
		} ),
		paymentMethodType: 'WPCOM_Billing_WPCOM',
	} );
	debug( 'submitting full credits transaction', formattedTransactionData );
	return submitWpcomTransaction( formattedTransactionData, transactionOptions );
}
