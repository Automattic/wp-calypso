import { receiptQuery } from '@automattic/api-queries';
import { SUPPORT_STATUS_QUERY_KEY } from '@automattic/help-center/src/data/use-support-status';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useQueryClient } from '@tanstack/react-query';
import { isURL } from '@wordpress/url';
import debugFactory from 'debug';
import { useCallback } from 'react';
import { hasEcommercePlan } from 'calypso/lib/cart-values/cart-items';
import getThankYouPageUrl from 'calypso/my-sites/checkout/get-thank-you-page-url';
import useSiteDomains from 'calypso/my-sites/checkout/src/hooks/use-site-domains';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import {
	retrieveSignupDestination,
	clearSignupDestinationCookie,
} from 'calypso/signup/storageUtils';
import { useSelector, useDispatch } from 'calypso/state';
import { clearPurchases } from 'calypso/state/purchases/actions';
import { fetchReceiptCompleted } from 'calypso/state/receipts/actions';
import hasGravatarDomainQueryParam from 'calypso/state/selectors/has-gravatar-domain-query-param';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { requestSite } from 'calypso/state/sites/actions';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import {
	isJetpackSite,
	getJetpackCheckoutRedirectUrl,
	isBackupPluginActive,
	isSearchPluginActive,
} from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import normalizeTransactionResponse from '../lib/normalize-transaction-response';
import { absoluteRedirectThroughPending, redirectThroughPending } from '../lib/pending-page';
import { recordCompletedPurchaseAnalytics } from '../lib/record-completed-purchase-analytics';
import type {
	PaymentEventCallback,
	PaymentEventCallbackArguments,
} from '@automattic/composite-checkout';
import type { SitelessCheckoutType } from '@automattic/wpcom-checkout';
import type { PostCheckoutUrlArguments } from 'calypso/my-sites/checkout/get-thank-you-page-url';

const debug = debugFactory( 'calypso:composite-checkout:use-on-payment-complete' );

/**
 * Generates a callback to be called after checkout is successfully complete.
 *
 * IMPORTANT NOTE: This will not be called for redirect payment methods like
 * PayPal. They will redirect directly to the post-checkout page decided by
 * `getThankYouUrl`.
 */
