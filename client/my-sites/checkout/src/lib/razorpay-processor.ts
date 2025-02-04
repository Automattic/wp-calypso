import {
	RazorpayConfigurationError,
	type Razorpay,
	type RazorpayConfiguration,
	type RazorpayConfirmationRequestArgs,
	RazorpayOptions,
	RazorpayModalResponse,
} from '@automattic/calypso-razorpay';
import {
	makeErrorResponse,
	makeSuccessResponse,
	isErrorResponse,
} from '@automattic/composite-checkout';
import {
	ManagedContactDetails,
	WPCOMTransactionEndpointRequestPayload,
	WPCOMTransactionEndpointResponseRedirect,
} from '@automattic/wpcom-checkout';
import debugFactory from 'debug';
import { LocalizeProps } from 'i18n-calypso';
import { confirmRazorpayOrder } from 'calypso/lib/store-transactions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { logStashEvent, recordTransactionBeginAnalytics } from '../lib/analytics';
import getDomainDetails from './get-domain-details';
import getPostalCode from './get-postal-code';
import submitWpcomTransaction from './submit-wpcom-transaction';
import {
	createTransactionEndpointRequestPayload,
	createTransactionEndpointCartFromResponseCart,
} from './translate-cart';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';

const debug = debugFactory( 'calypso:razorpay-processor' );

type RazorpayTransactionRequest = {
	razorpay: Razorpay;
	razorpayConfiguration: RazorpayConfiguration;
	name: string | undefined;
};

export default async function razorpayProcessor(
	submitData: unknown,
	transactionOptions: PaymentProcessorOptions,
	translate: LocalizeProps[ 'translate' ]
): Promise< PaymentProcessorResponse > {
	if ( ! isValidTransactionData( submitData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}
	if ( ! isValidTransactionOptions( transactionOptions ) ) {
		throw new Error( 'Required processor options are missing' );
	}

	transactionOptions.reduxDispatch(
		recordTransactionBeginAnalytics( { paymentMethodId: 'razorpay' } )
	);

	const { includeDomainDetails, includeGSuiteDetails, responseCart, siteId, contactDetails } =
		transactionOptions;

	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...submitData,
		name: submitData.name ?? '',
		country: contactDetails?.countryCode?.value ?? '',
		postalCode: getPostalCode( contactDetails ),
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
		paymentMethodType: 'WPCOM_Billing_Razorpay',
		paymentPartnerProcessorId: 'razorpay',
	} );
	debug( 'submitting razorpay transaction', formattedTransactionData );
	// Initiate razorpay order between wpcom and razorpay
	return submitWpcomTransaction( formattedTransactionData, transactionOptions )
		.then( async ( response ) => {
			// Initiate purchase flow between user and razorpay
			debug( 'Razorpay Wpcom transaction response', response );
			return new Promise( ( resolve ) => {
				// Last minute check that the global Razorpay class exists.
				if ( typeof window === 'undefined' || ! window.Razorpay ) {
					debug( 'Razorpay object not defined!' );
					throw new RazorpayConfigurationError(
						'Razorpay submission error: Razorpay object not defined'
					);
				}
				// We have to initialize Razorpay here because we need the order ID that
				// comes from the transactions endpoint.
				const razorpayOptions = combineRazorpayOptions(
					transactionOptions.razorpayConfiguration,
					transactionOptions.contactDetails,
					response as WPCOMTransactionEndpointResponseRedirect,
					( result ) => {
						transactionOptions.reduxDispatch(
							recordTracksEvent(
								'calypso_checkout_razorpay_modal_complete',
								constructTracksProps( formattedTransactionData, {} )
							)
						);
						return resolve( { bd_order_id: response.order_id.toString(), ...result } );
					},
					() => {
						transactionOptions.reduxDispatch(
							recordTracksEvent(
								'calypso_checkout_razorpay_modal_dismissed',
								constructTracksProps( formattedTransactionData, {} )
							)
						);
						return resolve( {} );
					}
				);
				debug( 'Opening Razorpay modal with options', razorpayOptions );
				transactionOptions.reduxDispatch(
					recordTracksEvent(
						'calypso_checkout_razorpay_modal_open',
						constructTracksProps( formattedTransactionData, {} )
					)
				);
				const razorpay = new window.Razorpay( razorpayOptions );
				razorpay.open();
			} );
		} )
		.then( ( purchaseResult ) => {
			// Confirm purchase result between user and wpcom
			debug( 'Razorpay purchase result', purchaseResult );
			if (
				purchaseResult &&
				typeof purchaseResult === 'object' &&
				'razorpay_payment_id' in purchaseResult &&
				'razorpay_signature' in purchaseResult &&
				'bd_order_id' in purchaseResult
			) {
				return confirmRazorpayOrder( purchaseResult as RazorpayConfirmationRequestArgs );
			}

			// If we get here, most likely the user either closed or back-buttoned out of the modal.
			return makeErrorResponse( translate( 'Payment cancelled.' ) );
		} )
		.then( ( confirmationResult ) => {
			debug( 'Razorpay confirmation result', confirmationResult );

			// Short circuit if an earlier step returned an error response.
			if ( isErrorResponse( confirmationResult ) ) {
				return confirmationResult;
			}

			if ( confirmationResult.success === true ) {
				transactionOptions.reduxDispatch(
					recordTracksEvent(
						'calypso_checkout_razorpay_confirmation_success',
						constructTracksProps( formattedTransactionData, confirmationResult )
					)
				);
				return makeSuccessResponse( confirmationResult );
			}
			// This should not happen because the API will have returned an
			// error response if there was a problem confirming the payment.
			return makeErrorResponse( 'Unexpected confirmation result status' );
		} )
		.catch( ( error: Error ) => {
			debug( 'transaction failed' );
			transactionOptions.reduxDispatch(
				recordTracksEvent( 'calypso_checkout_razorpay_transaction_error', {
					error: error.message,
				} )
			);
			logStashEvent( 'calypso_checkout_razorpay_transaction_error', {
				error: error.message,
			} );
			return makeErrorResponse( error.message );
		} );
}

