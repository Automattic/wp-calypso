import {
	makeErrorResponse,
	makeRedirectResponse,
	makeSuccessResponse,
} from '@automattic/composite-checkout';
import { createElement } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { PurchaseOrderStatus, fetchPurchaseOrder } from '../hooks/use-purchase-order';
import { recordTransactionBeginAnalytics } from '../lib/analytics';
import getDomainDetails from '../lib/get-domain-details';
import getPostalCode from '../lib/get-postal-code';
import prepareRedirectTransaction from '../lib/prepare-redirect-transaction';
import { addUrlToPendingPageRedirect } from './pending-page';
import submitWpcomTransaction from './submit-wpcom-transaction';
import { UpiConfirmation } from './upi-confirmation';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type {
	WPCOMTransactionEndpointResponse,
	WPCOMTransactionEndpointResponseSuccess,
} from '@automattic/wpcom-checkout';
import type { LocalizeProps } from 'i18n-calypso';

type StripeUpiTransactionRequest = {
	name: string;
	address: string;
	streetNumber: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
};

export default async function upiProcessor(
	submitData: unknown,
	options: PaymentProcessorOptions,
	translate: LocalizeProps[ 'translate' ],
	fromExternalCheckout?: boolean
): Promise< PaymentProcessorResponse > {
	if ( ! isValidTransactionData( submitData ) ) {
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
		fromSiteSlug,
	} = options;
	const paymentMethodId = 'stripe-upi';

	reduxDispatch( recordTransactionBeginAnalytics( { paymentMethodId } ) );

	const {
		origin = 'https://wordpress.com',
		pathname = '/',
		search = '',
	} = typeof window !== 'undefined' ? window.location : {};
	const thankYouUrl = getThankYouUrl() || 'https://wordpress.com';
	const successUrl = addUrlToPendingPageRedirect( thankYouUrl, {
		siteSlug,
		fromSiteSlug,
		fromExternalCheckout,
		urlType: 'absolute',
	} );
	const cancelUrl = `${ origin }${ pathname }${ search }`;

	const formattedTransactionData = prepareRedirectTransaction(
		paymentMethodId,
		{
			...submitData,
			name: submitData.name ?? '',
			successUrl,
			cancelUrl,
			couponId: responseCart.coupon,
			country: contactDetails?.countryCode?.value ?? '',
			postalCode: getPostalCode( contactDetails ),
			subdivisionCode: contactDetails?.state?.value,
			siteId: siteId ? String( siteId ) : '',
			domainDetails: getDomainDetails( contactDetails, {
				includeDomainDetails,
				includeGSuiteDetails,
			} ),
		},
		options
	);

	const genericErrorMessage = translate(
		"Sorry, we couldn't process your payment. Please try again later."
	);
	const genericFailureMessage = translate(
		'Payment failed. Please check your account and try again.'
	);

	const root = getRenderRoot( genericErrorMessage );
	let rootUnmounted = false;
	const safeDismissModal = () => {
		if ( ! rootUnmounted ) {
			rootUnmounted = true;
			hideModal( root );
		}
	};

	return submitWpcomTransaction( formattedTransactionData, options )
		.then( async ( response?: WPCOMTransactionEndpointResponse ) => {
			if ( ! response?.redirect_url ) {
				// eslint-disable-next-line no-console
				console.error( 'Transaction response was missing required redirect url' );
				throw new Error( genericErrorMessage );
			}

			if ( ! response.order_id ) {
				// eslint-disable-next-line no-console
				console.error( 'Transaction response was missing required order ID' );
				throw new Error( genericErrorMessage );
			}

			const pendingPageUrl = addUrlToPendingPageRedirect( thankYouUrl, {
				siteSlug,
				fromSiteSlug,
				fromExternalCheckout,
				orderId: response.order_id,
				urlType: 'absolute',
			} );

			let isModalActive = true;
			let explicitClosureMessage: string | undefined;
			displayModal( {
				root,
				redirectUrl: response.redirect_url,
				cancel: () => {
					safeDismissModal();
					isModalActive = false;
					explicitClosureMessage = translate( 'Payment cancelled.' );
				},
				error: () => {
					safeDismissModal();
					isModalActive = false;
					explicitClosureMessage = genericErrorMessage;
				},
			} );

			let orderStatus = 'processing';
			while ( isModalActive && [ 'processing', 'async-pending' ].includes( orderStatus ) ) {
				orderStatus = await pollForOrderStatus( response.order_id, 2000, genericErrorMessage );
			}
			if ( orderStatus === 'payment-confirmed' ) {
				safeDismissModal();
				return makeRedirectResponse( pendingPageUrl );
			}
			if ( orderStatus !== 'success' ) {
				throw new Error( explicitClosureMessage ?? genericFailureMessage );
			}

			safeDismissModal();

			const responseData: Partial< WPCOMTransactionEndpointResponseSuccess > = {
				success: true,
				order_id: response.order_id,
			};
			return makeSuccessResponse( responseData );
		} )
		.catch( ( error ) => {
			safeDismissModal();
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
	if (
		orderData.processing_status === 'success' ||
		orderData.processing_status === 'payment-confirmed'
	) {
		return orderData.processing_status;
	}
	await new Promise( ( resolve ) => setTimeout( resolve, pollInterval ) );
	return orderData.processing_status;
}

function getRenderRoot( genericErrorMessage: string ) {
	const dialogTarget = document.querySelector( '.upi-modal-target' );
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
	redirectUrl,
	cancel,
	error,
}: {
	root: Root;
	redirectUrl: string;
	cancel: () => void;
	error: () => void;
} ) {
	root.render(
		createElement( UpiConfirmation, {
			redirectUrl,
			cancel,
		} )
	);

	// We have to activate the `<dialog>` element after a moment because we
	// need to give React a chance to render it.
	setTimeout( () => {
		const dialogElement = document.querySelector( 'dialog.upi-confirmation' );
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

function isValidTransactionData( submitData: unknown ): submitData is StripeUpiTransactionRequest {
	const data = submitData as StripeUpiTransactionRequest;
	if ( ! data ) {
		throw new Error( 'Transaction requires data and none was provided' );
	}
	return true;
}
