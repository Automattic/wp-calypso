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
import submitWpcomTransaction from './submit-wpcom-transaction';
import { WeChatConfirmation } from './we-chat-confirmation';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type {
	WPCOMTransactionEndpointResponse,
	WPCOMTransactionEndpointResponseSuccess,
} from '@automattic/wpcom-checkout';

type WeChatTransactionRequest = {
	name: string | undefined;
	email: string | undefined;
};

export default async function weChatProcessor(
	submitData: unknown,
	options: PaymentProcessorOptions
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

	const redirectToSuccessUrl = new URL( baseURL );
	redirectToSuccessUrl.pathname = getThankYouUrl();

	const successUrl = new URL( baseURL );
	successUrl.pathname = `/checkout/thank-you/${ siteSlug || 'no-site' }/pending`;
	successUrl.searchParams.set( 'redirectTo', redirectToSuccessUrl.toString() );

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

	const root = getRenderRoot();

	return submitWpcomTransaction( formattedTransactionData, options )
		.then( async ( response?: WPCOMTransactionEndpointResponse ) => {
			if ( ! response?.redirect_url ) {
				throw new Error( "Sorry, we couldn't process your payment. Please try again later." );
			}

			// The WeChat payment type should only redirect when on mobile as redirect urls
			// are mobile app urls: e.g. weixin://wxpay/bizpayurl?pr=RaXzhu4
			if ( userAgent.isMobile && response.redirect_url ) {
				return makeRedirectResponse( response?.redirect_url );
			}

			if ( ! response.order_id ) {
				throw new Error( "Sorry, we couldn't process your payment. Please try again later." );
			}

			let isModalActive = true;
			displayWeChatModal(
				root,
				response.redirect_url,
				responseCart.total_cost_integer,
				responseCart.currency,
				() => {
					hideWeChatModal( root );
					isModalActive = false;
				}
			);

			let orderStatus = 'processing';
			while ( isModalActive && [ 'processing', 'async-pending' ].includes( orderStatus ) ) {
				orderStatus = await pollForOrderStatus( response.order_id, 2000 );
			}
			if ( orderStatus !== 'success' ) {
				throw new Error( 'Payment failed. Please check your account and try again.' );
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
	pollInterval: number
): Promise< PurchaseOrderStatus > {
	const orderData = await fetchPurchaseOrder( orderId );
	if ( ! orderData ) {
		throw new Error( "Sorry, we couldn't process your payment. Please try again later." );
	}
	if ( orderData.processing_status === 'success' ) {
		return orderData.processing_status;
	}
	await new Promise( ( resolve ) => setTimeout( resolve, pollInterval ) );
	return orderData.processing_status;
}

function getRenderRoot() {
	const weChatTarget = document.querySelector( '.we-chat-modal-target' );
	if ( ! weChatTarget ) {
		throw new Error( "Sorry, we couldn't process your payment. Please try again later." );
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
	cancel: () => void
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
			cancel();
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
