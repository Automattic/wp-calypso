import {
	makeRedirectResponse,
	makeErrorResponse,
	makeSuccessResponse,
} from '@automattic/composite-checkout';
import { createElement } from 'react';
import { Root, createRoot } from 'react-dom/client';
import userAgent from 'calypso/lib/user-agent';
import { PurchaseOrderStatus, fetchPurchaseOrder } from '../hooks/use-purchase-order';
import { recordTransactionBeginAnalytics } from '../lib/analytics';
import getDomainDetails from '../lib/get-domain-details';
import getPostalCode from '../lib/get-postal-code';
import prepareRedirectTransaction from '../lib/prepare-redirect-transaction';
import { addUrlToPendingPageRedirect } from './pending-page';
import submitWpcomTransaction from './submit-wpcom-transaction';
import { WeChatConfirmation } from './we-chat-confirmation';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type {
	WPCOMTransactionEndpointResponse,
	WPCOMTransactionEndpointResponseSuccess,
} from '@automattic/wpcom-checkout';
import type { LocalizeProps } from 'i18n-calypso';

type WeChatTransactionRequest = {
	name: string | undefined;
	email: string | undefined;
};

export default async function weChatProcessor(
	submitData: unknown,
	options: PaymentProcessorOptions,
	translate: LocalizeProps[ 'translate' ]
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
	} = options;
	const paymentMethodId = 'wechat';

	reduxDispatch( recordTransactionBeginAnalytics( { paymentMethodId } ) );

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

	const formattedTransactionData = prepareRedirectTransaction(
		paymentMethodId,
		{
			...submitData,
			name: submitData.name ?? '',
			successUrl: successUrl.toString(),
			cancelUrl: cancelUrl.toString(),
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

	return submitWpcomTransaction( formattedTransactionData, options )
		.then( async ( response?: WPCOMTransactionEndpointResponse ) => {
			if ( ! response || ! ( 'redirect_url' in response ) || ! response.redirect_url ) {
				// eslint-disable-next-line no-console
				console.error( 'Transaction response was missing required redirect url' );
				throw new Error( genericErrorMessage );
			}

			// The WeChat payment type should only redirect when on mobile as redirect urls
			// are mobile app urls: e.g. weixin://wxpay/bizpayurl?pr=RaXzhu4
			if ( userAgent.isMobile && response.redirect_url ) {
				return makeRedirectResponse( response?.redirect_url );
			}

			if ( ! response.order_id ) {
				// eslint-disable-next-line no-console
				console.error( 'Transaction response was missing required order ID' );
				throw new Error( genericErrorMessage );
			}

			let isModalActive = true;
			let explicitClosureMessage: string | undefined;
			displayWeChatModal(
				root,
				response.redirect_url,
				responseCart.total_cost_integer,
				responseCart.currency,
				() => {
					hideWeChatModal( root );
					isModalActive = false;
					explicitClosureMessage = translate( 'Payment cancelled.' );
				},
				() => {
					hideWeChatModal( root );
					isModalActive = false;
					explicitClosureMessage = genericErrorMessage;
				}
			);

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
			hideWeChatModal( root );
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
	const weChatTarget = document.querySelector( '.we-chat-modal-target' );
	if ( ! weChatTarget ) {
		// eslint-disable-next-line no-console
		console.error( 'Dialog target was not found.' );
		throw new Error( genericErrorMessage );
	}
	return createRoot( weChatTarget );
}

function hideWeChatModal( root: Root ): void {
	root.unmount();
}

function displayWeChatModal(
	root: Root,
	redirectUrl: string,
	priceInteger: number,
	priceCurrency: string,
	cancel: () => void,
	error: () => void
) {
	root.render(
		createElement( WeChatConfirmation, {
			redirectUrl,
			priceInteger,
			priceCurrency,
		} )
	);

	// We have to activate the `<dialog>` element after a moment because we
	// need to give React a chance to render it.
	setTimeout( () => {
		const dialogElement = document.querySelector( 'dialog.we-chat-confirmation' );
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
		// Hide the dialog if you click outside it.
		dialogElement.addEventListener( 'click', ( event ) => {
			if ( event.target === event.currentTarget ) {
				cancel();
			}
		} );
	} );
	return root;
}

function isValidTransactionData( submitData: unknown ): submitData is WeChatTransactionRequest {
	const data = submitData as WeChatTransactionRequest;
	if ( ! data ) {
		throw new Error( 'Transaction requires data and none was provided' );
	}
	return true;
}
