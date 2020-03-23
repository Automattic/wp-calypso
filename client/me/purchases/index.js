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
import { makeLayout, render as clientRender } from 'controller';
import { sidebar } from 'me/controller';
import { siteSelection } from 'my-sites/controller';
import reducer from 'state/concierge/reducer';

export default async ( router, addReducer ) => {
	await addReducer( [ 'concierge' ], reducer );

	if ( config.isEnabled( 'manage/payment-methods' ) ) {
		router( paths.addCreditCard, sidebar, controller.addCreditCard, makeLayout, clientRender );

		// redirect legacy urls
		router( '/payment-methods/add-credit-card', () => page.redirect( paths.addCreditCard ) );
	}

	router(
		paths.billingHistory,
		sidebar,
		billingController.billingHistory,
		makeLayout,
		clientRender
	);

	router(
		paths.upcomingCharges,
		sidebar,
		billingController.upcomingCharges,
		makeLayout,
		clientRender
	);

	if ( config.isEnabled( 'async-payments' ) ) {
		router(
			paths.purchasesRoot + '/pending',
			sidebar,
			pendingController.pendingPayments,
			makeLayout,
			clientRender
		);
	}

	router(
		paths.purchasesRoot + '/other',
		sidebar,
		membershipsController.myMemberships,
		makeLayout,
		clientRender
	);
	router(
		paths.purchasesRoot + '/other/:subscriptionId',
		sidebar,
		membershipsController.subscription,
		makeLayout,
		clientRender
	);
	// Legacy:
	router(
		paths.purchasesRoot + '/memberships/:subscriptionId',
		( { params: { subscriptionId } } ) => {
			page.redirect( paths.purchasesRoot + '/other/' + subscriptionId );
		}
	);
	router( paths.purchasesRoot + '/memberships', () =>
		page.redirect( paths.purchasesRoot + '/other' )
	);

	router(
		paths.billingHistoryReceipt( ':receiptId' ),
		sidebar,
		billingController.transaction,
		makeLayout,
		clientRender
	);

	router( paths.purchasesRoot, sidebar, controller.list, makeLayout, clientRender );

	/**
	 * The siteSelection middleware has been removed from this route.
	 * No selected site!
	 */
	router(
		paths.managePurchase( ':site', ':purchaseId' ),
		sidebar,
		controller.managePurchase,
		makeLayout,
		clientRender
	);

	/**
	 * The siteSelection middleware has been removed from this route.
	 * No selected site!
	 */
	router(
		paths.cancelPurchase( ':site', ':purchaseId' ),
		sidebar,
		controller.cancelPurchase,
		makeLayout,
		clientRender
	);

	router(
		paths.confirmCancelDomain( ':site', ':purchaseId' ),
		sidebar,
		siteSelection,
		controller.confirmCancelDomain,
		makeLayout,
		clientRender
	);

	router(
		paths.addCardDetails( ':site', ':purchaseId' ),
		sidebar,
		siteSelection,
		controller.addCardDetails,
		makeLayout,
		clientRender
	);

	router(
		paths.editCardDetails( ':site', ':purchaseId', ':cardId' ),
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
};
