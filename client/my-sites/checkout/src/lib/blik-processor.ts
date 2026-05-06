import { makeErrorResponse, makeSuccessResponse } from '@automattic/composite-checkout';
import { formatCurrency } from '@automattic/number-formatters';
import { createElement } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { PurchaseOrderStatus, fetchPurchaseOrder } from '../hooks/use-purchase-order';
import { recordTransactionBeginAnalytics } from '../lib/analytics';
import getDomainDetails from '../lib/get-domain-details';
import getPostalCode from '../lib/get-postal-code';
import prepareRedirectTransaction from '../lib/prepare-redirect-transaction';
import { BlikConfirmation } from './blik-confirmation';
import { addUrlToPendingPageRedirect } from './pending-page';
import submitWpcomTransaction from './submit-wpcom-transaction';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type {
	WPCOMTransactionEndpointResponse,
	WPCOMTransactionEndpointResponseSuccess,
} from '@automattic/wpcom-checkout';
import type { LocalizeProps } from 'i18n-calypso';

type StripeBlikTransactionRequest = {
	code: string;
};

export default async function blikProcessor(
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
		fromSiteSlug,
	} = options;
	const paymentMethodId = 'stripe-blik';

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
		urlType: 'absolute',
	} );
	const cancelUrl = `${ origin }${ pathname }${ search }`;

	const formattedTransactionData = prepareRedirectTransaction(
		paymentMethodId,
		{
			...submitData,
			// BLIK form has no name field; TransactionRequest.name is required.
			name: '',
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

	const formattedTotal = formatCurrency( responseCart.total_cost_integer, responseCart.currency, {
		isSmallestUnit: true,
	} );

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
			if ( ! response?.order_id ) {
				// eslint-disable-next-line no-console
				console.error( 'Transaction response was missing required order ID' );
				throw new Error( genericErrorMessage );
			}

			let isModalActive = true;
			let explicitClosureMessage: string | undefined;
			displayModal( {
				root,
				formattedTotal,
				cancel: ( wasExpired ) => {
					safeDismissModal();
					isModalActive = false;
					explicitClosureMessage = wasExpired
						? translate( 'BLIK code expired. Please try again.' )
						: translate(
								'Payment cancelled. If you have already approved the payment in your banking app, the payment may still go through. Please check your account before trying again.'
						  );
				},
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

function getRenderRoot( genericErrorMessage: string ) {
	const dialogTarget = document.querySelector( '.blik-modal-target' );
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
	formattedTotal,
	cancel,
}: {
	root: Root;
	formattedTotal: string;
	cancel: ( wasExpired: boolean ) => void;
} ) {
	root.render(
		createElement( BlikConfirmation, {
			formattedTotal,
			cancel,
		} )
	);
}

function isValidTransactionData( submitData: unknown ): submitData is StripeBlikTransactionRequest {
	if ( ! submitData || typeof submitData !== 'object' ) {
		return false;
	}
	const data = submitData as StripeBlikTransactionRequest;
	return typeof data.code === 'string';
}