function isValidTransactionData( submitData: unknown ): submitData is RazorpayTransactionRequest {
	return true;
}

function isValidTransactionOptions( options: unknown ): options is RazorpayTransactionRequest {
	const data = options as RazorpayTransactionRequest;
	if ( ! data?.razorpayConfiguration ) {
		throw new Error( 'Transaction requires razorpayConfiguration and none was provided' );
	}
	return true;
}

function combineRazorpayOptions(
	razorpayConfiguration: RazorpayConfiguration,
	contactDetails: ManagedContactDetails | undefined,
	txnResponse: WPCOMTransactionEndpointResponseRedirect,
	handler: ( response: RazorpayModalResponse ) => void,
	ondismiss: () => void
): RazorpayOptions {
	if ( ! txnResponse.razorpay_order_id ) {
		throw new Error( 'Missing order_id for razorpay transaction' );
	}

	const options = razorpayConfiguration.options;
	options.order_id = txnResponse.razorpay_order_id;
	options.customer_id = txnResponse.razorpay_customer_id;
	if ( txnResponse.razorpay_option_recurring ) {
		options.recurring = '1';
	}

	options.handler = handler;
	const modal = options.modal ?? {};
	modal.ondismiss = ondismiss;
	options.modal = modal;

	debug( 'Constructing Razorpay prefill object using contact details', contactDetails );
	const prefill = options.prefill ?? {};
	prefill.contact =
		prefill.contact ?? ( contactDetails ? contactDetails.phone?.value.replace( '.', '' ) : '' );
	prefill.email = prefill.email ?? ( contactDetails ? contactDetails.email?.value : '' );
	options.prefill = prefill;

	return options;
}

function constructTracksProps(
	transactionData: WPCOMTransactionEndpointRequestPayload,
	confirmationResult: object
): object {
	const tracksProps = {
		blog_id: transactionData.cart.blog_id,
		price_integer:
			'price_integer' in confirmationResult ? confirmationResult.price_integer : 'unset',
		receipt_id: 'receipt_id' in confirmationResult ? confirmationResult.receipt_id : 'unset',
		success: 'success' in confirmationResult ? confirmationResult.success : 'unset',
	};
	return tracksProps;
}
