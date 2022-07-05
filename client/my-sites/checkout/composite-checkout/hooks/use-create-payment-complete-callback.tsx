import { localizeUrl } from '@automattic/i18n-utils';
import { useShoppingCart } from '@automattic/shopping-cart';
import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { recordPurchase } from 'calypso/lib/analytics/record-purchase';
import {
	hasRenewalItem,
	getRenewalItems,
	hasPlan,
	hasEcommercePlan,
} from 'calypso/lib/cart-values/cart-items';
import { getDomainNameFromReceiptOrCart } from 'calypso/lib/domains/cart-utils';
import { fetchSitesAndUser } from 'calypso/lib/signup/step-actions/fetch-sites-and-user';
import { AUTO_RENEWAL } from 'calypso/lib/url/support';
import useSiteDomains from 'calypso/my-sites/checkout/composite-checkout/hooks/use-site-domains';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import {
	retrieveSignupDestination,
	clearSignupDestinationCookie,
} from 'calypso/signup/storageUtils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { infoNotice, successNotice } from 'calypso/state/notices/actions';
import { clearPurchases } from 'calypso/state/purchases/actions';
import { fetchReceiptCompleted } from 'calypso/state/receipts/actions';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isEligibleForSignupDestination from 'calypso/state/selectors/is-eligible-for-signup-destination';
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
import { recordCompositeCheckoutErrorDuringAnalytics } from '../lib/analytics';
import normalizeTransactionResponse from '../lib/normalize-transaction-response';
import { absoluteRedirectThroughPending, redirectThroughPending } from '../lib/pending-page';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from '../lib/translate-payment-method-names';
import getThankYouPageUrl from './use-get-thank-you-url/get-thank-you-page-url';
import type {
	PaymentEventCallback,
	PaymentEventCallbackArguments,
} from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { WPCOMTransactionEndpointResponse, Purchase } from '@automattic/wpcom-checkout';
import type { CalypsoDispatch } from 'calypso/state/types';

const debug = debugFactory( 'calypso:composite-checkout:use-on-payment-complete' );

/**
 * Generates a callback to be called after checkout is successfully complete.
 *
 * IMPORTANT NOTE: This will not be called for redirect payment methods like
 * PayPal. They will redirect directly to the post-checkout page decided by
 * `getThankYouUrl`.
 */
