import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/me/controller';
import * as membershipsController from 'calypso/me/memberships/controller';
import { redirectToMultiSiteDashboard, redirectPurchaseByOwnershipToDashboard } from './controller';
import * as paths from './paths';

export default ( router ) => {
	router( paths.paymentMethods, redirectToMultiSiteDashboard( '/me/billing/payment-methods' ) );

	router(
		paths.addNewPaymentMethod,
		redirectToMultiSiteDashboard( '/me/billing/payment-methods/add' )
	);

	router( paths.addCreditCard, redirectToMultiSiteDashboard( '/me/billing/payment-methods/add' ) );

	// redirect legacy urls
	router( '/payment-methods/add-credit-card', () => {
		page.redirect( paths.addCreditCard );
	} );

	router(
		paths.vatDetails,
		redirectToMultiSiteDashboard( '/me/billing/payment-methods/tax-details' )
	);

	router( paths.billingHistory, redirectToMultiSiteDashboard( '/me/billing/history' ) );

	router(
		paths.purchasesRoot + '/other/:subscriptionId',
		redirectToMultiSiteDashboard(
			( params ) => `/me/billing/monetize-subscriptions/${ params.subscriptionId }`
		)
	);

	router(
		paths.purchasesRoot + '/crm-downloads/:subscription',
		redirectToMultiSiteDashboard(
			( params ) => `/me/billing/monetize-subscriptions/${ params.subscription }`
		)
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
	router(
		paths.deprecated.otherPurchases,
		redirectToMultiSiteDashboard( '/me/billing/monetize-subscriptions' )
	);

	router(
		paths.purchasesRoot + '/memberships/:subscriptionId',
		( { params: { subscriptionId } } ) => {
			page.redirect( paths.purchasesRoot + '/other/' + subscriptionId );
		}
	);

	router( paths.purchasesRoot + '/memberships', () => page.redirect( paths.purchasesRoot ) );

	router(
		paths.billingHistoryReceipt( ':receiptId' ),
		redirectToMultiSiteDashboard( ( params ) => `/me/billing/history/${ params.receiptId }` )
	);

	router( paths.purchasesRoot, redirectToMultiSiteDashboard( '/me/billing/purchases' ) );

	router(
		paths.managePurchase( ':site', ':purchaseId' ),
		redirectToMultiSiteDashboard( ( params ) => `/me/billing/purchases/${ params.purchaseId }` )
	);

	router(
		paths.managePurchaseByOwnership( ':ownershipId' ),
		redirectPurchaseByOwnershipToDashboard
	);

	router(
		paths.cancelPurchase( ':site', ':purchaseId' ),
		redirectToMultiSiteDashboard(
			( params ) => `/me/billing/purchases/${ params.purchaseId }/cancel`
		)
	);

	router(
		paths.siteActionInterstitial( ':site', ':purchaseId' ),
		redirectToMultiSiteDashboard(
			( params ) => `/me/billing/purchases/${ params.purchaseId }/site-level-actions`
		)
	);

	router(
		paths.confirmCancelDomain( ':site', ':purchaseId' ),
		redirectToMultiSiteDashboard(
			( params ) => `/me/billing/purchases/${ params.purchaseId }/cancel`
		)
	);

	router(
		paths.addPaymentMethod( ':site', ':purchaseId' ),
		redirectToMultiSiteDashboard(
			( params ) => `/me/billing/purchases/${ params.purchaseId }/payment-method/change`
		)
	);

	router(
		paths.changePaymentMethod( ':site', ':purchaseId', ':cardId' ),
		redirectToMultiSiteDashboard(
			( params ) => `/me/billing/purchases/${ params.purchaseId }/payment-method/change`
		)
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
