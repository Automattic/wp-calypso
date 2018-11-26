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
import * as pendingController from 'me/pending-payments/controller';
import * as membershipsController from 'me/memberships/controller';
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

	if ( config.isEnabled( 'async-payments' ) ) {
		router(
			paths.purchasesRoot + '/pending',
			redirectLoggedOut,
			sidebar,
			pendingController.pendingPayments,
			makeLayout,
			clientRender
		);
	}

	if ( config.isEnabled( 'memberships' ) ) {
		router(
			paths.purchasesRoot + '/memberships',
			redirectLoggedOut,
			sidebar,
			membershipsController.myMemberships,
			makeLayout,
			clientRender
		);
		router(
			paths.purchasesRoot + '/memberships/:subscriptionId',
			redirectLoggedOut,
			sidebar,
			membershipsController.subscription,
			makeLayout,
			clientRender
		);
	}

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

	/**
	 * The siteSelection middleware has been removed from this route.
	 * No selected site!
	 */
	router(
		paths.managePurchase( ':site', ':purchaseId' ),
		redirectLoggedOut,
		sidebar,
		controller.managePurchase,
		makeLayout,
		clientRender
	);

	router(
		paths.cancelPurchase( ':site', ':purchaseId' ),
		redirectLoggedOut,
		sidebar,
		siteSelection,
		controller.cancelPurchase,
		makeLayout,
		clientRender
	);

	router(
		paths.cancelPrivacyProtection( ':site', ':purchaseId' ),
		redirectLoggedOut,
		sidebar,
		siteSelection,
		controller.cancelPrivacyProtection,
		makeLayout,
		clientRender
	);

	router(
		paths.confirmCancelDomain( ':site', ':purchaseId' ),
		redirectLoggedOut,
		sidebar,
		siteSelection,
		controller.confirmCancelDomain,
		makeLayout,
		clientRender
	);

	router(
		paths.addCardDetails( ':site', ':purchaseId' ),
		redirectLoggedOut,
		sidebar,
		siteSelection,
		controller.addCardDetails,
		makeLayout,
		clientRender
	);

	router(
		paths.editCardDetails( ':site', ':purchaseId', ':cardId' ),
		redirectLoggedOut,
		sidebar,
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
