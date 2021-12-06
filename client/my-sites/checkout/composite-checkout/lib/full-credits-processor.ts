import { makeSuccessResponse, makeErrorResponse } from '@automattic/composite-checkout';
import debugFactory from 'debug';
import { recordTransactionBeginAnalytics } from './analytics';
import getDomainDetails from './get-domain-details';
import getPostalCode from './get-postal-code';
import submitWpcomTransaction from './submit-wpcom-transaction';
import {
	createTransactionEndpointRequestPayload,
	createTransactionEndpointCartFromResponseCart,
} from './translate-cart';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type { TransactionRequest } from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:composite-checkout:full-credits-processor' );

type SubmitFullCreditsTransactionData = Omit<
	TransactionRequest,
	'paymentMethodType' | 'paymentPartnerProcessorId' | 'cart'
>;

export default async function fullCreditsProcessor(
	transactionOptions: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	const {
		siteId,
		responseCart,
		includeDomainDetails,
		includeGSuiteDetails,
		contactDetails,
		reduxDispatch,
	} = transactionOptions;

	reduxDispatch( recordTransactionBeginAnalytics( { paymentMethodId: 'full-credits' } ) );

	const formattedTransactionData = prepareCreditsTransaction(
		{
			name: '',
			couponId: responseCart.coupon,
			siteId: siteId ? String( siteId ) : '',
			domainDetails: getDomainDetails( contactDetails, {
				includeDomainDetails,
				includeGSuiteDetails,
			} ),
			country: contactDetails?.countryCode?.value ?? '',
			postalCode: getPostalCode( contactDetails ),
			subdivisionCode: contactDetails?.state?.value,
		},
		transactionOptions
	);

	return submitWpcomTransaction( formattedTransactionData, transactionOptions )
		.then( makeSuccessResponse )
		.catch( ( error ) => makeErrorResponse( error.message ) );
}

function prepareCreditsTransaction(
	transactionData: SubmitFullCreditsTransactionData,
	transactionOptions: PaymentProcessorOptions
) {
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
	return formattedTransactionData;
}
