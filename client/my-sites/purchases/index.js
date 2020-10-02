/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import {
	purchases,
	redirectToPurchases,
	purchaseDetails,
	purchaseCancel,
	purchaseCancelDomain,
	purchaseAddPaymentMethod,
	purchaseEditPaymentMethod,
} from './controller';

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
		purchaseEditPaymentMethod,
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
			page.redirect( `/purchases/subscriptions/${ siteName }/${ purchaseId }/payment/add` )
	);
	router(
		'/purchases/:siteName/:purchaseId/payment/edit/:cardId',
		( { params: { siteName, purchaseId, cardId } } ) =>
			page.redirect(
				`/purchases/subscriptions/${ siteName }/${ purchaseId }/payment/edit/${ cardId }`
			)
	);
};
