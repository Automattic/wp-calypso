import { makeErrorResponse, makeSuccessResponse } from '@automattic/composite-checkout';
import { createElement } from 'react';
import { flushSync } from 'react-dom';
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
import type { Stripe } from '@stripe/stripe-js';
import type { LocalizeProps } from 'i18n-calypso';

// stripe.confirmUpiSetup is not yet included in the installed @stripe/stripe-js types (v1.54.2).
// TODO: Remove this local type once @stripe/stripe-js is upgraded to a version that includes it,
// and verify the real signature matches before removing.
type StripeWithUpiSetup = Stripe & {
	confirmUpiSetup: (
		clientSecret: string,
		data: {
			payment_method: {
				upi: Record< string, never >;
				billing_details?: { name?: string };
			};
			mandate_data: {
				customer_acceptance: {
					type: 'online';
					online: { infer_from_client: boolean };
				};
			};
		}
	) => Promise< {
		setupIntent?: {
			next_action?: {
				upi_qr_code?: { hosted_instructions_url: string };
			};
		};
		error?: { message?: string };
	} >;
};

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
			if ( ! response?.order_id ) {
				// eslint-disable-next-line no-console
				console.error( 'Transaction response was missing required order ID' );
				throw new Error( genericErrorMessage );
			}

			const redirectUrl = await getRedirectUrl(
				response,
				submitData,
				options,
				genericErrorMessage
			);

			let isModalActive = true;
			let explicitClosureMessage: string | undefined;
			root = displayModal( {
				container,
				redirectUrl,
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
			// `payment-confirmed` is treated as success: Stripe has accepted the payment
			// but order finalization can still take a while. Hand off to the framework's
			// pending page rather than keeping the user waiting in the modal.
			if ( orderStatus !== 'success' && orderStatus !== 'payment-confirmed' ) {
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

/**
 * Determines the hosted instructions URL for the UPI iframe.
 *
 * For a regular payment (PaymentIntent), the backend confirms the Stripe intent
 * server-side and returns the hosted_instructions_url directly as redirect_url.
 *
 * For a free trial (SetupIntent), the backend returns a setup_intent_client_secret
 * that must be confirmed client-side via stripe.confirmUpiSetup(), which returns
 * the hosted_instructions_url for the iframe.
 */
async function getRedirectUrl(
	response: WPCOMTransactionEndpointResponse,
	submitData: StripeUpiTransactionRequest,
	options: PaymentProcessorOptions,
	genericErrorMessage: string
): Promise< string > {
	const message = ( response as { message?: unknown } ).message;
	if ( message && typeof message === 'object' && 'setup_intent_client_secret' in message ) {
		return confirmUpiSetupIntent(
			String( ( message as { setup_intent_client_secret: string } ).setup_intent_client_secret ),
			submitData.name,
			options,
			genericErrorMessage
		);
	}

	const redirectUrl = ( response as { redirect_url?: string } ).redirect_url;
	if ( ! redirectUrl ) {
		// eslint-disable-next-line no-console
		console.error( 'Transaction response was missing required redirect url' );
		throw new Error( genericErrorMessage );
	}
	return redirectUrl;
}

async function confirmUpiSetupIntent(
	clientSecret: string,
	name: string,
	options: PaymentProcessorOptions,
	genericErrorMessage: string
): Promise< string > {
	if ( ! options.stripe ) {
		throw new Error( genericErrorMessage );
	}
	const stripe = options.stripe as unknown as StripeWithUpiSetup;
	const { setupIntent, error } = await stripe.confirmUpiSetup( clientSecret, {
		payment_method: {
			upi: {},
			billing_details: { name },
		},
		mandate_data: {
			customer_acceptance: {
				type: 'online',
				online: {
					// infer_from_client tells Stripe to collect the customer's IP and
					// user agent directly from the network request, which is the correct
					// approach for browser-initiated mandate acceptance.
					infer_from_client: true,
				},
			},
		},
	} );
	if ( error || ! setupIntent?.next_action?.upi_qr_code?.hosted_instructions_url ) {
		// eslint-disable-next-line no-console
		console.error( 'Failed to confirm UPI setup intent', error );
		throw new Error( genericErrorMessage );
	}
	return setupIntent.next_action.upi_qr_code.hosted_instructions_url;
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

function createModalContainer(): HTMLElement {
	// Render into a fresh container appended to the body rather than a node
	// owned by the outer checkout React tree.
	const container = document.createElement( 'div' );
	container.className = 'upi-modal-target';
	document.body.appendChild( container );
	return container;
}

function displayModal( {
	container,
	redirectUrl,
	cancel,
	error,
}: {
	container: HTMLElement;
	redirectUrl: string;
	cancel: () => void;
	error: () => void;
} ): Root {
	// Create the root and render into it in the same tick: under React 19 a
	// root created earlier (before the async transaction) never commits its
	// later render. flushSync forces the render to commit synchronously so the
	// dialog element exists in the DOM before we call showModal().
	const root = createRoot( container );
	flushSync( () => {
		root.render( createElement( UpiConfirmation, { redirectUrl, cancel } ) );
	} );

	const dialogElement = container.querySelector( 'dialog.upi-confirmation' );
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

function isValidTransactionData( submitData: unknown ): submitData is StripeUpiTransactionRequest {
	if ( ! submitData || typeof submitData !== 'object' ) {
		return false;
	}
	const data = submitData as StripeUpiTransactionRequest;
	return (
		typeof data.name === 'string' &&
		typeof data.address === 'string' &&
		typeof data.streetNumber === 'string' &&
		typeof data.city === 'string' &&
		typeof data.state === 'string' &&
		typeof data.postalCode === 'string' &&
		typeof data.country === 'string'
	);
}
