import { makeErrorResponse, makeSuccessResponse } from '@automattic/composite-checkout';
import { createElement } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { isValidCPF } from 'calypso/lib/checkout/processor-specific';
import { PurchaseOrderStatus, fetchPurchaseOrder } from '../hooks/use-purchase-order';
import { recordTransactionBeginAnalytics } from '../lib/analytics';
import getDomainDetails from '../lib/get-domain-details';
import getPostalCode from '../lib/get-postal-code';
import { addUrlToPendingPageRedirect } from './pending-page';
import { PixConfirmation } from './pix-confirmation';
import submitWpcomTransaction from './submit-wpcom-transaction';
import {
	createTransactionEndpointCartFromResponseCart,
	createTransactionEndpointRequestPayload,
} from './translate-cart';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type {
	WPCOMTransactionEndpointResponse,
	WPCOMTransactionEndpointResponseSuccess,
} from '@automattic/wpcom-checkout';
import type { LocalizeProps } from 'i18n-calypso';

type EbanxCardTransactionRequest = {
	name: string;
	countryCode: string;
	state: string;
	city: string;
	postalCode: string;
	address: string;
	streetNumber: string;
	phoneNumber: string;
	document: string;
};

export async function pixProcessor(
	submitData: unknown,
	options: PaymentProcessorOptions,
	translate: LocalizeProps[ 'translate' ]
): Promise< PaymentProcessorResponse > {
	if ( ! isValidEbanxCardTransactionData( submitData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}
	const {
		getThankYouUrl,
		siteSlug,
		siteId,
		includeDomainDetails,
		includeGSuiteDetails,
		reduxDispatch,
		responseCart,
		contactDetails,
	} = options;
	const paymentMethodId = 'pix';

	reduxDispatch( recordTransactionBeginAnalytics( { paymentMethodId } ) );

	if ( ! isValidCPF( submitData.document ) ) {
		return makeErrorResponse(
			translate( 'Your CPF is invalid. Please verify that you have entered it correctly.', {
				textOnly: true,
			} )
		);
	}

	const baseURL = new URL(
		typeof window !== 'undefined' ? window.location.href : 'https://wordpress.com'
	);

	const thankYouUrl = getThankYouUrl() || 'https://wordpress.com';
	const successUrl = addUrlToPendingPageRedirect( thankYouUrl, {
		siteSlug,
		urlType: 'absolute',
	} );

	// Clear all query params from the base URL:
	const cancelUrl = new URL( baseURL );
	cancelUrl.search = '';

	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...submitData,
		successUrl: successUrl.toString(),
		cancelUrl: cancelUrl.toString(),
		postalCode: getPostalCode( contactDetails ),
		couponId: responseCart.coupon,
		country: contactDetails?.countryCode?.value ?? '',
		subdivisionCode: contactDetails?.state?.value,
		domainDetails: getDomainDetails( contactDetails, {
			includeDomainDetails,
			includeGSuiteDetails,
		} ),
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId,
			contactDetails:
				getDomainDetails( contactDetails, { includeDomainDetails, includeGSuiteDetails } ) ?? null,
			responseCart,
		} ),
		paymentMethodType: 'WPCOM_Billing_Ebanx_Redirect_Brazil_Pix',
	} );

	const genericErrorMessage = translate(
		"Sorry, we couldn't process your payment. Please try again later."
	);
	const genericFailureMessage = translate(
		'Payment failed. Please check your account and try again.'
	);

	const root = getRenderRoot( genericErrorMessage );

	return submitWpcomTransaction( formattedTransactionData, options )
		.then( async ( response?: WPCOMTransactionEndpointResponse ) => {
			if ( ! response?.redirect_url ) {
				// eslint-disable-next-line no-console
				console.error( 'Transaction response was missing required redirect url' );
				throw new Error( genericErrorMessage );
			}

			if ( ! response?.qr_code ) {
				// eslint-disable-next-line no-console
				console.error( 'Transaction response was missing required qr code' );
				throw new Error( genericErrorMessage );
			}

			if ( ! response.order_id ) {
				// eslint-disable-next-line no-console
				console.error( 'Transaction response was missing required order ID' );
				throw new Error( genericErrorMessage );
			}

			let isModalActive = true;
			let explicitClosureMessage: string | undefined;
			displayModal( {
				root,
				qrCode: response.qr_code,
				priceInteger: responseCart.total_cost_integer,
				priceCurrency: responseCart.currency,
				cancel: () => {
					hideModal( root );
					isModalActive = false;
					explicitClosureMessage = translate( 'Payment cancelled.' );
				},
				error: () => {
					hideModal( root );
					isModalActive = false;
					explicitClosureMessage = genericErrorMessage;
				},
				isAkismet: options.isAkismetSitelessCheckout,
				isJetpackNotAtomic: options.isJetpackNotAtomic,
			} );

			let orderStatus = 'processing';
			while ( isModalActive && [ 'processing', 'async-pending' ].includes( orderStatus ) ) {
				orderStatus = await pollForOrderStatus( response.order_id, 2000, genericErrorMessage );
			}
			if ( orderStatus !== 'success' ) {
				throw new Error( explicitClosureMessage ?? genericFailureMessage );
			}

			const responseData: Partial< WPCOMTransactionEndpointResponseSuccess > = {
				success: true,
				order_id: response.order_id,
			};
			return makeSuccessResponse( responseData );
		} )
		.catch( ( error ) => {
			hideModal( root );
			return makeErrorResponse( error.message );
		} );
}

