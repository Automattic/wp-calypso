import { isEnabled } from '@automattic/calypso-config';
import page from 'page';
import {
	makeLayout,
	redirectLoggedOut,
	render as clientRender,
	setLocaleMiddleware,
} from 'calypso/controller';
import { recordSiftScienceUser } from 'calypso/lib/siftscience';
import { loggedInSiteSelection, noSite, siteSelection } from 'calypso/my-sites/controller';
import {
	checkout,
	checkoutPending,
	checkoutSiteless,
	checkoutThankYou,
	licensingThankYouManualActivation,
	licensingThankYouManualActivationInstructions,
	licensingThankYouManualActivationLicenseKey,
	licensingThankYouAutoActivation,
	licensingThankYouAutoActivationCompleted,
	jetpackCheckoutThankYou,
	redirectJetpackLegacyPlans,
	redirectToSupportSession,
	upsellNudge,
	upsellRedirect,
} from './controller';

export default function () {
	page( '/checkout*', recordSiftScienceUser );

	page(
		`/checkout/jetpack/:productSlug`,
		setLocaleMiddleware(),
		noSite,
		checkoutSiteless,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/jetpack/thank-you/licensing-auto-activate/:product',
		noSite,
		licensingThankYouAutoActivation,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/jetpack/thank-you/licensing-auto-activate-completed/:product',
		noSite,
		licensingThankYouAutoActivationCompleted,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/jetpack/thank-you/licensing-manual-activate/:product',
		noSite,
		licensingThankYouManualActivation,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/jetpack/thank-you/licensing-manual-activate-instructions/:product',
		noSite,
		licensingThankYouManualActivationInstructions,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/jetpack/thank-you/licensing-manual-activate-license-key/:product',
		noSite,
		licensingThankYouManualActivationLicenseKey,
		makeLayout,
		clientRender
	);

	page(
		`/checkout/jetpack/:siteSlug/:productSlug`,
		setLocaleMiddleware(),
		checkout,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/jetpack/thank-you/:site/:product',
		loggedInSiteSelection,
		jetpackCheckoutThankYou,
		makeLayout,
		clientRender
	);

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

	if ( isEnabled( 'upsell/concierge-session' ) ) {
		// For backwards compatibility, retaining the old URL structure.
		page( '/checkout/:site/add-support-session/:receiptId?', redirectToSupportSession );

		page(
			'/checkout/offer-support-session/:site?',
			redirectLoggedOut,
			siteSelection,
			upsellNudge,
			makeLayout,
			clientRender
		);

		page(
			'/checkout/offer-support-session/:receiptId/:site',
			redirectLoggedOut,
			siteSelection,
			upsellNudge,
			makeLayout,
			clientRender
		);

		page(
			'/checkout/offer-quickstart-session/:site?',
			loggedInSiteSelection,
			upsellNudge,
			makeLayout,
			clientRender
		);

		page(
			'/checkout/offer-quickstart-session/:receiptId/:site',
			redirectLoggedOut,
			siteSelection,
			upsellNudge,
			makeLayout,
			clientRender
		);
	}

	page(
		'/checkout/offer-professional-email/:domain/:receiptId/:site?',
		redirectLoggedOut,
		siteSelection,
		upsellNudge,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/offer/:upsellType/:upsellMeta/:receiptId/:site',
		redirectLoggedOut,
		siteSelection,
		upsellRedirect,
		makeLayout,
		clientRender
	);

	page(
		`/checkout/:domainOrProduct`,
		setLocaleMiddleware(),
		redirectLoggedOut,
		siteSelection,
		redirectJetpackLegacyPlans,
		checkout,
		makeLayout,
		clientRender
	);

	page(
		`/checkout/:product/:domainOrProduct`,
		setLocaleMiddleware(),
		redirectLoggedOut,
		siteSelection,
		redirectJetpackLegacyPlans,
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