export default function useCreatePaymentSubmittedAndProcessingCallback( {
	createUserAndSiteBeforeTransaction,
	productAliasFromUrl,
	redirectTo,
	purchaseId,
	feature,
	isInModal,
	isComingFromUpsell,
	disabledThankYouPage,
	siteSlug,
	sitelessCheckoutType,
	connectAfterCheckout,
	adminUrl: wpAdminUrl,
	fromSiteSlug,
}: {
	createUserAndSiteBeforeTransaction?: boolean;
	productAliasFromUrl?: string | undefined;
	redirectTo?: string | undefined;
	purchaseId?: number | string | undefined;
	feature?: string | undefined;
	isInModal?: boolean;
	isComingFromUpsell?: boolean;
	disabledThankYouPage?: boolean;
	siteSlug: string | undefined;
	sitelessCheckoutType?: SitelessCheckoutType;
	connectAfterCheckout?: boolean;
	adminUrl?: string;
	/**
	 * `fromSiteSlug` is the Jetpack site slug passed from the site via url query arg (into
	 * checkout), for use cases when the site slug cannot be retrieved from state, ie- when there
	 * is not a site in context, such as in siteless checkout. As opposed to `siteSlug` which is
	 * the site slug present when the site is in context (ie- when site is connected and user is
	 * logged in).
	 */
	fromSiteSlug?: string;
} ): PaymentEventCallback {
	const cartKey = useCartKey();
	const { responseCart, reloadFromServer: reloadCart } = useShoppingCart( cartKey );
	const reduxDispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const selectedSiteData = useSelector( getSelectedSite );
	const adminUrl = selectedSiteData?.options?.admin_url || wpAdminUrl;
	const isJetpackNotAtomic =
		useSelector(
			( state ) =>
				siteId &&
				( isJetpackSite( state, siteId ) ||
					isBackupPluginActive( state, siteId ) ||
					isSearchPluginActive( state, siteId ) ) &&
				! isAtomicSite( state, siteId )
		) || false;
	const isGravatarDomain = useSelector( hasGravatarDomainQueryParam );
	const adminPageRedirect = useSelector( ( state ) =>
		getJetpackCheckoutRedirectUrl( state, siteId )
	);

	const domains = useSiteDomains( siteId ?? undefined );
	const queryClient = useQueryClient();

	return useCallback(
		async ( { transactionLastResponse }: PaymentEventCallbackArguments ) => {
			debug( 'payment completed successfully' );
			const transactionResult = normalizeTransactionResponse( transactionLastResponse );

			// In the case of a Jetpack product site-less purchase, we need to include the blog ID of the
			// created site in the Thank You page URL.
			// TODO: It does not seem like this would be needed for Akismet, but marking to follow up
			let jetpackTemporarySiteId: string | undefined;
			if (
				sitelessCheckoutType === 'jetpack' &&
				! siteSlug &&
				[ 'no-user', 'no-site' ].includes( String( responseCart.cart_key ) ) &&
				'purchases' in transactionResult &&
				transactionResult.purchases
			) {
				jetpackTemporarySiteId = Object.keys( transactionResult.purchases ).pop();
			}

			const getThankYouPageUrlArguments: PostCheckoutUrlArguments = {
				siteSlug: siteSlug || undefined,
				siteId: siteId || undefined,
				adminUrl,
				receiptId: 'receipt_id' in transactionResult ? transactionResult.receipt_id : undefined,
				redirectTo,
				purchaseId,
				feature,
				cart: responseCart,
				sitelessCheckoutType,
				isJetpackNotAtomic,
				isGravatarDomain,
				productAliasFromUrl,
				hideNudge: isComingFromUpsell,
				isInModal,
				jetpackTemporarySiteId,
				adminPageRedirect,
				domains,
				connectAfterCheckout,
				fromSiteSlug,
			};

			debug( 'getThankYouUrl called with', getThankYouPageUrlArguments );
			const url = getThankYouPageUrl( getThankYouPageUrlArguments );
			debug( 'getThankYouUrl returned', url );

			const receiptId =
				transactionResult && 'receipt_id' in transactionResult
					? transactionResult.receipt_id
					: undefined;
			debug( 'transactionResult was', transactionResult );

			reduxDispatch( clearPurchases() );
			queryClient.invalidateQueries( { queryKey: SUPPORT_STATUS_QUERY_KEY } );

			// Removes the destination cookie only if redirecting to the signup destination.
			// (e.g. if the destination is an upsell nudge, it does not remove the cookie).
			const destinationFromCookie = retrieveSignupDestination();
			if ( url.includes( destinationFromCookie ) ) {
				debug( 'clearing redirect url cookie' );
				clearSignupDestinationCookie();
			}

			if (
				receiptId &&
				transactionResult &&
				'purchases' in transactionResult &&
				transactionResult.purchases &&
				transactionResult.success
			) {
				debug( 'fetching receipt' );
				reduxDispatch( fetchReceiptCompleted( receiptId, transactionResult ) );
			}

			if ( siteId ) {
				reduxDispatch( requestSite( siteId ) );
				reduxDispatch( fetchSiteFeatures( siteId ) );
			}

			// Checkout in the modal might not need thank you page.
			// For example, Focused Launch is showing a success dialog directly in editor instead of a thank you page.
			// See https://github.com/Automattic/wp-calypso/pull/47808#issuecomment-755196691
			if ( isInModal && disabledThankYouPage && ! hasEcommercePlan( responseCart ) ) {
				// Purchases in the modal only use saved cards, which complete
				// immediately, and this path skips the pending page that would
				// otherwise record the purchase.
				if ( receiptId ) {
					queryClient
						.fetchQuery( receiptQuery( receiptId, { includeFailedPurchases: true } ) )
						.then( ( receipt ) => recordCompletedPurchaseAnalytics( receipt, reduxDispatch ) )
						.catch( ( error ) => debug( 'could not fetch receipt for analytics', error ) );
				}
				return;
			}

			/**
			 * IMPORTANT
			 *
			 * This function is only called for purchases which use specific
			 * payment methods. Redirect payment methods like PayPal or
			 * Bancontact or some 3DS credit cards will not trigger this
			 * function. Functions triggered on the "pending" page will be more
			 * accurate and will capture most flows, but not purchases made
			 * through the one-click checkout modal, which only use saved
			 * credit cards.
			 */

			debug( 'just redirecting to', url );

			if ( createUserAndSiteBeforeTransaction ) {
				try {
					window.localStorage.removeItem( 'shoppingCart' );
					window.localStorage.removeItem( 'siteParams' );
				} catch ( err ) {
					debug( 'error while clearing localStorage cart' );
				}

				// We use window.location instead of page() so that the cookies are
				// detected on fresh page load. Using page(url) will take us to the
				// log-in page which we don't want.
				absoluteRedirectThroughPending( url, {
					siteSlug,
					orderId: 'order_id' in transactionResult ? transactionResult.order_id : undefined,
					receiptId: 'receipt_id' in transactionResult ? transactionResult.receipt_id : undefined,
					fromExternalCheckout: sitelessCheckoutType === 'a4a',
				} );
				return;
			}

			// We need to do a hard redirect if we're redirecting to the stepper.
			// Since stepper is self-contained, it doesn't load properly if we do a normal history state change
			// The same is true if we are redirecting to the signup flow, we are restricting it to only 1 specific flow here.
			if (
				isURL( url ) ||
				url.includes( '/setup/' ) ||
				url.includes( '/start/site-content-collection' )
			) {
				absoluteRedirectThroughPending( url, {
					siteSlug,
					orderId: 'order_id' in transactionResult ? transactionResult.order_id : undefined,
					receiptId: 'receipt_id' in transactionResult ? transactionResult.receipt_id : undefined,
					fromSiteSlug,
					fromExternalCheckout: sitelessCheckoutType === 'a4a',
				} );
				return;
			}

			reloadCart().catch( () => {
				// No need to do anything here. CartMessages will report this error to the user.
			} );
			redirectThroughPending( url, {
				siteSlug,
				orderId: 'order_id' in transactionResult ? transactionResult.order_id : undefined,
				receiptId: 'receipt_id' in transactionResult ? transactionResult.receipt_id : undefined,
				fromExternalCheckout: sitelessCheckoutType === 'a4a',
				isGravatarDomain,
			} );
		},
		[
			reloadCart,
			siteSlug,
			adminUrl,
			redirectTo,
			purchaseId,
			feature,
			isJetpackNotAtomic,
			isGravatarDomain,
			productAliasFromUrl,
			isComingFromUpsell,
			isInModal,
			reduxDispatch,
			queryClient,
			siteId,
			responseCart,
			createUserAndSiteBeforeTransaction,
			disabledThankYouPage,
			sitelessCheckoutType,
			adminPageRedirect,
			domains,
			connectAfterCheckout,
			fromSiteSlug,
		]
	);
}
