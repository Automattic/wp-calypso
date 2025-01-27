import page from '@automattic/calypso-router';
import {
	makeLayout,
	redirectLoggedOut,
	redirectMyJetpack,
	render as clientRender,
	setLocaleMiddleware,
} from 'calypso/controller';
import { recordSiftScienceUser } from 'calypso/lib/siftscience';
import { loggedInSiteSelection, noSite, siteSelection } from 'calypso/my-sites/controller';
import { getProfessionalEmailCheckoutUpsellPath } from 'calypso/my-sites/email/paths';
import {
	checkout,
	checkoutAkismetSiteless,
	checkoutPending,
	checkoutJetpackSiteless,
	checkoutMarketplaceSiteless,
	checkoutThankYou,
	licensingPendingAsyncActivation,
	licensingThankYouManualActivationInstructions,
	licensingThankYouManualActivationLicenseKey,
	licensingThankYouAutoActivation,
	licensingThankYouAutoActivationCompleted,
	jetpackCheckoutThankYou,
	giftThankYou,
	redirectJetpackLegacyPlans,
	redirectToSupportSession,
	upsellNudge,
	upsellRedirect,
	akismetCheckoutThankYou,
	hundredYearCheckoutThankYou,
	transferDomainToAnyUser,
	checkoutFailedPurchases,
	refreshUserSession,
} from './controller';

export default function () {
	page( '/checkout*', recordSiftScienceUser );

	// Jetpack siteless checkout works logged-out, so do not include redirectLoggedOut or siteSelection.
	page(
		`/checkout/jetpack/:productSlug`,
		setLocaleMiddleware(),
		noSite,
		checkoutJetpackSiteless,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/jetpack/thank-you/licensing-pending-async-activation/:product',
		noSite,
		licensingPendingAsyncActivation,
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
		licensingThankYouManualActivationInstructions,
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
		'/checkout/100-year/thank-you/:site/:receiptId',
		loggedInSiteSelection,
		hundredYearCheckoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		`/checkout/marketplace/:productSlug`,
		setLocaleMiddleware(),
		noSite,
		checkoutMarketplaceSiteless,
		makeLayout,
		clientRender
	);

	page(
		`/checkout/marketplace/:productSlug/renew/:purchaseId`,
		setLocaleMiddleware(),
		redirectLoggedOut,
		noSite,
		checkoutMarketplaceSiteless,
		makeLayout,
		clientRender
	);

	// Akismet siteless checkout works logged-out, so do not include redirectLoggedOut or siteSelection.
	page(
		`/checkout/akismet/:productSlug`,
		setLocaleMiddleware(),
		noSite,
		checkoutAkismetSiteless,
		makeLayout,
		clientRender
	);

	page(
		`/checkout/akismet/:productSlug/renew/:purchaseId`,
		setLocaleMiddleware(),
		redirectLoggedOut,
		noSite,
		checkoutAkismetSiteless,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/akismet/thank-you/:productSlug',
		setLocaleMiddleware(),
		redirectLoggedOut,
		noSite,
		akismetCheckoutThankYou,
		makeLayout,
		clientRender
	);

	// The no-site post-checkout route is for purchases not tied to a site so do
	// not include the `siteSelection` middleware.
	page( '/checkout/gift/thank-you/:site', giftThankYou, makeLayout, clientRender );

	page(
		'/checkout/domain-transfer-to-any-user/thank-you/:domain',
		redirectLoggedOut,
		transferDomainToAnyUser,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/no-site/pending/:orderId',
		refreshUserSession, // Load user session into state in userless checkout
		redirectLoggedOut,
		checkoutPending,
		makeLayout,
		clientRender
	);

	// The no-site post-checkout route is for purchases not tied to a site so do
	// not include the `siteSelection` middleware.
	page(
		'/checkout/thank-you/no-site/:receiptId?',
		refreshUserSession, // Load user session into state in userless checkout
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

	page( '/checkout/failed-purchases', checkoutFailedPurchases, makeLayout, clientRender );

	page( '/checkout/no-site/:lang?', noSite, checkout, makeLayout, clientRender );

	page(
		'/checkout/features/:feature/:domain/:plan_name?',
		redirectLoggedOut,
		siteSelection,
		checkout,
		makeLayout,
		clientRender
	);

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

	page(
		getProfessionalEmailCheckoutUpsellPath( ':site', ':domain', ':receiptId' ),
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
		redirectMyJetpack,
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
		redirectMyJetpack,
		redirectLoggedOut,
		siteSelection,
		redirectJetpackLegacyPlans,
		checkout,
		makeLayout,
		clientRender
	);

	// A renewal link without a site is not allowed, but we send the user to
	// checkout anyway so they can see a helpful error message.
	page(
		'/checkout/:product/renew/:purchaseId',
		redirectLoggedOut,
		noSite,
		checkout,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/:product/renew/:purchaseId/:domain',
		redirectLoggedOut,
		siteSelection,
		checkout,
		makeLayout,
		clientRender
	);

	// Gift purchases work without a site, so do not include the `siteSelection`
	// middleware.
	page( '/checkout/:product/gift/:purchaseId', noSite, checkout, makeLayout, clientRender );

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
