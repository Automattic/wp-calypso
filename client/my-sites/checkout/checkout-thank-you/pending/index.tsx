import page from '@automattic/calypso-router';
import { getUrlParts } from '@automattic/calypso-url';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { localizeUrl } from '@automattic/i18n-utils';
import { Step } from '@automattic/onboarding';
import { useShoppingCart } from '@automattic/shopping-cart';
import { AUTO_RENEWAL } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useEffect, useRef } from 'react';
import Loading from 'calypso/components/loading';
import Main from 'calypso/components/main';
import { shouldUseStepContainerV2 } from 'calypso/landing/stepper/declarative-flow/helpers/should-use-step-container-v2';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { getRedirectFromPendingPage } from 'calypso/my-sites/checkout/src/lib/pending-page';
import { sendMessageToOpener } from 'calypso/my-sites/checkout/src/lib/popup';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { getSignupCompleteFlowName } from 'calypso/signup/storageUtils';
import { useSelector, useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { SUCCESS } from 'calypso/state/order-transactions/constants';
import { fetchReceipt } from 'calypso/state/receipts/actions';
import { getReceiptById } from 'calypso/state/receipts/selectors';
import getOrderTransactionError from 'calypso/state/selectors/get-order-transaction-error';
import usePurchaseOrder from '../../src/hooks/use-purchase-order';
import { logStashLoadErrorEvent } from '../../src/lib/analytics';
import type { RedirectInstructions } from 'calypso/my-sites/checkout/src/lib/pending-page';
import type { ReceiptState } from 'calypso/state/receipts/types';
import type {
	OrderTransaction,
	OrderTransactionSuccess,
} from 'calypso/state/selectors/get-order-transaction';
import type { CalypsoDispatch } from 'calypso/state/types';

import './style.scss';

interface CheckoutPendingProps {
	orderId: number | ':orderId';
	receiptId: number | undefined;
	siteSlug?: string;
	redirectTo?: string;
	/**
	 * `fromSiteSlug` is the Jetpack site slug passed from the site via url query arg (into
	 * checkout), for use cases when the site slug cannot be retrieved from state, ie- when there
	 * is not a site in context, such as in siteless checkout. As opposed to `siteSlug` which is
	 * the site slug present when the site is in context (ie- when site is connected and user is
	 * logged in).
	 */
	fromSiteSlug?: string;
}

/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * A page that polls the orders endpoint for a processing transaction and
 * redirects when done.
 *
 * There are two possible URLs that will render this page:
 *
 * - `/checkout/thank-you/:site/pending/:orderId`
 * - `/checkout/thank-you/no-site/pending/:orderId`
 *
 * The `orderId` prop comes from the last part of the URL and the `siteSlug`
 * prop comes from the `:site` part of the URL and will be empty if there is no
 * site. In some cases (eg: free purchases which do not generate an order),
 * this could be the placeholder `:orderId`. If that happens and there is a
 * `receiptId` prop, the success redirect will still occur, but if it happens
 * when there is no `receiptId`, we cannot know what to do and the user will be
 * redirected to a generic thank-you page.
 *
 * The `redirectTo` prop comes from the `redirect_to` query string parameter.
 * It may include a literal `/pending` as part of the URL; if that's the
 * case, that string will be replaced by the receipt ID when the transaction
 * completes.
 *
 * The `receiptId` prop comes from the query string parameter of the same name.
 * It must be numeric. If set, we know that the transaction is complete and
 * will skip polling for the order.
 */
function CheckoutPending( {
	orderId: orderIdOrPlaceholder,
	receiptId,
	siteSlug,
	redirectTo,
	fromSiteSlug,
}: CheckoutPendingProps ) {
	const orderId = isValidOrderId( orderIdOrPlaceholder ) ? orderIdOrPlaceholder : undefined;

	const { headingText } = useRedirectOnTransactionSuccess( {
		orderId,
		receiptId,
		siteSlug,
		redirectTo,
		fromSiteSlug,
	} );

	const content = shouldUseStepContainerV2( getSignupCompleteFlowName() ) ? (
		<Step.Loading title={ headingText } delay={ 2000 } />
	) : (
		<Main className="checkout-thank-you__pending">
			<Loading className="checkout__pending-content" title={ headingText } />
		</Main>
	);

	return (
		<>
			<PageViewTracker
				path={
					siteSlug
						? '/checkout/thank-you/:site/pending/:order_id'
						: '/checkout/thank-you/no-site/pending/:order_id'
				}
				title="Checkout Pending"
				properties={ { order_id: orderId, ...( siteSlug && { site: siteSlug } ) } }
			/>
			{ content }
		</>
	);
}

function isValidOrderId( orderId: number | ':orderId' ): orderId is number {
	return Number.isInteger( orderId );
}

function performRedirect( url: string ): void {
	if ( url.startsWith( '/' ) ) {
		page( url );
		return;
	}
	window.location.href = url;
}

// If the current page is in the pop-up, notify to the opener and delay the redirection.
// Otherwise, do the redirection immediately.
function notifyAndPerformRedirect(
	siteSlug: string | undefined,
	{ isError, isUnknown, url }: RedirectInstructions
): void {
	if (
		siteSlug &&
		sendMessageToOpener( siteSlug, isError || isUnknown ? 'checkoutFailed' : 'checkoutCompleted' )
	) {
		window.setTimeout( () => performRedirect( url ), 3000 );
		return;
	}

	performRedirect( url );
}

function getSaaSProductRedirectUrl( receipt: ReceiptState ) {
	let saasRedirectUrl;

	( receipt?.data?.purchases || [] ).forEach( ( purchase ) => {
		if ( purchase.saasRedirectUrl ) {
			saasRedirectUrl = purchase.saasRedirectUrl;
		}
	} );

	return saasRedirectUrl;
}

function useRedirectOnTransactionSuccess( {
	orderId,
	receiptId,
	siteSlug,
	redirectTo,
	fromSiteSlug,
}: {
	orderId: number | undefined;
	receiptId: number | undefined;
	siteSlug?: string;
	redirectTo?: string;
	/**
	 * `fromSiteSlug` is the Jetpack site slug passed from the site via url query arg (into
	 * checkout), for use cases when the site slug cannot be retrieved from state, ie- when there
	 * is not a site in context, such as in siteless checkout. As opposed to `siteSlug` which is
	 * the site slug present when the site is in context (ie- when site is connected and user is
	 * logged in).
	 */
	fromSiteSlug?: string;
} ): { headingText: React.ReactNode } {
	const translate = useTranslate();

	const { isLoading: isLoadingOrder, order: transaction } = usePurchaseOrder( orderId, 5000 );

	const transactionReceiptId = isTransactionSuccessful( transaction )
		? transaction.receiptId
		: undefined;
	const finalReceiptId = receiptId ?? transactionReceiptId;
	const receipt = useSelector( ( state ) => getReceiptById( state, finalReceiptId ) );
	const isReceiptLoaded = receipt.hasLoadedFromServer;
	const error: Error | null = useSelector( ( state ) =>
		orderId ? getOrderTransactionError( state, orderId ) : null
	);
	const reduxDispatch = useDispatch();
	const cartKey = useCartKey();
	const { reloadFromServer: reloadCart } = useShoppingCart( cartKey );

	const firstPurchase = receipt.data?.purchases[ 0 ];
	const isRenewal = firstPurchase?.isRenewal ?? false;
	const productName = firstPurchase?.productName ?? '';
	const willAutoRenew = firstPurchase?.willAutoRenew ?? false;
	const saasRedirectUrl = getSaaSProductRedirectUrl( receipt );

	const { searchParams } = getUrlParts( redirectTo || '/' );
	const isConnectAfterCheckoutFlow =
		searchParams.size &&
		searchParams.get( 'from' ) === 'connect-after-checkout' &&
		searchParams.get( 'connect_url_redirect' ) === 'true';

	const defaultPendingText = translate( "Almost there – we're currently finalizing your order." );
	const connectingJetpackText = translate(
		"Transaction finalized – we're now connecting Jetpack."
	);

	const [ headingText, setHeadingText ] = useState( defaultPendingText );

	// Fetch receipt data once we have a receipt Id.
	const didFetchReceipt = useRef( false );
	useEffect( () => {
		if ( didFetchReceipt.current ) {
			return;
		}
		if ( ! isReceiptLoaded && finalReceiptId ) {
			didFetchReceipt.current = true;
			reduxDispatch( fetchReceipt( finalReceiptId ) );
		}
	}, [ finalReceiptId, isReceiptLoaded, reduxDispatch ] );

	// Redirect and display notices.
	const didRedirect = useRef( false );
	useEffect( () => {
		if ( didRedirect.current ) {
			return;
		}

		// Make sure the cart is always fresh if anything changes. This way, once
		// the order completes and the server empties the cart, the front-end will
		// get an updated cached cart and future pages will show the cart correctly
		// as empty.
		reloadCart().catch( () => {
			// No need to do anything here. CartMessages will report this error to the user.
		} );

		// Wait for the receipt to load before redirecting so we can display the
		// correct notification and possibly run analytics.
		if ( finalReceiptId && ! isReceiptLoaded ) {
			return;
		}

		const redirectInstructions = getRedirectFromPendingPage( {
			isLoadingOrder,
			error,
			transaction,
			orderId,
			receiptId,
			redirectTo,
			siteSlug,
			saasRedirectUrl,
			fromSiteSlug,
		} );

		if ( ! redirectInstructions ) {
			return;
		}

		didRedirect.current = true;
		if ( isConnectAfterCheckoutFlow ) {
			setHeadingText( connectingJetpackText );
		}
		triggerPostRedirectNotices( {
			redirectInstructions,
			isRenewal,
			productName,
			willAutoRenew,
			translate,
			reduxDispatch,
		} );

		notifyAndPerformRedirect( siteSlug, redirectInstructions );
	}, [
		isLoadingOrder,
		saasRedirectUrl,
		isConnectAfterCheckoutFlow,
		connectingJetpackText,
		error,
		finalReceiptId,
		isReceiptLoaded,
		isRenewal,
		orderId,
		productName,
		receiptId,
		redirectTo,
		reduxDispatch,
		reloadCart,
		siteSlug,
		transaction,
		translate,
		willAutoRenew,
		fromSiteSlug,
	] );

	return { headingText };
}

function isTransactionSuccessful(
	transaction: OrderTransaction | null | undefined
): transaction is OrderTransactionSuccess {
	return transaction?.processingStatus === SUCCESS;
}

function triggerPostRedirectNotices( {
	redirectInstructions,
	isRenewal,
	productName,
	willAutoRenew,
	translate,
	reduxDispatch,
}: {
	redirectInstructions: RedirectInstructions;
	isRenewal: boolean;
	productName: string;
	willAutoRenew: boolean;
	translate: ReturnType< typeof useTranslate >;
	reduxDispatch: CalypsoDispatch;
} ): void {
	if ( redirectInstructions.isError ) {
		const defaultFailErrorNotice = translate(
			"Sorry, we couldn't process your payment. Please try again later."
		);
		reduxDispatch(
			errorNotice( defaultFailErrorNotice, {
				isPersistent: true,
			} )
		);
		return;
	}

	if ( redirectInstructions.isUnknown ) {
		const unknownNotice = translate( 'Oops! Something went wrong. Please try again later.' );
		reduxDispatch(
			errorNotice( unknownNotice, {
				isPersistent: true,
			} )
		);
		return;
	}

	if ( isRenewal ) {
		displayRenewalSuccessNotice( {
			productName,
			willAutoRenew,
			translate,
			reduxDispatch,
		} );
		return;
	}
}

function displayRenewalSuccessNotice( {
	productName,
	willAutoRenew,
	translate,
	reduxDispatch,
}: {
	productName: string;
	willAutoRenew: boolean;
	translate: ReturnType< typeof useTranslate >;
	reduxDispatch: CalypsoDispatch;
} ): void {
	if ( willAutoRenew ) {
		// showing notice for product that will auto-renew
		reduxDispatch(
			successNotice(
				translate( 'Success! You renewed %(productName)s. {{a}}Learn more about renewals{{/a}}', {
					args: {
						productName,
					},
					components: {
						a: <a href={ localizeUrl( AUTO_RENEWAL ) } target="_blank" rel="noopener noreferrer" />,
					},
				} ),
				{ displayOnNextPage: true }
			)
		);
		return;
	}

	// showing notice for product that will not auto-renew
	reduxDispatch(
		successNotice(
			translate( 'Success! You renewed %(productName)s.', {
				args: {
					productName,
				},
			} ),
			{ displayOnNextPage: true }
		)
	);
}

const logCheckoutError = ( error: Error ) => {
	logStashLoadErrorEvent( 'checkout_pending', error );
};

export default function CheckoutPendingWrapper( props: CheckoutPendingProps ) {
	const translate = useTranslate();
	return (
		<CheckoutErrorBoundary
			errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
			onError={ logCheckoutError }
		>
			<CalypsoShoppingCartProvider>
				<CheckoutPending { ...props } />
			</CalypsoShoppingCartProvider>
		</CheckoutErrorBoundary>
	);
}