async function pollForOrderStatus(
	orderId: number,
	pollInterval: number,
	genericErrorMessage: string
): Promise< PurchaseOrderStatus > {
	const orderData = await fetchPurchaseOrder( orderId );
	if ( ! orderData ) {
		// eslint-disable-next-line no-console
		console.error( 'Order was not found.' );
		throw new Error( genericErrorMessage );
	}
	if ( orderData.processing_status === 'success' ) {
		return orderData.processing_status;
	}
	await new Promise( ( resolve ) => setTimeout( resolve, pollInterval ) );
	return orderData.processing_status;
}

function getRenderRoot( genericErrorMessage: string ) {
	const dialogTarget = document.querySelector( '.pix-modal-target' );
	if ( ! dialogTarget ) {
		// eslint-disable-next-line no-console
		console.error( 'Dialog target was not found.' );
		throw new Error( genericErrorMessage );
	}
	return createRoot( dialogTarget );
}

function hideModal( root: Root ): void {
	root.unmount();
}

function displayModal( {
	root,
	qrCode,
	priceInteger,
	priceCurrency,
	cancel,
	error,
	isAkismet,
	isJetpackNotAtomic,
}: {
	root: Root;
	qrCode: string;
	priceInteger: number;
	priceCurrency: string;
	cancel: () => void;
	error: () => void;
	isAkismet: boolean;
	isJetpackNotAtomic: boolean;
} ) {
	root.render(
		createElement( PixConfirmation, {
			qrCode,
			priceInteger,
			priceCurrency,
			cancel,
			isAkismet,
			isJetpackNotAtomic,
		} )
	);

	// We have to activate the `<dialog>` element after a moment because we
	// need to give React a chance to render it.
	setTimeout( () => {
		const dialogElement = document.querySelector( 'dialog.pix-confirmation' );
		if ( ! dialogElement || ! ( 'showModal' in dialogElement ) ) {
			// eslint-disable-next-line no-console
			console.error( 'Dialog was not found or browser does not support dialogs.' );
			error();
			return;
		}

		// dialog elements are a new addition to HTML but should be
		// supported by all the browsers that calypso supports.
		// Nevertheless, TypeScript does not know about it.
		( dialogElement.showModal as () => void )();
		dialogElement.addEventListener( 'close', () => cancel() );
	} );
	return root;
}

function isValidEbanxCardTransactionData(
	submitData: unknown
): submitData is EbanxCardTransactionRequest {
	const data = submitData as EbanxCardTransactionRequest;
	if ( ! data ) {
		throw new Error( 'Transaction requires data and none was provided' );
	}
	return true;
}
