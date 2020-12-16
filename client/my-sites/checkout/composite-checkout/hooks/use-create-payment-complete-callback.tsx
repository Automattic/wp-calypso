/**
 * External dependencies
 */
import page from 'page';
import React, { useCallback } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { useShoppingCart } from '@automattic/shopping-cart';
import debugFactory from 'debug';
import type {
	PaymentCompleteCallback,
	PaymentCompleteCallbackArguments,
} from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import notices from 'calypso/notices';
import { hasRenewalItem, getRenewalItems, hasPlan } from 'calypso/lib/cart-values/cart-items';
import { clearPurchases } from 'calypso/state/purchases/actions';
import { fetchReceiptCompleted } from 'calypso/state/receipts/actions';
import { requestSite } from 'calypso/state/sites/actions';
import { fetchSitesAndUser } from 'calypso/lib/signup/step-actions/fetch-sites-and-user';
import { getDomainNameFromReceiptOrCart } from 'calypso/lib/domains/cart-utils';
import { AUTO_RENEWAL } from 'calypso/lib/url/support';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import {
	retrieveSignupDestination,
	clearSignupDestinationCookie,
} from 'calypso/signup/storageUtils';
import type { TransactionResponse, Purchase } from '../types/wpcom-store-state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { recordPurchase } from 'calypso/lib/analytics/record-purchase';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from '../lib/translate-payment-method-names';
import type { CheckoutPaymentMethodSlug } from '../types/checkout-payment-method-slug';
import normalizeTransactionResponse from '../lib/normalize-transaction-response';
import getThankYouPageUrl from './use-get-thank-you-url/get-thank-you-page-url';
import {
	getSelectedSite,
	getSelectedSiteSlug,
	getSelectedSiteId,
} from 'calypso/state/ui/selectors';
import isEligibleForSignupDestination from 'calypso/state/selectors/is-eligible-for-signup-destination';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { logStashLoadErrorEventAction } from '../lib/analytics';
import { isTreatmentOneClickTest } from 'calypso/state/marketing/selectors';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';

const debug = debugFactory( 'calypso:composite-checkout:use-on-payment-complete' );

export default function useCreatePaymentCompleteCallback( {
	createUserAndSiteBeforeTransaction,
	productAliasFromUrl,
	redirectTo,
	purchaseId,
	feature,
	isInEditor,
	isComingFromUpsell,
}: {
	createUserAndSiteBeforeTransaction?: boolean;
	productAliasFromUrl?: string | undefined;
	redirectTo?: string | undefined;
	purchaseId?: number | undefined;
	feature?: string | undefined;
	isInEditor?: boolean;
	isComingFromUpsell?: boolean;
} ): PaymentCompleteCallback {
	const { responseCart } = useShoppingCart();
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
	const shouldShowOneClickTreatment = useSelector( ( state ) => isTreatmentOneClickTest( state ) );
	const previousRoute = useSelector( ( state ) => getPreviousRoute( state ) );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isJetpackNotAtomic =
		useSelector(
			( state ) => siteId && isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
		) || false;

	return useCallback(
		( { paymentMethodId, transactionLastResponse }: PaymentCompleteCallbackArguments ): void => {
			debug( 'payment completed successfully' );
			const transactionResult = normalizeTransactionResponse( transactionLastResponse );
			const hideNudge = shouldHideUpsellNudges( { isComingFromUpsell, transactionLastResponse } );
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
				shouldShowOneClickTreatment,
				hideNudge: !! isComingFromUpsell,
				hideNudge,
				isInEditor,
				previousRoute,
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
					reduxDispatch,
				} );
			} catch ( err ) {
				// This is a fallback to catch any errors caused by the analytics code
				// Anything in this block should remain very simple and extremely
				// tolerant of any kind of data. It should make no assumptions about
				// the data it uses.  There's no fallback for the fallback!
				debug( 'checkout event error', err.message );
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_error', {
						error_message: err.message,
						action_type: 'useCreatePaymentCompleteCallback',
						action_payload: '',
					} )
				);
				reduxDispatch(
					logStashLoadErrorEventAction( 'calypso_checkout_composite_error', err.message, {
						action_type: 'useCreatePaymentCompleteCallback',
						action_payload: '',
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
				displayRenewalSuccessNotice( responseCart, transactionResult.purchases, translate, moment );
			}

			if ( receiptId && transactionResult?.purchases ) {
				debug( 'fetching receipt' );
				reduxDispatch( fetchReceiptCompleted( receiptId, transactionResult ) );
			}

			if ( siteId ) {
				reduxDispatch( requestSite( siteId ) );
			}

			if (
				( responseCart.create_new_blog &&
					Object.keys( transactionResult?.purchases ?? {} ).length > 0 &&
					Object.keys( transactionResult?.failed_purchases ?? {} ).length === 0 ) ||
				( isDomainOnly && hasPlan( responseCart ) && ! siteId )
			) {
				notices.info( translate( 'Almost done…' ) );

				const domainName = getDomainNameFromReceiptOrCart( transactionResult, responseCart );

				if ( domainName ) {
					debug( 'purchase needs to fetch before redirect', domainName );
					fetchSitesAndUser(
						domainName,
						() => {
							page.redirect( url );
						},
						reduxStore
					);

					return;
				}
			}

			debug( 'just redirecting to', url );

			if ( createUserAndSiteBeforeTransaction ) {
				try {
					window.localStorage.removeItem( 'shoppingCart' );
					window.localStorage.removeItem( 'siteParams' );
				} catch ( err ) {}

				// We use window.location instead of page.redirect() so that the cookies are detected on fresh page load.
				// Using page.redirect() will take to the log in page which we don't want.
				window.location.href = url;
				return;
			}

			page.redirect( url );
		},
		[
			siteSlug,
			adminUrl,
			redirectTo,
			purchaseId,
			feature,
			isJetpackNotAtomic,
			productAliasFromUrl,
			isEligibleForSignupDestinationResult,
			isComingFromUpsell,
			isInEditor,
			reduxStore,
			isDomainOnly,
			moment,
			reduxDispatch,
			siteId,
			translate,
			responseCart,
			createUserAndSiteBeforeTransaction,
		]
	);
}

