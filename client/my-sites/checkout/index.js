/**
 * External dependencies
 */
import page from 'page';
import { isEnabled } from '@automattic/calypso-config';
import { JETPACK_LEGACY_PLANS } from '@automattic/calypso-products';

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
} from './controller';
import SiftScience from 'calypso/lib/siftscience';
import { makeLayout, redirectLoggedOut, render as clientRender } from 'calypso/controller';
import { noSite, siteSelection } from 'calypso/my-sites/controller';
import userFactory from 'calypso/lib/user';

export default function () {
	SiftScience.recordUser();

	if ( isEnabled( 'jetpack/redirect-legacy-plans' ) ) {
		page(
			`/checkout/:product(${ JETPACK_LEGACY_PLANS.join( '|' ) })/:site`,
			redirectJetpackLegacyPlans
		);

		page(
			`/checkout/:site/:product(${ JETPACK_LEGACY_PLANS.join( '|' ) })`,
			redirectJetpackLegacyPlans
		);
	}

	const user = userFactory();
	const isLoggedOut = ! user.get();

	if ( isLoggedOut ) {
		page( '/checkout/offer-quickstart-session', upsellNudge, makeLayout, clientRender );

		page( '/checkout/no-site/:lang?', noSite, checkout, makeLayout, clientRender );

		page( '/checkout*', redirectLoggedOut );

		return;
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
		'/checkout/:site/offer-difm/:receiptId?',
		siteSelection,
		upsellNudge,
		makeLayout,
		clientRender
	);

	page( '/checkout/:domainOrProduct', siteSelection, checkout, makeLayout, clientRender );

	page( '/checkout/:product/:domainOrProduct', siteSelection, checkout, makeLayout, clientRender );

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
