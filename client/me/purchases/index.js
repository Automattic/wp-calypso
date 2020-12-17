/**
 * External dependencies
 */
import config from 'calypso/config';
import page from 'page';

/**
 * Internal Dependencies
 */
import * as paymentMethodsController from 'calypso/me/purchases/payment-methods/controller';
import * as billingController from 'calypso/me/purchases/billing-history/controller';
import * as pendingController from 'calypso/me/pending-payments/controller';
import * as membershipsController from 'calypso/me/memberships/controller';
import * as controller from './controller';
import * as paths from './paths';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/me/controller';
import { siteSelection } from 'calypso/my-sites/controller';

export default ( router ) => {
	if ( config.isEnabled( 'manage/payment-methods' ) ) {
		router(
			paths.paymentMethods,
			sidebar,
			paymentMethodsController.paymentMethods,
			makeLayout,
			clientRender
		);

		if ( config.isEnabled( 'purchases/new-payment-methods' ) ) {
			router(
				paths.addNewPaymentMethod,
				sidebar,
				controller.addNewPaymentMethod,
				makeLayout,
				clientRender
			);
		}

		router(
			paths.addCreditCard,
			sidebar,
			config.isEnabled( 'purchases/new-payment-methods' )
				? controller.addNewPaymentMethod
				: controller.addCreditCard,
			makeLayout,
			clientRender
		);

		// redirect legacy urls
		router( '/payment-methods/add-credit-card', () => {
			config.isEnabled( 'purchases/new-payment-methods' )
				? page.redirect( paths.addCreditCard )
				: page.redirect( paths.addNewPaymentMethod );
		} );
	}

	router(
		paths.billingHistory,
		sidebar,
		billingController.billingHistory,
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
		paths.purchasesRoot + '/other/:subscriptionId',
		sidebar,
		membershipsController.subscription,
		makeLayout,
		clientRender
	);

	// Legacy:

	router( paths.deprecated.upcomingCharges, () => page.redirect( paths.purchasesRoot ) );
	router( paths.deprecated.otherPurchases, () => page.redirect( paths.purchasesRoot ) );

	router(
		paths.purchasesRoot + '/memberships/:subscriptionId',
		( { params: { subscriptionId } } ) => {
			page.redirect( paths.purchasesRoot + '/other/' + subscriptionId );
		}
	);

	router( paths.purchasesRoot + '/memberships', () => page.redirect( paths.purchasesRoot ) );

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

	if ( config.isEnabled( 'purchases/new-payment-methods' ) ) {
		router(
			paths.addPaymentMethod( ':site', ':purchaseId' ),
			sidebar,
			siteSelection,
			controller.changePaymentMethod,
			makeLayout,
			clientRender
		);

		router(
			paths.changePaymentMethod( ':site', ':purchaseId', ':cardId' ),
			sidebar,
			siteSelection,
			controller.changePaymentMethod,
			makeLayout,
			clientRender
		);
	} else {
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
	}

	// redirect legacy urls
	router( '/me/billing', () => page.redirect( paths.billingHistory ) );
	router( '/me/billing/:receiptId', ( { params: { receiptId } } ) =>
		page.redirect( paths.billingHistoryReceipt( receiptId ) )
	);
};
