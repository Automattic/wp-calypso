/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	purchases,
	redirectToPurchases,
	purchaseDetails,
	purchaseCancel,
	purchaseCancelDomain,
	purchaseAddPaymentMethod,
	purchaseChangePaymentMethod,
	billingHistory,
	receiptView,
	paymentMethods,
	addPaymentMethod,
} from './controller';
import { isEnabled } from 'calypso/config';

export default ( router ) => {
	page( '/purchases', siteSelection, navigation, sites, makeLayout, clientRender );

	page( '/purchases/subscriptions', siteSelection, navigation, sites, makeLayout, clientRender );

	page(
		'/purchases/:site',
		siteSelection,
		navigation,
		redirectToPurchases,
		makeLayout,
		clientRender
	);

	page(
		'/purchases/subscriptions/:site',
		siteSelection,
		navigation,
		purchases,
		makeLayout,
		clientRender
	);

	page(
		'/purchases/subscriptions/:site/:purchaseId',
		siteSelection,
		navigation,
		purchaseDetails,
		makeLayout,
		clientRender
	);

	page(
		'/purchases/subscriptions/:site/:purchaseId/cancel',
		siteSelection,
		navigation,
		purchaseCancel,
		makeLayout,
		clientRender
	);

	page(
		'/purchases/subscriptions/:site/:purchaseId/confirm-cancel-domain',
		siteSelection,
		navigation,
		purchaseCancelDomain,
		makeLayout,
		clientRender
	);

	if ( isEnabled( 'purchases/new-payment-methods' ) ) {
		page(
			'/purchases/subscriptions/:site/:purchaseId/payment-method/add',
			siteSelection,
			navigation,
			purchaseAddPaymentMethod,
			makeLayout,
			clientRender
		);

		page(
			'/purchases/subscriptions/:site/:purchaseId/payment-method/change/:cardId',
			siteSelection,
			navigation,
			purchaseChangePaymentMethod,
			makeLayout,
			clientRender
		);

		page(
			'/purchases/add-payment-method/:site',
			siteSelection,
			navigation,
			addPaymentMethod,
			makeLayout,
			clientRender
		);
	} else {
		page(
			'/purchases/subscriptions/:site/:purchaseId/payment/add',
			siteSelection,
			navigation,
			purchaseAddPaymentMethod,
			makeLayout,
			clientRender
		);

		page(
			'/purchases/subscriptions/:site/:purchaseId/payment/edit/:cardId',
			siteSelection,
			navigation,
			purchaseChangePaymentMethod,
			makeLayout,
			clientRender
		);

		page(
			'/purchases/add-credit-card/:site',
			siteSelection,
			navigation,
			addPaymentMethod,
			makeLayout,
			clientRender
		);
	}

	page(
		'/purchases/billing-history/:site',
		siteSelection,
		navigation,
		billingHistory,
		makeLayout,
		clientRender
	);

	page(
		'/purchases/billing-history/:site/:receiptId',
		siteSelection,
		navigation,
		receiptView,
		makeLayout,
		clientRender
	);

	page(
		'/purchases/payment-methods/:site',
		siteSelection,
		navigation,
		paymentMethods,
		makeLayout,
		clientRender
	);

	// Redirect legacy urls
	router( '/purchases/:siteName/:purchaseId', ( { params: { siteName, purchaseId } } ) =>
		page.redirect( `/purchases/subscriptions/${ siteName }/${ purchaseId }` )
	);
	router( '/purchases/:siteName/:purchaseId/cancel', ( { params: { siteName, purchaseId } } ) =>
		page.redirect( `/purchases/subscriptions/${ siteName }/${ purchaseId }/cancel` )
	);
	router(
		'/purchases/:siteName/:purchaseId/confirm-cancel-domain',
		( { params: { siteName, purchaseId } } ) =>
			page.redirect(
				`/purchases/subscriptions/${ siteName }/${ purchaseId }/confirm-cancel-domain`
			)
	);
	router(
		'/purchases/:siteName/:purchaseId/payment/add',
		( { params: { siteName, purchaseId } } ) =>
			isEnabled( 'purchases/new-payment-methods' )
				? page.redirect(
						`/purchases/subscriptions/${ siteName }/${ purchaseId }/payment-method/add`
				  )
				: page.redirect( `/purchases/subscriptions/${ siteName }/${ purchaseId }/payment/add` )
	);
	router(
		'/purchases/:siteName/:purchaseId/payment/edit/:cardId',
		( { params: { siteName, purchaseId, cardId } } ) =>
			isEnabled( 'purchases/new-payment-methods' )
				? page.redirect(
						`/purchases/subscriptions/${ siteName }/${ purchaseId }/payment-method/change/${ cardId }`
				  )
				: page.redirect(
						`/purchases/subscriptions/${ siteName }/${ purchaseId }/payment/edit/${ cardId }`
				  )
	);
};
