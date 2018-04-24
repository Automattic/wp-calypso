/** @format */

/**
 * External dependencies
 */
import config from 'config';
import page from 'page';

/**
 * Internal Dependencies
 */
import billingController from 'me/billing-history/controller';
import meController from 'me/controller';
import { siteSelection } from 'my-sites/controller';
import controller from './controller';
import * as paths from './paths';
import { makeLayout, render as clientRender } from 'controller';

export default function( router ) {
	if ( config.isEnabled( 'manage/payment-methods' ) ) {
		router(
			paths.addCreditCard,
			meController.sidebar,
			controller.addCreditCard,
			makeLayout,
			clientRender
		);

		// redirect legacy urls
		router( '/payment-methods/add-credit-card', () => page.redirect( paths.addCreditCard ) );
	}

	router(
		paths.billingHistory,
		meController.sidebar,
		billingController.billingHistory,
		makeLayout,
		clientRender
	);

	router(
		paths.billingHistoryReceipt(),
		meController.sidebar,
		billingController.transaction,
		makeLayout,
		clientRender
	);

	router( paths.purchasesRoot, meController.sidebar, controller.list, makeLayout, clientRender );

	router(
		paths.managePurchase(),
		meController.sidebar,
		siteSelection,
		controller.managePurchase,
		makeLayout,
		clientRender
	);

	router(
		paths.cancelPurchase(),
		meController.sidebar,
		siteSelection,
		controller.cancelPurchase,
		makeLayout,
		clientRender
	);

	router(
		paths.cancelPrivacyProtection(),
		meController.sidebar,
		siteSelection,
		controller.cancelPrivacyProtection,
		makeLayout,
		clientRender
	);

	router(
		paths.confirmCancelDomain(),
		meController.sidebar,
		siteSelection,
		controller.confirmCancelDomain,
		makeLayout,
		clientRender
	);

	router(
		paths.addCardDetails(),
		meController.sidebar,
		siteSelection,
		controller.addCardDetails,
		makeLayout,
		clientRender
	);

	router(
		paths.editCardDetails(),
		meController.sidebar,
		siteSelection,
		controller.editCardDetails,
		makeLayout,
		clientRender
	);

	// redirect legacy urls
	router( '/purchases', () => page.redirect( paths.purchasesRoot ) );
	router( '/purchases/:siteName/:purchaseId', ( { params: { siteName, purchaseId } } ) =>
		page.redirect( paths.managePurchase( siteName, purchaseId ) )
	);
	router( '/purchases/:siteName/:purchaseId/cancel', ( { params: { siteName, purchaseId } } ) =>
		page.redirect( paths.cancelPurchase( siteName, purchaseId ) )
	);
	router(
		'/purchases/:siteName/:purchaseId/cancel-private-registration',
		( { params: { siteName, purchaseId } } ) =>
			page.redirect( paths.cancelPrivacyProtection( siteName, purchaseId ) )
	);
	router(
		'/purchases/:siteName/:purchaseId/confirm-cancel-domain',
		( { params: { siteName, purchaseId } } ) =>
			page.redirect( paths.confirmCancelDomain( siteName, purchaseId ) )
	);
	router(
		'/purchases/:siteName/:purchaseId/payment/add',
		( { params: { siteName, purchaseId } } ) =>
			page.redirect( paths.addCardDetails( siteName, purchaseId ) )
	);
	router(
		'/purchases/:siteName/:purchaseId/payment/edit/:cardId',
		( { params: { siteName, purchaseId, cardId } } ) =>
			page.redirect( paths.editCardDetails( siteName, purchaseId, cardId ) )
	);
	router( '/me/billing', () => page.redirect( paths.billingHistory ) );
	router( '/me/billing/:receiptId', ( { params: { receiptId } } ) =>
		page.redirect( paths.billingHistoryReceipt( receiptId ) )
	);
}
