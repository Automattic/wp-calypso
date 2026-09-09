/**
 * @jest-environment jsdom
 */
import * as appRouterMe from 'calypso/dashboard/app/router/me';
import '../router';

/**
 * Importing the backport router re-homes the Dashboard's billing routes onto the
 * site-level URLs. Every link, redirect and `useParams()` call in
 * `client/dashboard/me/billing-purchases` reads these routes directly, so these
 * paths are what make the Dashboard screens address the classic URLs.
 */
describe( 'site-level purchases backport router', () => {
	it.each( [
		[ appRouterMe.purchasesRoute, '/purchases/subscriptions/$siteSlug' ],
		[ appRouterMe.purchaseSettingsRoute, '/purchases/subscriptions/$siteSlug/$purchaseId' ],
		[ appRouterMe.cancelPurchaseRoute, '/purchases/subscriptions/$siteSlug/$purchaseId/cancel' ],
		[
			appRouterMe.changePaymentMethodRoute,
			'/purchases/subscriptions/$siteSlug/$purchaseId/payment-method/change',
		],
		[
			appRouterMe.siteActionsRoute,
			'/purchases/subscriptions/$siteSlug/$purchaseId/site-actions/$action',
		],
		[ appRouterMe.billingHistoryRoute, '/purchases/billing-history/$siteSlug' ],
		[ appRouterMe.receiptRoute, '/purchases/billing-history/$siteSlug/$receiptId' ],
		[ appRouterMe.paymentMethodsRoute, '/purchases/payment-methods/$siteSlug' ],
		[ appRouterMe.addPaymentMethodRoute, '/purchases/payment-methods/$siteSlug/add' ],
	] )( 'serves %# at the site-level URL', ( route, expected ) => {
		expect( route.fullPath ).toBe( expected );
	} );
} );
