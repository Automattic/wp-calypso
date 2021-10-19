import { isEnabled } from '@automattic/calypso-config';
import page from 'page';
import { makeLayout, redirectLoggedOut, render as clientRender } from 'calypso/controller';
import { recordSiftScienceUser } from 'calypso/lib/siftscience';
import { loggedInSiteSelection, noSite, siteSelection } from 'calypso/my-sites/controller';
import {
	checkout,
	checkoutPending,
	checkoutSiteless,
	checkoutThankYou,
	jetpackCheckoutThankYou,
	jetpackCheckoutThankYouCompleted,
	redirectJetpackLegacyPlans,
	upsellNudge,
} from './controller';
import { noop } from './utils';

export default function () {
	page( '/checkout*', recordSiftScienceUser );

	if ( isEnabled( 'jetpack/siteless-checkout' ) ) {
		page(
			'/checkout/jetpack/schedule-happiness-appointment',
			noSite,
			jetpackCheckoutThankYou,
			makeLayout,
			clientRender
		);
		page( '/checkout/jetpack/:productSlug', noSite, checkoutSiteless, makeLayout, clientRender );
		page(
			'/checkout/jetpack/thank-you-completed/no-site/:product',
			noSite,
			jetpackCheckoutThankYouCompleted,
			makeLayout,
			clientRender
		);
		page(
			'/checkout/jetpack/thank-you/no-site/:product',
			noSite,
			jetpackCheckoutThankYou,
			makeLayout,
			clientRender
		);
	}

	if ( isEnabled( 'jetpack/userless-checkout' ) ) {
		page( '/checkout/jetpack/:siteSlug/:productSlug', checkout, makeLayout, clientRender );
		page(
			'/checkout/jetpack/thank-you/:site/:product',
			loggedInSiteSelection,
			jetpackCheckoutThankYou,
			makeLayout,
			clientRender
		);
	}

	page(
		'/checkout/thank-you/no-site/pending/:orderId',
		redirectLoggedOut,
		siteSelection,
		checkoutPending,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/no-site/:receiptId?',
		redirectLoggedOut,
		noSite,
		checkoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/:site/pending/:orderId',
		redirectLoggedOut,
		siteSelection,
		checkoutPending,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/:site/:receiptId?',
		redirectLoggedOut,
		siteSelection,
		checkoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/:site/:receiptId/with-gsuite/:gsuiteReceiptId',
		redirectLoggedOut,
		siteSelection,
		checkoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/features/:feature/:site/:receiptId?',
		redirectLoggedOut,
		siteSelection,
		checkoutThankYou,
		makeLayout,
		clientRender
	);

	page( '/checkout/no-site/:lang?', noSite, checkout, makeLayout, clientRender );

	page(
		'/checkout/features/:feature/:domain/:plan_name?',
		redirectLoggedOut,
		siteSelection,
		checkout,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/offer-professional-email/:receiptId/:site',
		redirectLoggedOut,
		siteSelection,
		upsellNudge,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/:domainOrProduct',
		redirectLoggedOut,
		siteSelection,
		isEnabled( 'jetpack/redirect-legacy-plans' ) ? redirectJetpackLegacyPlans : noop,
		checkout,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/:product/:domainOrProduct',
		redirectLoggedOut,
		siteSelection,
		isEnabled( 'jetpack/redirect-legacy-plans' ) ? redirectJetpackLegacyPlans : noop,
		checkout,
		makeLayout,
		clientRender
	);

	// Visiting /renew without a domain is invalid and should be redirected to /me/purchases
	page( '/checkout/:product/renew/:purchaseId', '/me/purchases' );

	page(
		'/checkout/:product/renew/:purchaseId/:domain',
		redirectLoggedOut,
		siteSelection,
		checkout,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/:site/with-gsuite/:domain/:receiptId?',
		redirectLoggedOut,
		siteSelection,
		makeLayout,
		clientRender
	);

	// Visiting /checkout without a plan or product should be redirected to /plans
	page( '/checkout', '/plans' );

	page(
		'/checkout/:site/offer-plan-upgrade/:upgradeItem/:receiptId?',
		redirectLoggedOut,
		siteSelection,
		upsellNudge,
		makeLayout,
		clientRender
	);

	page( '/checkout*', redirectLoggedOut );
}
