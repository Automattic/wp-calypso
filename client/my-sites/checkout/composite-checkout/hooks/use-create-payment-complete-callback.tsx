/**
 * External dependencies
 */
import page from 'page';
import React, { useCallback } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { useShoppingCart } from '@automattic/shopping-cart';
import { defaultRegistry } from '@automattic/composite-checkout';
import debugFactory from 'debug';
import type { PaymentCompleteCallback } from '@automattic/composite-checkout';
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
import { TransactionResponse, Purchase } from '../types/wpcom-store-state';
import { WPCOMCartCouponItem, CheckoutCartItem } from '../types/checkout-cart';
import type { ReactStandardAction } from '../types/analytics';

const debug = debugFactory( 'calypso:composite-checkout:use-on-payment-complete' );

const { select } = defaultRegistry;

export default function useCreatePaymentCompleteCallback( {
	siteId,
	getThankYouUrl,
	recordEvent,
	couponItem,
	total,
	createUserAndSiteBeforeTransaction,
}: {
	siteId: undefined | number;
	getThankYouUrl: () => string;
	recordEvent: ( action: ReactStandardAction ) => void;
	couponItem: WPCOMCartCouponItem | null;
	total: CheckoutCartItem;
	createUserAndSiteBeforeTransaction: boolean;
} ): PaymentCompleteCallback {
	const { responseCart } = useShoppingCart();
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const isDomainOnly =
		useSelector( ( state ) => siteId && isDomainOnlySite( state, siteId ) ) || false;
	const reduxStore = useStore();

	const onPaymentComplete = useCallback(
		( { paymentMethodId } ): void => {
			debug( 'payment completed successfully' );
			const url = getThankYouUrl();
			recordEvent( {
				type: 'PAYMENT_COMPLETE',
				payload: { url, couponItem, paymentMethodId, total, responseCart },
			} );

			const transactionResult: TransactionResponse = select( 'wpcom' ).getTransactionResult();
			const receiptId = transactionResult.receipt_id;
			debug( 'transactionResult was', transactionResult );

			reduxDispatch( clearPurchases() );

			// Removes the destination cookie only if redirecting to the signup destination.
			// (e.g. if the destination is an upsell nudge, it does not remove the cookie).
			const destinationFromCookie = retrieveSignupDestination();
			if ( url.includes( destinationFromCookie ) ) {
				debug( 'clearing redirect url cookie' );
				clearSignupDestinationCookie();
			}

			if ( hasRenewalItem( responseCart ) && transactionResult.purchases ) {
				debug( 'purchase had a renewal' );
				displayRenewalSuccessNotice( responseCart, transactionResult.purchases, translate, moment );
			}

			if ( receiptId && transactionResult.purchases ) {
				debug( 'fetching receipt' );
				reduxDispatch( fetchReceiptCompleted( receiptId, transactionResult ) );
			}

			if ( siteId ) {
				reduxDispatch( requestSite( siteId ) );
			}

			if (
				( responseCart.create_new_blog &&
					Object.keys( transactionResult.purchases ?? {} ).length > 0 &&
					Object.keys( transactionResult.failed_purchases ?? {} ).length === 0 ) ||
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
			reduxStore,
			isDomainOnly,
			moment,
			reduxDispatch,
			siteId,
			recordEvent,
			translate,
			getThankYouUrl,
			total,
			couponItem,
			responseCart,
			createUserAndSiteBeforeTransaction,
		]
	);
	return onPaymentComplete;
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
