/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import checkoutController, { checkout } from './controller';
import SiftScience from 'lib/siftscience';
import { makeLayout, redirectLoggedOut, render as clientRender } from 'controller';
import { noSite, siteSelection } from 'my-sites/controller';

export default function() {
	SiftScience.recordUser();

	page(
		'/checkout/thank-you/no-site/pending/:orderId',
		redirectLoggedOut,
		siteSelection,
		checkoutController.checkoutPending,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/no-site/:receiptId?',
		redirectLoggedOut,
		noSite,
		checkoutController.checkoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/:site/pending/:orderId',
		redirectLoggedOut,
		siteSelection,
		checkoutController.checkoutPending,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/:site/:receiptId?',
		redirectLoggedOut,
		siteSelection,
		checkoutController.checkoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/:site/:receiptId/with-gsuite/:gsuiteReceiptId',
		redirectLoggedOut,
		siteSelection,
		checkoutController.checkoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/features/:feature/:site/:receiptId?',
		redirectLoggedOut,
		siteSelection,
		checkoutController.checkoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/no-site',
		redirectLoggedOut,
		noSite,
		checkoutController.sitelessCheckout,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/features/:feature/:domain/:plan_name?',
		redirectLoggedOut,
		siteSelection,
		checkout,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/:domain/:product?',
		redirectLoggedOut,
		siteSelection,
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

	page(
		'/checkout/:site/with-gsuite/:domain/:receiptId?',
		redirectLoggedOut,
		siteSelection,
		checkoutController.gsuiteNudge,
		makeLayout,
		clientRender
	);

	// Visting /checkout without a plan or product should be redirected to /plans
	page( '/checkout', '/plans' );
}