export function withPaymentCompleteCallback< P >( Component: React.ComponentType< P > ) {
	return function PaymentCompleteWrapper( props: P ): JSX.Element {
		const paymentCompleteCallback = useCreatePaymentCompleteCallback( {} );
		return <Component { ...props } paymentCompleteCallback={ paymentCompleteCallback } />;
	};
}

function displayRenewalSuccessNotice(
	responseCart: ResponseCart,
	purchases: Record< number, Purchase >,
	translate: ReturnType< typeof useTranslate >,
	moment: ReturnType< typeof useLocalizedMoment >
): void {
	const renewalItem = getRenewalItems( responseCart )[ 0 ];
	// group all purchases into an array
	const purchasedProducts = Object.values( purchases ?? {} ).reduce(
		( result: Purchase[], value: Purchase ) => [ ...result, value ],
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
		notices.success(
			translate(
				'%(productName)s has been renewed and will now auto renew in the future. ' +
					'{{a}}Learn more{{/a}}',
				{
					args: {
						productName: renewalItem.product_name,
					},
					components: {
						a: <a href={ AUTO_RENEWAL } target="_blank" rel="noopener noreferrer" />,
					},
				}
			),
			{ persistent: true }
		);
		return;
	}

	debug( 'showing notice for product that will not auto-renew' );
	notices.success(
		translate(
			'Success! You renewed %(productName)s for %(duration)s, until %(date)s. ' +
				'We sent your receipt to %(email)s.',
			{
				args: {
					productName: renewalItem.product_name,
					duration: moment.duration( { days: renewalItem.bill_period } ).humanize(),
					date: moment( product.expiry ).format( 'LL' ),
					email: product.user_email,
				},
			}
		),
		{ persistent: true }
	);
}

function recordPaymentCompleteAnalytics( {
	paymentMethodId,
	transactionResult,
	redirectUrl,
	responseCart,
	reduxDispatch,
}: {
	paymentMethodId: string | null;
	transactionResult: TransactionResponse | undefined;
	redirectUrl: string;
	responseCart: ResponseCart;
	reduxDispatch: ReturnType< typeof useDispatch >;
} ) {
	reduxDispatch(
		recordTracksEvent( 'calypso_checkout_payment_success', {
			coupon_code: responseCart.coupon,
			currency: responseCart.currency,
			payment_method:
				translateCheckoutPaymentMethodToWpcomPaymentMethod(
					paymentMethodId as CheckoutPaymentMethodSlug
				) || '',
			total_cost: responseCart.total_cost,
		} )
	);
	recordPurchase( {
		cart: {
			total_cost: responseCart.total_cost,
			currency: responseCart.currency,
			is_signup: responseCart.is_signup,
			products: responseCart.products,
			coupon_code: responseCart.coupon,
			total_tax: responseCart.total_tax,
		},
		orderId: transactionResult?.receipt_id,
	} );
	return reduxDispatch(
		recordTracksEvent( 'calypso_checkout_composite_payment_complete', {
			redirect_url: redirectUrl,
			coupon_code: responseCart.coupon,
			total: responseCart.total_cost_integer,
			currency: responseCart.currency,
			payment_method:
				translateCheckoutPaymentMethodToWpcomPaymentMethod(
					paymentMethodId as CheckoutPaymentMethodSlug
				) || '',
		} )
	);
}

function shouldHideUpsellNudges( {
	isComingFromUpsell,
	transactionLastResponse,
}: {
	isComingFromUpsell?: boolean;
	transactionLastResponse: unknown;
} ): boolean {
	if ( isComingFromUpsell ) {
		return true;
	}
	if (
		transactionLastResponse &&
		( transactionLastResponse as { isComingFromUpsell: boolean } ).isComingFromUpsell
	) {
		return true;
	}
	return false;
}
