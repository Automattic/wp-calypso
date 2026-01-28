import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	maybeRedirectToMultiSiteDashboard,
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
		maybeRedirectToMultiSiteDashboard( '/me/billing/payment-methods' ),
		sidebar,
		paymentMethodsController.paymentMethods,
		makeLayout,
		clientRender
	);

	router(
		paths.addNewPaymentMethod,
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/billing/payment-methods/add' ),
		sidebar,
		controller.addNewPaymentMethod,
		makeLayout,
		clientRender
	);

	router(
		paths.addCreditCard,
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/billing/payment-methods/add' ),
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
		maybeRedirectToMultiSiteDashboard( '/me/billing/payment-methods/tax-details' ),
		sidebar,
		controller.vatDetails,
		makeLayout,
		clientRender
	);

	router(
		paths.billingHistory,
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/billing/history' ),
		sidebar,
		billingController.billingHistory,
		makeLayout,
		clientRender
	);

	router(
		paths.purchasesRoot + '/other/:subscriptionId',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(
			( params ) => `/me/billing/monetize-subscriptions/${ params.subscriptionId }`
		),
		sidebar,
		membershipsController.subscription,
		makeLayout,
		clientRender
	);

	router(
		paths.purchasesRoot + '/crm-downloads/:subscription',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(
			( params ) => `/me/billing/monetize-subscriptions/${ params.subscription }`
		),
		sidebar,
		controller.crmDownloads,
		makeLayout,
		clientRender
	);

	router(
		paths.purchasesRoot + '/subscription-removed',
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
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( ( params ) => `/me/billing/history/${ params.receiptId }` ),
		sidebar,
		billingController.transaction,
		makeLayout,
		clientRender
	);

	router(
		paths.purchasesRoot,
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/billing/purchases' ),
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
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(
			( params ) => `/me/billing/purchases/${ params.purchaseId }`
		),
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
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(
			( params ) => `/me/billing/purchases/${ params.purchaseId }/cancel`
		),
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
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(
			( params ) => `/me/billing/purchases/${ params.purchaseId }/cancel`
		),
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
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(
			( params ) => `/me/billing/purchases/${ params.purchaseId }/payment-method/change`
		),
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
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(
			( params ) => `me/billing/purchases/${ params.purchaseId }/payment-method/change`
		),
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