export default function useCreatePaymentCompleteCallback( {
	createUserAndSiteBeforeTransaction,
	productAliasFromUrl,
	redirectTo,
	purchaseId,
	feature,
	isInModal,
	isComingFromUpsell,
	disabledThankYouPage,
	siteSlug,
	isJetpackCheckout = false,
	checkoutFlow,
}: {
	createUserAndSiteBeforeTransaction?: boolean;
	productAliasFromUrl?: string | undefined;
	redirectTo?: string | undefined;
	purchaseId?: number | undefined;
	feature?: string | undefined;
	isInModal?: boolean;
	isComingFromUpsell?: boolean;
	disabledThankYouPage?: boolean;
	siteSlug: string | undefined;
	isJetpackCheckout?: boolean;
	checkoutFlow?: string;
} ): PaymentEventCallback {
	const cartKey = useCartKey();
	const { responseCart, reloadFromServer: reloadCart } = useShoppingCart( cartKey );
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const siteId = useSelector( getSelectedSiteId );
	const isDomainOnly =
		useSelector( ( state ) => siteId && isDomainOnlySite( state, siteId ) ) || false;
	const reduxStore = useStore();
	const selectedSiteData = useSelector( getSelectedSite );
	const adminUrl = selectedSiteData?.options?.admin_url;
	const isEligibleForSignupDestinationResult = isEligibleForSignupDestination( responseCart );
	const isJetpackNotAtomic =
		useSelector(
			( state ) =>
				siteId &&
				( isJetpackSite( state, siteId ) ||
					isBackupPluginActive( state, siteId ) ||
					isSearchPluginActive( state, siteId ) ) &&
				! isAtomicSite( state, siteId )
		) || false;
	const adminPageRedirect = useSelector( ( state ) =>
		getJetpackCheckoutRedirectUrl( state, siteId )
	);

	const domains = useSiteDomains( siteId ?? undefined );

	return useCallback(
		( { paymentMethodId, transactionLastResponse }: PaymentEventCallbackArguments ): void => {
			debug( 'payment completed successfully' );
			const transactionResult = normalizeTransactionResponse( transactionLastResponse );

			// In the case of a Jetpack product site-less purchase, we need to include the blog ID of the
			// created site in the Thank You page URL.
			let jetpackTemporarySiteId;
			if ( isJetpackCheckout && ! siteSlug && responseCart.create_new_blog ) {
				jetpackTemporarySiteId =
					transactionResult.purchases && Object.keys( transactionResult.purchases ).pop();
			}

			const getThankYouPageUrlArguments = {
				siteSlug: siteSlug || undefined,
				adminUrl,
				receiptId: transactionResult.receipt_id,
				orderId: transactionResult.order_id,
				redirectTo,
				purchaseId,
				feature,
				cart: responseCart,
				isJetpackNotAtomic,
				productAliasFromUrl,
				isEligibleForSignupDestinationResult,
				hideNudge: isComingFromUpsell,
				isInModal,
				isJetpackCheckout,
				jetpackTemporarySiteId,
				adminPageRedirect,
				domains,
			};

			debug( 'getThankYouUrl called with', getThankYouPageUrlArguments );
			const url = getThankYouPageUrl( getThankYouPageUrlArguments );
			debug( 'getThankYouUrl returned', url );

			try {
				recordPaymentCompleteAnalytics( {
					paymentMethodId,
					transactionResult,
					redirectUrl: url,
					responseCart,
					checkoutFlow,
					reduxDispatch,
				} );
			} catch ( err ) {
				// eslint-disable-next-line no-console
				console.error( err );
				reduxDispatch(
					recordCompositeCheckoutErrorDuringAnalytics( {
						errorObject: err as Error,
						failureDescription: 'useCreatePaymentCompleteCallback',
					} )
				);
			}

			const receiptId = transactionResult?.receipt_id;
			debug( 'transactionResult was', transactionResult );

			reduxDispatch( clearPurchases() );

			// Removes the destination cookie only if redirecting to the signup destination.
			// (e.g. if the destination is an upsell nudge, it does not remove the cookie).
			const destinationFromCookie = retrieveSignupDestination();
			if ( url.includes( destinationFromCookie ) ) {
				debug( 'clearing redirect url cookie' );
				clearSignupDestinationCookie();
			}

			if ( hasRenewalItem( responseCart ) && transactionResult?.purchases ) {
				debug( 'purchase had a renewal' );
				displayRenewalSuccessNotice(
					responseCart,
					transactionResult.purchases,
					translate,
					moment,
					reduxDispatch
				);
			}

			if ( receiptId && transactionResult?.purchases ) {
				debug( 'fetching receipt' );
				reduxDispatch( fetchReceiptCompleted( receiptId, transactionResult ) );
			}

			if ( siteId ) {
				reduxDispatch( requestSite( siteId ) );
				reduxDispatch( fetchSiteFeatures( siteId ) );
			}

			if (
				( responseCart.create_new_blog &&
					Object.keys( transactionResult?.purchases ?? {} ).length > 0 &&
					Object.keys( transactionResult?.failed_purchases ?? {} ).length === 0 ) ||
				( isDomainOnly && hasPlan( responseCart ) && ! siteId )
			) {
				reduxDispatch( infoNotice( translate( 'Almost done…' ) ) );

				const domainName = getDomainNameFromReceiptOrCart( transactionResult, responseCart );

				if ( domainName ) {
					debug( 'purchase needs to fetch before redirect', domainName );
					fetchSitesAndUser(
						domainName,
						() => {
							reloadCart();
							redirectThroughPending( url, {
								siteSlug,
								orderId: transactionResult.order_id,
								receiptId: transactionResult.receipt_id,
							} );
						},
						reduxStore
					);

					return;
				}
			}

			// Checkout in the modal might not need thank you page.
			// For example, Focused Launch is showing a success dialog directly in editor instead of a thank you page.
			// See https://github.com/Automattic/wp-calypso/pull/47808#issuecomment-755196691
			if ( isInModal && disabledThankYouPage && ! hasEcommercePlan( responseCart ) ) {
				return;
			}

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
					orderId: transactionResult.order_id,
					receiptId: transactionResult.receipt_id,
				} );
				return;
			}

			reloadCart();
			redirectThroughPending( url, {
				siteSlug,
				orderId: transactionResult.order_id,
				receiptId: transactionResult.receipt_id,
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
			productAliasFromUrl,
			isEligibleForSignupDestinationResult,
			isComingFromUpsell,
			isInModal,
			reduxStore,
			isDomainOnly,
			moment,
			reduxDispatch,
			siteId,
			translate,
			responseCart,
			createUserAndSiteBeforeTransaction,
			disabledThankYouPage,
			isJetpackCheckout,
			checkoutFlow,
			adminPageRedirect,
			domains,
		]
	);
}

