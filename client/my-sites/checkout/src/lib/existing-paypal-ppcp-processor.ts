import { makeSuccessResponse, makeErrorResponse } from '@automattic/composite-checkout';
import debugFactory from 'debug';
import { recordTransactionBeginAnalytics } from '../lib/analytics';
import getDomainDetails from './get-domain-details';
import getPostalCode from './get-postal-code';
import submitWpcomTransaction from './submit-wpcom-transaction';
import {
	createTransactionEndpointCartFromResponseCart,
	createTransactionEndpointRequestPayload,
} from './translate-cart';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type { TransactionRequest } from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:composite-checkout:existing-paypal-ppcp-processor' );

type ExistingPayPalPPCPTransactionRequest = Partial<
	Omit< TransactionRequest, 'paymentMethodType' >
> &
	Required<
		Pick<
			TransactionRequest,
			'storedDetailsId' | 'paymentMethodToken' | 'paymentPartnerProcessorId'
		>
	>;

export default async function existingPayPalPPCPProcessor(
	transactionData: unknown,
	dataForProcessor: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	if ( ! isValidTransactionData( transactionData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}
	const {
		includeDomainDetails,
		includeGSuiteDetails,
		contactDetails,
		reduxDispatch,
		responseCart,
	} = dataForProcessor;
	reduxDispatch( recordTransactionBeginAnalytics( { paymentMethodId: 'existingPayPalPPCP' } ) );

	const domainDetails = getDomainDetails( contactDetails, {
		includeDomainDetails,
		includeGSuiteDetails,
	} );
	debug( 'formatting existing PayPal PPCP transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...transactionData,
		name: transactionData.email ?? '',
		country: contactDetails?.countryCode?.value ?? '',
		postalCode: getPostalCode( contactDetails ),
		subdivisionCode: contactDetails?.state?.value,
		domainDetails,
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId: dataForProcessor.siteId,
			contactDetails: domainDetails ?? null,
			responseCart,
		} ),
		paymentMethodType: 'WPCOM_Billing_MoneyPress_Stored',
	} );
	debug( 'submitting existing PayPal PPCP transaction', formattedTransactionData );

	return submitWpcomTransaction( formattedTransactionData, dataForProcessor )
		.then( ( response ) => {
			debug( 'transaction was successful' );
			return makeSuccessResponse( response );
		} )
		.catch( ( error: Error ) => {
			debug( 'transaction failed' );
			// Errors here are "expected" errors, meaning that they (hopefully) come
			// from the endpoint and not from some bug in the frontend code.
			return makeErrorResponse( error.message );
		} );
}

function isValidTransactionData(
	submitData: unknown
): submitData is ExistingPayPalPPCPTransactionRequest {
	const data = submitData as ExistingPayPalPPCPTransactionRequest;
	// Validate data required for this payment method type. Some other data may
	// be required by the server but not required here since the server will give
	// a better localized error message than we can provide.
	if ( ! data.storedDetailsId ) {
		throw new Error( 'Transaction requires saved PayPal information and none was provided' );
	}
	if ( ! data.paymentMethodToken ) {
		throw new Error( 'Transaction requires a payment token and none was provided' );
	}
	if ( ! data.paymentPartnerProcessorId ) {
		throw new Error( 'Transaction requires a processor id and none was provided' );
	}
	return true;
}
