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
import legacyRouter from 'me/purchases';

export default ( router ) => {
	legacyRouter( router );

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
};