function displayRenewalSuccessNotice(
	responseCart: ResponseCart,
	purchases: Record< number, Purchase[] >,
	translate: ReturnType< typeof useTranslate >,
	moment: ReturnType< typeof useLocalizedMoment >,
	reduxDispatch: CalypsoDispatch
): void {
	const renewalItem = getRenewalItems( responseCart )[ 0 ];
	// group all purchases into an array
	const purchasedProducts = Object.values( purchases ?? {} ).reduce(
		( result: Purchase[], value: Purchase[] ) => [ ...result, ...value ],
		[]
	);
	// and take the first product which matches the product id of the renewalItem
	const product = purchasedProducts.find( ( item ) => {
		return String( item.product_id ) === String( renewalItem.product_id );
	} );

	if ( ! product ) {
		debug( 'no product found for renewal notice matching', renewalItem, 'in', purchasedProducts );
		return;
	}

	if ( product.will_auto_renew ) {
		debug( 'showing notice for product that will auto-renew' );
		reduxDispatch(
			successNotice(
				translate(
					'Success! You renewed %(productName)s for %(duration)s, and we sent your receipt to %(email)s. {{a}}Learn more about renewals{{/a}}',
					{
						args: {
							productName: renewalItem.product_name,
							duration: moment
								.duration( { days: parseInt( renewalItem.bill_period, 10 ) } )
								.humanize(),
							email: product.user_email,
						},
						components: {
							a: (
								<a href={ localizeUrl( AUTO_RENEWAL ) } target="_blank" rel="noopener noreferrer" />
							),
						},
					}
				),
				{ displayOnNextPage: true }
			)
		);
		return;
	}

	debug( 'showing notice for product that will not auto-renew' );
	reduxDispatch(
		successNotice(
			translate(
				'Success! You renewed %(productName)s for %(duration)s, until %(date)s. We sent your receipt to %(email)s.',
				{
					args: {
						productName: renewalItem.product_name,
						duration: moment
							.duration( { days: parseInt( renewalItem.bill_period, 10 ) } )
							.humanize(),
						date: moment( product.expiry ).format( 'LL' ),
						email: product.user_email,
					},
				}
			),
			{ displayOnNextPage: true }
		)
	);
}

function recordPaymentCompleteAnalytics( {
	paymentMethodId,
	transactionResult,
	redirectUrl,
	responseCart,
	checkoutFlow,
	reduxDispatch,
}: {
	paymentMethodId: string | null;
	transactionResult: WPCOMTransactionEndpointResponse | undefined;
	redirectUrl: string;
	responseCart: ResponseCart;
	checkoutFlow?: string;
	reduxDispatch: CalypsoDispatch;
} ) {
	const wpcomPaymentMethod = paymentMethodId
		? translateCheckoutPaymentMethodToWpcomPaymentMethod( paymentMethodId )
		: null;

	const device = resolveDeviceTypeByViewPort();
	reduxDispatch(
		recordTracksEvent( 'calypso_checkout_payment_success', {
			coupon_code: responseCart.coupon,
			currency: responseCart.currency,
			payment_method: wpcomPaymentMethod || '',
			total_cost: responseCart.total_cost,
			device,
		} )
	);
	recordPurchase( {
		cart: responseCart,
		orderId: transactionResult?.receipt_id,
	} );

	return reduxDispatch(
		recordTracksEvent( 'calypso_checkout_composite_payment_complete', {
			redirect_url: redirectUrl,
			coupon_code: responseCart.coupon,
			total: responseCart.total_cost_integer,
			currency: responseCart.currency,
			payment_method: wpcomPaymentMethod || '',
			device,
			checkout_flow: checkoutFlow,
		} )
	);
}
