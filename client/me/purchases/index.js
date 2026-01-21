import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfMultiSiteDashboardForcedOptIn,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { sidebar } from 'calypso/me/controller';
import * as membershipsController from 'calypso/me/memberships/controller';
import * as billingController from 'calypso/me/purchases/billing-history/controller';
import * as paymentMethodsController from 'calypso/me/purchases/payment-methods/controller';
import { siteSelection } from 'calypso/my-sites/controller';
import * as controller from './controller';
import * as paths from './paths';

export default ( router ) => {
	router(
		paths.paymentMethods,
		setupPreferences,
		redirectIfMultiSiteDashboardForcedOptIn( '/me/billing/payment-methods' ),
		sidebar,
		paymentMethodsController.paymentMethods,
		makeLayout,
		clientRender
	);

	router(
		paths.addNewPaymentMethod,
		setupPreferences,
		redirectIfMultiSiteDashboardForcedOptIn( '/me/billing/payment-methods/add' ),
		sidebar,
		controller.addNewPaymentMethod,
		makeLayout,
		clientRender
	);

	router(
		paths.addCreditCard,
		setupPreferences,
		redirectIfMultiSiteDashboardForcedOptIn( '/me/billing/payment-methods/add' ),
		sidebar,
		controller.addNewPaymentMethod,
		makeLayout,
		clientRender
	);

	// redirect legacy urls
	router( '/payment-methods/add-credit-card', () => {
		page.redirect( paths.addCreditCard );
	} );

	router(
		paths.vatDetails,
		setupPreferences,
		redirectIfMultiSiteDashboardForcedOptIn( '/me/billing/payment-methods/tax-details' ),
		sidebar,
		controller.vatDetails,
		makeLayout,
		clientRender
	);

	router(
		paths.billingHistory,
		setupPreferences,
		redirectIfMultiSiteDashboardForcedOptIn( '/me/billing/history' ),
		sidebar,
		billingController.billingHistory,
		makeLayout,
		clientRender
	);

	router(
		paths.purchasesRoot + '/other/:subscriptionId',
		setupPreferences,
		redirectIfMultiSiteDashboardForcedOptIn( '/me/billing/history' ),
		sidebar,
		membershipsController.subscription,
		makeLayout,
		clientRender
	);

	router(
		paths.purchasesRoot + '/crm-downloads/:subscription',
		setupPreferences,
		redirectIfMultiSiteDashboardForcedOptIn( '/me/billing/history' ),
		sidebar,
		controller.crmDownloads,
		makeLayout,
		clientRender
	);

	router(
		paths.purchasesRoot + '/subscription-removed',
		setupPreferences,
		redirectIfMultiSiteDashboardForcedOptIn( '/me/billing/history' ),
		sidebar,
		membershipsController.cancelledSubscriptionReturnFromRedirect,
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

	router(
		paths.managePurchaseByOwnership( ':ownershipId' ),
		sidebar,
		controller.managePurchaseByOwnership,
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
		paths.downgradePurchase( ':site', ':purchaseId' ),
		sidebar,
		controller.downgradePurchase,
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

	/**
	 * The siteSelection middleware has been removed from this route.
	 * No selected site!
	 */
	router(
		paths.addPaymentMethod( ':site', ':purchaseId' ),
		sidebar,
		controller.changePaymentMethod,
		makeLayout,
		clientRender
	);

	/**
	 * The siteSelection middleware has been removed from this route.
	 * No selected site!
	 */
	router(
		paths.changePaymentMethod( ':site', ':purchaseId', ':cardId' ),
		sidebar,
		controller.changePaymentMethod,
		makeLayout,
		clientRender
	);

	// redirect legacy urls
	router( '/me/billing', () => page.redirect( paths.billingHistory ) );
	router( '/me/billing/:receiptId', ( { params: { receiptId } } ) =>
		page.redirect( paths.billingHistoryReceipt( receiptId ) )
	);
	router( paths.addCardDetails( ':site', ':purchaseId' ), ( { params: { site, purchaseId } } ) =>
		page.redirect( paths.addPaymentMethod( site, purchaseId ) )
	);
	router(
		paths.editCardDetails( ':site', ':purchaseId', ':cardId' ),
		( { params: { site, purchaseId, cardId } } ) =>
			page.redirect( paths.changePaymentMethod( site, purchaseId, cardId ) )
	);
};
