/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	checkout,
	checkoutPending,
	checkoutThankYou,
	gsuiteNudge,
	upsellNudge,
	redirectToSupportSession,
	redirectJetpackLegacyPlans,
	userlessCheckoutThankYou,
} from './controller';
import { noop } from './utils';
import SiftScience from 'calypso/lib/siftscience';
import { makeLayout, redirectLoggedOut, render as clientRender } from 'calypso/controller';
import { noSite, siteSelection } from 'calypso/my-sites/controller';
import { isEnabled } from '@automattic/calypso-config';
import userFactory from 'calypso/lib/user';

export default function () {
	SiftScience.recordUser();

	const user = userFactory();
	const isLoggedOut = ! user.get();

	if ( isLoggedOut ) {
		if ( isEnabled( 'jetpack/userless-checkout' ) ) {
			page( '/checkout/jetpack/:siteSlug/:productSlug', checkout, makeLayout, clientRender );
			page(
				'/checkout/jetpack/thank-you/:site/:product',
				userlessCheckoutThankYou,
				makeLayout,
				clientRender
			);
		}

		page( '/checkout/offer-quickstart-session', upsellNudge, makeLayout, clientRender );

		page( '/checkout/no-site/:lang?', noSite, checkout, makeLayout, clientRender );

		page( '/checkout*', redirectLoggedOut );

		return;
	}

	// Handle logged-in user visiting Jetpack checkout
	if ( isEnabled( 'jetpack/userless-checkout' ) ) {
		page(
			'/checkout/jetpack/:product/:domainOrProduct',
			siteSelection,
			checkout,
			makeLayout,
			clientRender
		);
		page(
			'/checkout/jetpack/thank-you/:site/:product',
			siteSelection,
			userlessCheckoutThankYou,
			makeLayout,
			clientRender
		);
	}

	// Show these paths only for logged in users
	page(
		'/checkout/thank-you/no-site/pending/:orderId',
		siteSelection,
		checkoutPending,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/no-site/:receiptId?',
		noSite,
		checkoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/:site/pending/:orderId',
		siteSelection,
		checkoutPending,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/:site/:receiptId?',
		siteSelection,
		checkoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/:site/:receiptId/with-gsuite/:gsuiteReceiptId',
		siteSelection,
		checkoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/features/:feature/:site/:receiptId?',
		siteSelection,
		checkoutThankYou,
		makeLayout,
		clientRender
	);

	page( '/checkout/no-site', noSite, checkout, makeLayout, clientRender );

	page(
		'/checkout/features/:feature/:domain/:plan_name?',
		siteSelection,
		checkout,
		makeLayout,
		clientRender
	);

	if ( isEnabled( 'upsell/concierge-session' ) ) {
		// For backwards compatibility, retaining the old URL structure.
		page( '/checkout/:site/add-support-session/:receiptId?', redirectToSupportSession );

		page(
			'/checkout/offer-support-session/:site?',
			siteSelection,
			upsellNudge,
			makeLayout,
			clientRender
		);

		page(
			'/checkout/offer-support-session/:receiptId/:site',
			siteSelection,
			upsellNudge,
			makeLayout,
			clientRender
		);

		page(
			'/checkout/offer-quickstart-session/:site?',
			siteSelection,
			upsellNudge,
			makeLayout,
			clientRender
		);

		page(
			'/checkout/offer-quickstart-session/:receiptId/:site',
			siteSelection,
			upsellNudge,
			makeLayout,
			clientRender
		);
	}

	page(
		'/checkout/:domainOrProduct',
		siteSelection,
		isEnabled( 'jetpack/redirect-legacy-plans' ) ? redirectJetpackLegacyPlans : noop,
		checkout,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/:product/:domainOrProduct',
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
		siteSelection,
		checkout,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/:site/with-gsuite/:domain/:receiptId?',
		siteSelection,
		gsuiteNudge,
		makeLayout,
		clientRender
	);

	// Visiting /checkout without a plan or product should be redirected to /plans
	page( '/checkout', isEnabled( 'jetpack-cloud/connect' ) ? '/plans' : '/pricing' );

	page(
		'/checkout/:site/offer-plan-upgrade/:upgradeItem/:receiptId?',
		siteSelection,
		upsellNudge,
		makeLayout,
		clientRender
	);
}
