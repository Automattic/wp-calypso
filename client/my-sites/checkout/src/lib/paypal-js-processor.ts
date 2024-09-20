import { makeErrorResponse, makeSuccessResponse } from '@automattic/composite-checkout';
import debugFactory from 'debug';
import { recordTransactionBeginAnalytics } from '../lib/analytics';
import getDomainDetails from '../lib/get-domain-details';
import {
	createTransactionEndpointCartFromResponseCart,
	createTransactionEndpointRequestPayload,
} from '../lib/translate-cart';
import getPostalCode from './get-postal-code';
import submitWpcomTransaction from './submit-wpcom-transaction';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';

const debug = debugFactory( 'calypso:paypal-js-processor' );

type PayPalSubmitData = {
	resolvePayPalOrderPromise: ( payPalOrderId: string ) => Promise< string >;
	payPalApprovalPromise: Promise< void >;
};

function isValidPayPalJsSubmitData( data: unknown ): data is PayPalSubmitData {
	const payPalData = data as PayPalSubmitData;
	if ( 'resolvePayPalOrderPromise' in payPalData ) {
		return true;
	}
	return false;
}

export async function payPalJsProcessor(
	submitData: unknown,
	transactionOptions: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	if ( ! isValidPayPalJsSubmitData( submitData ) ) {
		throw new Error( 'Missing promise in submitted PayPal data' );
	}
	const {
		createUserAndSiteBeforeTransaction,
		reduxDispatch,
		includeDomainDetails,
		includeGSuiteDetails,
		responseCart,
		siteId,
		siteSlug,
		contactDetails,
	} = transactionOptions;
	reduxDispatch( recordTransactionBeginAnalytics( { paymentMethodId: 'paypal-js' } ) );

	let currentUrl;
	try {
		currentUrl = new URL( window.location.href );
	} catch ( error ) {
		currentUrl = new URL( `https://wordpress.com/checkout/${ siteSlug }` );
	}
	// We must strip out the hash value because it may break URL encoding when
	// this value is passed back and forth to PayPal and through our own
	// endpoints. Otherwise we may end up with an incorrect URL like
	// 'http://wordpress.com/checkout?cart=no-user#step2?paypal=ABCDEFG'.
	currentUrl.hash = '';
	if ( createUserAndSiteBeforeTransaction ) {
		// It's not clear if this is still required but it may be.
		currentUrl.searchParams.set( 'cart', 'no-user' );
	}

	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		name: '',
		country: contactDetails?.countryCode?.value ?? '',
		postalCode: getPostalCode( contactDetails ),
		subdivisionCode: contactDetails?.state?.value,
		siteId: transactionOptions.siteId ? String( transactionOptions.siteId ) : undefined,
		domainDetails: getDomainDetails( contactDetails, {
			includeDomainDetails,
			includeGSuiteDetails,
		} ),
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId,
			contactDetails:
				getDomainDetails( contactDetails, { includeDomainDetails, includeGSuiteDetails } ) ?? null,
			responseCart: responseCart,
		} ),
		paymentMethodType: 'WPCOM_PayPal_JS', // FIXME: replace this with the new payment method name
	} );
	debug( 'sending paypal transaction', formattedTransactionData );
	try {
		const response = await submitWpcomTransaction( formattedTransactionData, transactionOptions );
		if ( ! ( 'paypal_order_id' in response ) ) {
			return makeErrorResponse( 'PayPal response did not include order ID' );
		}

		// Resolve the Promise which will trigger the PayPal button to display the confirmation dialog.
		submitData.resolvePayPalOrderPromise( response.paypal_order_id );

		// Wait for the PayPal dialog to complete before continuing.
		await submitData.payPalApprovalPromise;

		return makeSuccessResponse( response );
	} catch ( error ) {
		const errorError = error as Error;
		return makeErrorResponse( errorError.message ?? 'PayPal transaction had an uknown error' );
	}
}
