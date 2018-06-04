/** @format */

/**
 * External dependencies
 */
import config from 'config';
import page from 'page';

/**
 * Internal Dependencies
 */
import * as billingController from 'me/billing-history/controller';
import * as controller from './controller';
import * as paths from './paths';
import { makeLayout, redirectLoggedOut, render as clientRender } from 'controller';
import { sidebar } from 'me/controller';
import { siteSelection } from 'my-sites/controller';

export default function( router ) {
	if ( config.isEnabled( 'manage/payment-methods' ) ) {
		router(
			paths.addCreditCard,
			redirectLoggedOut,
			sidebar,
			controller.addCreditCard,
			makeLayout,
			clientRender
		);

		// redirect legacy urls
		router( '/payment-methods/add-credit-card', () => page.redirect( paths.addCreditCard ) );
	}

	router(
		paths.billingHistory,
		redirectLoggedOut,
		sidebar,
		billingController.billingHistory,
		makeLayout,
		clientRender
	);

	router(
		paths.billingHistoryReceipt( ':receiptId' ),
		redirectLoggedOut,
		sidebar,
		billingController.transaction,
		makeLayout,
		clientRender
	);

	router(
		paths.purchasesRoot,
		redirectLoggedOut,
		sidebar,
		controller.list,
		makeLayout,
		clientRender
	);

	router(
		paths.managePurchase( ':purchaseId' ),
		redirectLoggedOut,
		sidebar,
		siteSelection,
		controller.managePurchase,
		makeLayout,
		clientRender
	);

	router(
		paths.cancelPurchase( ':purchaseId' ),
		redirectLoggedOut,
		sidebar,
		siteSelection,
		controller.cancelPurchase,
		makeLayout,
		clientRender
	);

	router(
		paths.cancelPrivacyProtection( ':purchaseId' ),
		redirectLoggedOut,
		sidebar,
		controller.cancelPrivacyProtection,
		makeLayout,
		clientRender
	);

	router(
		paths.confirmCancelDomain( ':purchaseId' ),
		redirectLoggedOut,
		sidebar,
		siteSelection,
		controller.confirmCancelDomain,
		makeLayout,
		clientRender
	);

	router(
		paths.addCardDetails( ':purchaseId' ),
		redirectLoggedOut,
		sidebar,
		controller.addCardDetails,
		makeLayout,
		clientRender
	);

	router(
		paths.editCardDetails( ':purchaseId', ':cardId' ),
		redirectLoggedOut,
		sidebar,
		siteSelection,
		controller.editCardDetails,
		makeLayout,
		clientRender
	);

	// redirect legacy urls
	router( '/purchases', () => page.redirect( paths.purchasesRoot ) );

	router( '/:_(me)?/purchases/:_/:purchaseId', ( { params: { purchaseId } } ) =>
		page.redirect( paths.managePurchase( purchaseId ) )
	);

	router( '/:_(me)?/purchases/:_/:purchaseId/cancel', ( { params: { purchaseId } } ) =>
		page.redirect( paths.cancelPurchase( purchaseId ) )
	);

	router(
		'/:_(me)?/purchases/:_/:purchaseId/cancel-private-registration',
		( { params: { purchaseId } } ) => page.redirect( paths.cancelPrivacyProtection( purchaseId ) )
	);

	router(
		'/:_(me)?/purchases/:_/:purchaseId/confirm-cancel-domain',
		( { params: { purchaseId } } ) => page.redirect( paths.confirmCancelDomain( purchaseId ) )
	);

	router( '/:_(me)?/purchases/:_/:purchaseId/payment/add', ( { params: { purchaseId } } ) =>
		page.redirect( paths.addCardDetails( purchaseId ) )
	);

	router(
		'/:_(me)?/purchases/:_/:purchaseId/payment/edit/:cardId',
		( { params: { purchaseId, cardId } } ) =>
			page.redirect( paths.editCardDetails( purchaseId, cardId ) )
	);

	router( '/me/billing', () => page.redirect( paths.billingHistory ) );
	router( '/me/billing/:receiptId', ( { params: { receiptId } } ) =>
		page.redirect( paths.billingHistoryReceipt( receiptId ) )
	);
}
