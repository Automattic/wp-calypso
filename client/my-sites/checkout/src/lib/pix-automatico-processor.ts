import { makeErrorResponse, makeSuccessResponse } from '@automattic/composite-checkout';
import { isValidBrazilianTaxId } from '@automattic/wpcom-checkout';
import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { Root, createRoot } from 'react-dom/client';
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

export async function pixAutomaticoProcessor(
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
	const paymentMethodId = 'pix_automatico';

	reduxDispatch( recordTransactionBeginAnalytics( { paymentMethodId } ) );

	if ( ! isValidBrazilianTaxId( submitData.document ) ) {
		return makeErrorResponse(
			translate( 'Your CPF or CNPJ is invalid. Please verify that you have entered it correctly.', {
				textOnly: true,
				comment:
					'Error shown when the Brazilian taxpayer ID (CPF for individuals, CNPJ for companies) entered at checkout fails validation',
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
		paymentMethodType: 'WPCOM_Billing_Ebanx_Redirect_Brazil_Pix_Automatico',
	} );

	const genericErrorMessage = translate(
		"Sorry, we couldn't process your payment. Please try again later."
	);
	const genericFailureMessage = translate(
		'Payment failed. Please check your account and try again.'
	);

	const container = createModalContainer();
	let root: Root | null = null;
	let rootUnmounted = false;
	const safeDismissModal = () => {
		if ( ! rootUnmounted ) {
			rootUnmounted = true;
			root?.unmount();
			container.remove();
		}
	};

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
			root = displayModal( {
				container,
				qrCode: response.qr_code,
				priceInteger: responseCart.total_cost_integer,
				priceCurrency: responseCart.currency,
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
				isAkismet: options.isAkismetSitelessCheckout,
				isJetpackNotAtomic: options.isJetpackNotAtomic,
				isPixAutomatico: true,
			} );

			let orderStatus = 'processing';
			while ( isModalActive && [ 'processing', 'async-pending' ].includes( orderStatus ) ) {
				orderStatus = await pollForOrderStatus( response.order_id, 2000, genericErrorMessage );
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
	if ( orderData.processing_status === 'success' ) {
		return orderData.processing_status;
	}
	await new Promise( ( resolve ) => setTimeout( resolve, pollInterval ) );
	return orderData.processing_status;
}

function createModalContainer(): HTMLElement {
	// Render into a fresh container appended to the body rather than a node
	// owned by the outer checkout React tree.
	const container = document.createElement( 'div' );
	container.className = 'pix-automatico-modal-target';
	document.body.appendChild( container );
	return container;
}

function displayModal( {
	container,
	qrCode,
	priceInteger,
	priceCurrency,
	cancel,
	error,
	isAkismet,
	isJetpackNotAtomic,
	isPixAutomatico,
}: {
	container: HTMLElement;
	qrCode: string;
	priceInteger: number;
	priceCurrency: string;
	cancel: () => void;
	error: () => void;
	isAkismet: boolean;
	isJetpackNotAtomic: boolean;
	isPixAutomatico: boolean;
} ): Root {
	// Create the root and render into it in the same tick: under React 19 a
	// root created earlier (before the async transaction) never commits its
	// later render. flushSync forces the render to commit synchronously so the
	// dialog element exists in the DOM before we call showModal().
	const root = createRoot( container );
	flushSync( () => {
		root.render(
			createElement( PixConfirmation, {
				qrCode,
				priceInteger,
				priceCurrency,
				cancel,
				isAkismet,
				isJetpackNotAtomic,
				isPixAutomatico,
			} )
		);
	} );

	const dialogElement = container.querySelector( 'dialog.pix-confirmation' );
	if ( ! dialogElement || ! ( 'showModal' in dialogElement ) ) {
		// eslint-disable-next-line no-console
		console.error( 'Dialog was not found or browser does not support dialogs.' );
		error();
		return root;
	}

	// dialog elements are a new addition to HTML but should be
	// supported by all the browsers that calypso supports.
	// Nevertheless, TypeScript does not know about it.
	( dialogElement.showModal as () => void )();
	dialogElement.addEventListener( 'close', () => cancel() );
	return root;
}

function isValidEbanxCardTransactionData(
	submitData: unknown
): submitData is EbanxCardTransactionRequest {
	if ( ! submitData || typeof submitData !== 'object' ) {
		return false;
	}
	const data = submitData as EbanxCardTransactionRequest;
	return (
		typeof data.name === 'string' &&
		typeof data.countryCode === 'string' &&
		typeof data.state === 'string' &&
		typeof data.city === 'string' &&
		typeof data.postalCode === 'string' &&
		typeof data.address === 'string' &&
		typeof data.streetNumber === 'string' &&
		typeof data.phoneNumber === 'string' &&
		typeof data.document === 'string'
	);
}
